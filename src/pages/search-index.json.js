import { getCollection } from 'astro:content';

/**
 * Genera /search-index.json en tiempo de build.
 * Para cada capítulo, trocea el contenido en secciones (por encabezado)
 * y guarda texto plano buscable. El cliente lo descarga una vez y busca
 * localmente: sin servidor, instantáneo.
 */
export async function GET() {
  const capitulos = await getCollection('capitulos');
  const ordenados = capitulos.sort((a, b) => a.data.numero - b.data.numero);

  const registros = [];

  for (const cap of ordenados) {
    const { numero, titulo, slug } = cap.data;
    const cuerpo = cap.body || '';

    // Trocear por encabezados ## o ###
    const lineas = cuerpo.split('\n');
    let seccionActual = { encabezado: titulo, ancla: '', texto: [] };
    const secciones = [];

    const pushSeccion = () => {
      const texto = seccionActual.texto.join(' ').trim();
      if (texto || secciones.length === 0) {
        secciones.push({ ...seccionActual, texto });
      }
    };

    let enCodigo = false;
    for (const linea of lineas) {
      if (/^\s*(```|~~~)/.test(linea)) {
        enCodigo = !enCodigo;
        continue;
      }
      if (enCodigo) continue;

      const m = linea.match(/^(#{2,3})\s+(.*)$/);
      if (m) {
        pushSeccion();
        const enc = m[2].trim();
        seccionActual = {
          encabezado: enc,
          ancla: slugifyHeading(enc),
          texto: [],
        };
      } else {
        const limpio = limpiarMarkdown(linea);
        if (limpio) seccionActual.texto.push(limpio);
      }
    }
    pushSeccion();

    for (const sec of secciones) {
      registros.push({
        capNumero: numero,
        capTitulo: titulo,
        slug,
        encabezado: sec.encabezado,
        ancla: sec.ancla,
        // recortar para mantener el índice ligero
        texto: sec.texto.slice(0, 500),
      });
    }
  }

  return new Response(JSON.stringify(registros), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function limpiarMarkdown(s) {
  return s
    .replace(/`[^`]*`/g, ' ')          // código en línea
    .replace(/\$[^$]*\$/g, ' ')        // matemáticas en línea
    .replace(/\\\[[\s\S]*?\\\]/g, ' ') // bloques de fórmula
    .replace(/[#>*_|\\-]/g, ' ')       // símbolos markdown
    .replace(/\s+/g, ' ')
    .trim();
}

function slugifyHeading(str) {
  // Coincide con la generación de id de Astro/github-slugger:
  // minúsculas, espacios a guiones, conserva letras acentuadas.
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

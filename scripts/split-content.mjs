/**
 * split-content.mjs
 * ------------------
 * Toma el documento maestro (TeoriaMDR1.md) y lo divide en un archivo
 * .mdx por capitulo dentro de src/content/capitulos/.
 *
 * Cada archivo recibe frontmatter con: titulo, numero, parte, slug y orden.
 * Tambien genera src/data/toc.json con el indice completo para la navegacion.
 *
 * Idempotente: se puede correr cuantas veces se quiera (regenera todo).
 *
 * Uso:  node scripts/split-content.mjs [ruta-al-md]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Fuente: argumento CLI, o el archivo subido, o una copia local.
const SOURCE =
  process.argv[2] ||
  process.env.SOURCE_MD ||
  path.resolve(ROOT, 'content-src', 'TeoriaMDR1.md');

const OUT_DIR = path.resolve(ROOT, 'src', 'content', 'capitulos');
const DATA_DIR = path.resolve(ROOT, 'src', 'data');

// --- utilidades -----------------------------------------------------------

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Escapa caracteres que rompen el frontmatter YAML dentro de comillas.
function yamlSafe(str) {
  return str.replace(/"/g, '\\"');
}

/**
 * Normaliza la jerarquia de encabezados de un capitulo.
 * El documento original usa "# " para casi todo, lo que aplana la estructura.
 * - Elimina las dos primeras lineas "# Capitulo N" y "# Titulo" (van en frontmatter).
 * - Desplaza el resto un nivel hacia abajo respetando bloques de codigo:
 *     "# "  -> "## "   (seccion)
 *     "## " -> "### "  (subseccion)
 *     "### "-> "#### "
 * Asi cada pagina tiene un solo H1 (el del layout) y un arbol navegable.
 */
/**
 * Convierte los delimitadores LaTeX clásicos a los que entiende remark-math:
 *   \[ ... \]  ->  $$ ... $$   (bloque)
 *   \( ... \)  ->  $ ... $     (inline)
 * remark-math sólo reconoce $ y $$, por eso las fórmulas con \[ \] y \( \)
 * no se renderizaban. Respeta los bloques de código (no toca lo que está
 * dentro de ``` ```).
 */
/**
 * Elimina secciones que ahora se cubren con componentes interactivos.
 * "Preguntas de autoevaluación" se sustituye por el Quiz, así que se quita
 * del texto para no duplicar. Se elimina desde su encabezado hasta el
 * siguiente encabezado de igual o mayor nivel (o el fin del capítulo).
 */
/**
 * Inserta marcadores de animación tras los encabezados de tipos de robot
 * (sólo en el capítulo de clasificación). El marcador es un div que la
 * plantilla detecta y reemplaza por el componente <RobotAnim/>.
 */
function inyectarAnimacionesRobot(texto, slug) {
  if (slug !== 'cap-03-clasificacion-de-los-robots') return texto;
  // Mapa de encabezado de tipo -> clave. El esquema y la animación 3D
  // se insertan juntos tras el encabezado, y se elimina el diagrama ASCII
  // redundante que venía en esa sección.
  const tipos = [
    [/(##\s+Robot Cartesiano)/i, 'cartesiano'],
    [/(##\s+Robot Cil[ií]ndrico)/i, 'cilindrico'],
    [/(##\s+Robot Polar)/i, 'polar'],
    [/(##\s+Robot SCARA)/i, 'scara'],
    [/(##\s+Robot Articulado)/i, 'articulado'],
  ];
  let out = texto;
  for (const [re, tipo] of tipos) {
    out = out.replace(re, (m) =>
      `${m}\n\n<div data-robot-anim="${tipo}"></div>\n<div data-robot-esquema="${tipo}"></div>`
    );
  }
  // eliminar los bloques ```text que son diagramas ASCII de ejes/configuración
  // (sólo en este capítulo, donde ya hay animación + esquema)
  out = out.replace(/```text\n[\s\S]*?\n```/g, (bloque) => {
    // conservar bloques que claramente NO son diagramas de ejes
    const esDiagrama = /[↑↓→←/\\●○│─▲▼↺]/.test(bloque);
    return esDiagrama ? '' : bloque;
  });
  return out;
}

function eliminarSecciones(texto) {
  const titulos = ['Preguntas de autoevaluación'];
  let out = texto;
  for (const t of titulos) {
    const re = new RegExp(
      `\\n#{2,4}\\s+${t}[\\s\\S]*?(?=\\n#{2,4}\\s+|$)`,
      'g'
    );
    out = out.replace(re, '\n');
  }
  // limpiar separadores '---' que queden huérfanos seguidos
  out = out.replace(/\n---\s*\n(\s*---\s*\n)+/g, '\n---\n');
  return out;
}

function convertirDelimitadores(texto) {
  // separar en segmentos de código y no-código para no tocar el código
  const partes = texto.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g);
  return partes
    .map((seg) => {
      if (seg.startsWith('```') || seg.startsWith('~~~')) return seg; // código: intacto
      let s = seg;
      // bloque \[ ... \] -> $$ ... $$
      s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, c) => `\n$$\n${c.trim()}\n$$\n`);
      // inline \( ... \) -> $ ... $
      s = s.replace(/\\\(([\s\S]*?)\\\)/g, (_, c) => `$${c.trim()}$`);
      return s;
    })
    .join('');
}

function normalizeHeadings(body) {
  const out = [];
  const src = body.split('\n');
  let inFence = false;
  let removedTitleBlock = 0;

  for (let i = 0; i < src.length; i++) {
    let line = src[i];

    // Detectar apertura/cierre de bloques de codigo (``` o ~~~)
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }

    if (!inFence) {
      // Quitar las dos primeras lineas de titulo del capitulo
      if (removedTitleBlock < 2 && /^#\s+/.test(line)) {
        removedTitleBlock++;
        continue;
      }
      // Desplazar headings un nivel hacia abajo (max #### para no pasar de h6)
      const m = line.match(/^(#{1,4})\s+(.*)$/);
      if (m) {
        const level = Math.min(m[1].length + 1, 6);
        line = '#'.repeat(level) + ' ' + m[2];
      }
    }

    out.push(line);
  }

  return out.join('\n').replace(/^\s+/, '').replace(/\n{3,}/g, '\n\n');
}

// --- lectura --------------------------------------------------------------

if (!fs.existsSync(SOURCE)) {
  console.error(`\n[split-content] No se encontro el archivo fuente:\n  ${SOURCE}\n`);
  console.error('Copia tu .md a robo-academy/content-src/TeoriaMDR1.md');
  console.error('o pasa la ruta como argumento: node scripts/split-content.mjs /ruta/al.md\n');
  process.exit(1);
}

const raw = fs.readFileSync(SOURCE, 'utf8');
const lines = raw.split('\n');

// --- parseo de estructura -------------------------------------------------
// Detectamos lineas "# PARTE X" y "# Capitulo N". El titulo descriptivo
// esta en la linea siguiente (tambien con "# ").

const partRe = /^#\s+PARTE\s+([IVXLC]+)\s*$/i;
const chapRe = /^#\s+Cap[ií]tulo\s+(\d+)\s*$/i;

let currentPart = { roman: 'I', title: '', number: 1 };
const partNumber = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };
const chapters = [];

for (let i = 0; i < lines.length; i++) {
  const partMatch = lines[i].match(partRe);
  if (partMatch) {
    const roman = partMatch[1].toUpperCase();
    // El titulo de la parte es la siguiente linea con "# "
    let title = '';
    if (lines[i + 1] && lines[i + 1].startsWith('# ')) {
      title = lines[i + 1].replace(/^#\s+/, '').trim();
    }
    currentPart = { roman, title, number: partNumber[roman] || 1 };
    continue;
  }

  const chapMatch = lines[i].match(chapRe);
  if (chapMatch) {
    const number = parseInt(chapMatch[1], 10);
    let title = '';
    if (lines[i + 1] && lines[i + 1].startsWith('# ')) {
      title = lines[i + 1].replace(/^#\s+/, '').trim();
    }
    chapters.push({
      number,
      title,
      startLine: i, // incluye la linea "# Capitulo N"
      part: { ...currentPart },
    });
  }
}

// Calcular linea final de cada capitulo (hasta el inicio del siguiente).
for (let i = 0; i < chapters.length; i++) {
  chapters[i].endLine =
    i + 1 < chapters.length ? chapters[i + 1].startLine : lines.length;
}

console.log(`[split-content] Capitulos detectados: ${chapters.length}`);

// --- limpiar salida previa ------------------------------------------------

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });
for (const f of fs.readdirSync(OUT_DIR)) {
  if (f.endsWith('.md') || f.endsWith('.mdx')) {
    fs.unlinkSync(path.join(OUT_DIR, f));
  }
}

// --- escribir un archivo por capitulo -------------------------------------

const toc = [];

for (const ch of chapters) {
  const rawBody = lines.slice(ch.startLine, ch.endLine).join('\n').trim();
  const slug = `cap-${String(ch.number).padStart(2, '0')}-${slugify(ch.title)}`;
  const body = inyectarAnimacionesRobot(
    convertirDelimitadores(eliminarSecciones(normalizeHeadings(rawBody))),
    slug
  );

  const frontmatter = [
    '---',
    `titulo: "${yamlSafe(ch.title)}"`,
    `numero: ${ch.number}`,
    `parteNumero: ${ch.part.number}`,
    `parteTitulo: "${yamlSafe(ch.part.title)}"`,
    `slug: "${slug}"`,
    `orden: ${ch.number}`,
    '---',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(OUT_DIR, `${slug}.md`), frontmatter + body + '\n', 'utf8');

  toc.push({
    numero: ch.number,
    titulo: ch.title,
    slug,
    parteNumero: ch.part.number,
    parteTitulo: ch.part.title,
  });
}

// --- generar indice agrupado por parte ------------------------------------

const partesMap = new Map();
for (const item of toc) {
  if (!partesMap.has(item.parteNumero)) {
    partesMap.set(item.parteNumero, {
      numero: item.parteNumero,
      titulo: item.parteTitulo,
      capitulos: [],
    });
  }
  partesMap.get(item.parteNumero).capitulos.push({
    numero: item.numero,
    titulo: item.titulo,
    slug: item.slug,
  });
}

const indice = {
  generado: new Date().toISOString(),
  totalCapitulos: toc.length,
  partes: [...partesMap.values()].sort((a, b) => a.numero - b.numero),
};

fs.writeFileSync(
  path.join(DATA_DIR, 'toc.json'),
  JSON.stringify(indice, null, 2),
  'utf8'
);

console.log(`[split-content] ${toc.length} archivos .mdx escritos en src/content/capitulos/`);
console.log(`[split-content] Indice generado en src/data/toc.json`);
console.log(`[split-content] Partes: ${indice.partes.map((p) => `${p.numero} (${p.capitulos.length} caps)`).join(', ')}`);

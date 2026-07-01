/**
 * prosificar-listas.mjs
 * ---------------------
 * Convierte listas Markdown "enumerativas cortas" en un párrafo de prosa.
 *
 * Criterio (conservador) para convertir una lista:
 *   - Todos los ítems son cortos (<= MAX_PALABRAS palabras).
 *   - Ningún ítem contiene ':' , código, fórmulas, negritas con definición,
 *     ni sub-listas.
 *   - La lista tiene entre 2 y 8 ítems.
 *   - La línea anterior no vacía termina en ':' (es una introducción).
 *
 * Las listas que no cumplen (pasos, conceptos clave, definiciones largas)
 * se dejan intactas.
 *
 * Modo de uso:
 *   node scripts/prosificar-listas.mjs --check   (muestra qué cambiaría)
 *   node scripts/prosificar-listas.mjs           (aplica al archivo maestro)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.resolve(ROOT, 'content-src', 'TeoriaMDR1.md');

const MAX_PALABRAS = 5;
const MIN_ITEMS = 2;
const MAX_ITEMS = 8;

const check = process.argv.includes('--check');

const raw = fs.readFileSync(SRC, 'utf8');
const lineas = raw.split('\n');

function esItem(l) {
  return /^-\s+/.test(l);
}
function textoItem(l) {
  return l.replace(/^-\s+/, '').trim();
}
function contarPalabras(s) {
  return s.split(/\s+/).filter(Boolean).length;
}

// quita el punto final para unir, conserva otros signos
function limpiarFinal(s) {
  return s.replace(/\.$/, '').trim();
}

function itemConvertible(texto) {
  if (!texto) return false;
  if (texto.includes(':')) return false;            // probable definición
  if (/[`$]/.test(texto)) return false;             // código o fórmula
  if (/\*\*/.test(texto)) return false;             // negrita (término clave)
  if (/^\d/.test(texto)) return false;              // empieza con número
  if (contarPalabras(texto) > MAX_PALABRAS) return false;
  return true;
}

function unir(items) {
  const limpios = items.map(limpiarFinal);
  const norm = limpios.map((s) => bajarInicial(s));
  if (norm.length === 1) return norm[0] + '.';
  return norm.slice(0, -1).join(', ') + ' y ' + norm[norm.length - 1] + '.';
}

// Baja la inicial a minúscula salvo que parezca nombre propio o sigla.
function bajarInicial(s) {
  if (!s) return s;
  const primera = s.split(/\s+/)[0];
  // sigla: 2+ mayúsculas seguidas (ROS, PID, IA, LIDAR)
  if (/^[A-ZÁÉÍÓÚÑ]{2,}/.test(primera)) return s;
  // contiene una sigla embebida (Control PID) -> dejar
  if (/\b[A-ZÁÉÍÓÚÑ]{2,}\b/.test(s)) return s;
  // nombre propio común en el dominio: dejar si es una sola palabra capitalizada
  // y está en lista blanca
  const propios = ['Asimov', 'Devol', 'Engelberger', 'Unimate', 'Unimation', 'Čapek', 'Denavit', 'Hartenberg'];
  if (propios.some((p) => s.startsWith(p))) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

const salida = [];
let i = 0;
let convertidas = 0;
const ejemplos = [];

while (i < lineas.length) {
  const linea = lineas[i];

  if (esItem(linea)) {
    // recolectar bloque de lista contiguo
    let j = i;
    const items = [];
    while (j < lineas.length && (esItem(lineas[j]) || lineas[j].trim() === '')) {
      // cortar si hay línea en blanco seguida de no-item
      if (lineas[j].trim() === '') {
        // mirar siguiente no vacía
        let k = j + 1;
        while (k < lineas.length && lineas[k].trim() === '') k++;
        if (k >= lineas.length || !esItem(lineas[k])) break;
      }
      if (esItem(lineas[j])) items.push(textoItem(lineas[j]));
      j++;
    }

    // línea introductoria (anterior no vacía)
    let p = salida.length - 1;
    while (p >= 0 && salida[p].trim() === '') p--;
    const intro = p >= 0 ? salida[p] : '';

    const todosCortos = items.length >= MIN_ITEMS && items.length <= MAX_ITEMS && items.every(itemConvertible);
    const introOk = /:\s*$/.test(intro);

    if (todosCortos && introOk) {
      // convertir: unir intro (sin los dos puntos) + prosa
      const introTexto = intro.replace(/:\s*$/, '');
      const frase = `${introTexto}: ${unir(items)}`;
      // reemplazar la intro en salida
      salida[p] = frase;
      convertidas++;
      if (ejemplos.length < 8) ejemplos.push(frase);
      i = j;
      continue;
    }
  }

  salida.push(linea);
  i++;
}

console.log(`[prosificar] Listas convertidas a prosa: ${convertidas}`);
if (ejemplos.length) {
  console.log('\nEjemplos:');
  ejemplos.forEach((e) => console.log('  • ' + e.slice(0, 110) + (e.length > 110 ? '…' : '')));
}

if (!check) {
  fs.writeFileSync(SRC, salida.join('\n'), 'utf8');
  console.log('\n[prosificar] Archivo maestro actualizado. Ejecuta "npm run split" para regenerar capítulos.');
} else {
  console.log('\n[prosificar] Modo --check: no se escribió nada.');
}

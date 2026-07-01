/**
 * reemplazar-capitulo.mjs
 * Reemplaza el contenido de un capítulo en el documento maestro.
 * Uso: node scripts/reemplazar-capitulo.mjs <numero> <archivo-nuevo.md>
 *
 * Localiza "# Capítulo N" y reemplaza hasta justo antes de "# Capítulo N+1"
 * (o el fin del archivo / inicio de una nueva PARTE).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MAESTRO = path.resolve(ROOT, 'content-src', 'TeoriaMDR1.md');

const num = parseInt(process.argv[2], 10);
const archivoNuevo = process.argv[3];
if (!num || !archivoNuevo) {
  console.error('Uso: node scripts/reemplazar-capitulo.mjs <numero> <archivo.md>');
  process.exit(1);
}

const lineas = fs.readFileSync(MAESTRO, 'utf8').split('\n');
const nuevo = fs.readFileSync(path.resolve(ROOT, archivoNuevo), 'utf8').trimEnd().split('\n');

// localizar inicio del capítulo N y del N+1
const reInicio = new RegExp(`^#\\s+Cap[ií]tulo\\s+${num}\\s*$`);
const reSiguiente = new RegExp(`^#\\s+Cap[ií]tulo\\s+${num + 1}\\s*$`);

let ini = -1, fin = -1;
for (let i = 0; i < lineas.length; i++) {
  if (ini === -1 && reInicio.test(lineas[i])) ini = i;
  else if (ini !== -1 && reSiguiente.test(lineas[i])) { fin = i; break; }
}
if (ini === -1) { console.error(`No se encontró el Capítulo ${num}`); process.exit(1); }

// si no hay capítulo siguiente, el fin es el final del archivo
if (fin === -1) fin = lineas.length;

// Puede haber una línea "# PARTE X" justo antes del capítulo siguiente:
// retrocedemos para no comernos el encabezado de PARTE.
let corte = fin;
// buscar hacia atrás desde fin una línea "# PARTE" cercana (hasta 6 líneas)
for (let k = fin - 1; k >= Math.max(ini + 1, fin - 6); k--) {
  if (/^#\s+PARTE\s+/i.test(lineas[k])) { corte = k; break; }
}

const antes = lineas.slice(0, ini);
const despues = lineas.slice(corte);
const resultado = [...antes, ...nuevo, '', ...despues];
fs.writeFileSync(MAESTRO, resultado.join('\n'));
console.log(`Capítulo ${num} reemplazado (líneas ${ini + 1}-${corte}).`);

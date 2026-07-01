/**
 * remark-mermaid-raw.mjs
 * Corre sobre el árbol Markdown (antes de Shiki). Convierte cada bloque
 * ```mermaid en un nodo HTML crudo: <pre class="mermaid-src">CÓDIGO</pre>.
 * De esa forma Shiki no lo resalta y el cliente lee el código tal cual.
 */
import { visit } from 'unist-util-visit';

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Corrige sintaxis Mermaid problemática:
 * - Las llaves { } dentro de etiquetas de nodo [ ... ] rompen el parser.
 *   Se envuelven en comillas: A[{0} Base] -> A["{0} Base"]
 */
function arreglarMermaid(code) {
  // nodos con corchete que contienen llaves: ID[...{...}...]
  return code.replace(/(\w+)\[([^\]]*\{[^\]]*)\]/g, (m, id, etiqueta) => {
    // si ya está entre comillas, dejar
    if (/^".*"$/.test(etiqueta.trim())) return m;
    return `${id}["${etiqueta.trim()}"]`;
  });
}

export function remarkMermaidRaw() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang !== 'mermaid') return;
      const arreglado = arreglarMermaid(node.value || '');
      const code = escapeHtml(arreglado);
      // Transformar el nodo `code` en un nodo `html` crudo
      node.type = 'html';
      node.value = `<pre class="mermaid-src" data-mermaid="true">${code}</pre>`;
      delete node.lang;
      delete node.meta;
    });
  };
}

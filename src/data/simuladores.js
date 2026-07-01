/**
 * Mapa de simuladores por capítulo.
 * Clave = slug del capítulo. Valor = lista de simuladores a insertar,
 * cada uno con el nombre del componente y, opcionalmente, dónde colocarlo
 * (después del encabezado cuyo texto coincida con "trasEncabezado").
 *
 * Si no se indica posición, el simulador se añade al final del capítulo.
 * Así se pueden añadir más simuladores sin tocar el contenido Markdown.
 */
export const simuladoresPorCapitulo = {
  'cap-03-clasificacion-de-los-robots': [
    {
      componente: 'SimuladorSCARA',
      titulo: 'Pruébalo: robot SCARA en 3D',
      descripcion:
        'Mueve las dos articulaciones rotacionales y la prismática para ver el movimiento característico del SCARA: brazo horizontal y herramienta que baja en vertical.',
    },
  ],
  'cap-09-matrices-de-rotacion': [
    {
      componente: 'SimuladorRotacion',
      titulo: 'Pruébalo: rotación en el plano',
      descripcion:
        'Gira la figura y observa cómo cada componente de la matriz R(θ) cambia con el ángulo. Los valores resaltados conectan la fórmula con el giro.',
    },
  ],
  'cap-12-cinematica-directa': [
    {
      componente: 'SimuladorRR',
      titulo: 'Pruébalo: brazo RR interactivo',
      descripcion:
        'Ajusta los ángulos y las longitudes y observa cómo cambia la posición del efector final según las ecuaciones de arriba.',
      trasEncabezado: 'Ejemplo numérico',
    },
  ],
  'cap-16-el-metodo-de-denavit-hartenberg': [
    {
      componente: 'ConstructorDH',
      titulo: 'Pruébalo: construye tu tabla DH',
      descripcion:
        'Edita los parámetros θ, d, a y α de cada articulación. El simulador calcula la matriz homogénea total y dibuja el brazo resultante en tiempo real.',
    },
  ],
};

export function simuladoresDe(slug) {
  return simuladoresPorCapitulo[slug] || [];
}

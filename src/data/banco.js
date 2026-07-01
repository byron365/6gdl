/**
 * Banco de preguntas (quiz) y tarjetas (flashcards) por capítulo.
 * Las preguntas y respuestas se derivan fielmente del contenido del manual.
 *
 * Estructura por capítulo (clave = slug):
 *   quiz: [{ pregunta, opciones: [...], correcta: idx, explicacion }]
 *   flashcards: [{ concepto, definicion }]
 *   reflexion: [{ pregunta, respuestaModelo }]  // preguntas abiertas del manual
 *
 * Para añadir más capítulos, basta con extender este objeto.
 */

export const bancoPorCapitulo = {
  'cap-01-introduccion-a-la-robotica': {
    quiz: [
      {
        pregunta: '¿Qué característica distingue principalmente a un robot de una máquina automática convencional?',
        opciones: [
          'Que funciona con electricidad',
          'Que es reprogramable y puede ejecutar múltiples tareas',
          'Que se mueve más rápido',
          'Que no necesita mantenimiento',
        ],
        correcta: 1,
        explicacion: 'Un robot es reprogramable y multifuncional; una máquina automática convencional está diseñada para una sola tarea fija.',
      },
      {
        pregunta: 'Según la IFR, un robot industrial debe tener al menos:',
        opciones: ['Un eje', 'Dos ejes', 'Tres o más ejes', 'Cinco ejes'],
        correcta: 2,
        explicacion: 'La definición de la IFR exige una máquina manipuladora con tres o más ejes.',
      },
      {
        pregunta: '¿Cuál de estos elementos es el "cerebro" del robot?',
        opciones: ['El actuador', 'El efector final', 'El controlador', 'El sensor'],
        correcta: 2,
        explicacion: 'El controlador (PLC, microcontrolador, computadora industrial, etc.) procesa la información y dirige el robot.',
      },
      {
        pregunta: '¿Cuál de los siguientes NO se considera un robot?',
        opciones: ['Un brazo manipulador reprogramable', 'Una banda transportadora', 'Un robot SCARA', 'Un robot móvil autónomo'],
        correcta: 1,
        explicacion: 'Una banda transportadora funciona automáticamente pero no se puede reprogramar ni ejecuta múltiples tareas.',
      },
      {
        pregunta: 'El elemento que interactúa directamente con el entorno (pinza, ventosa, soldador) se llama:',
        opciones: ['Actuador', 'Efector final', 'Encoder', 'Eslabón'],
        correcta: 1,
        explicacion: 'El efector final es la herramienta montada al extremo del robot que manipula el entorno.',
      },
    ],
    flashcards: [
      { concepto: 'Robótica', definicion: 'Disciplina multidisciplinaria que integra ingeniería y ciencias computacionales para diseñar, construir, controlar y programar máquinas que ejecutan tareas de forma automática.' },
      { concepto: 'Robot industrial', definicion: 'Máquina manipuladora automática, reprogramable y multifuncional, con tres o más ejes, capaz de posicionar piezas o herramientas mediante movimientos programados.' },
      { concepto: 'Automatización', definicion: 'Sistema diseñado para una sola tarea, difícil de modificar y con poca flexibilidad, a diferencia de la robótica.' },
      { concepto: 'Actuador', definicion: 'Dispositivo responsable del movimiento del robot (motores DC, servomotores, motores paso a paso, actuadores hidráulicos o neumáticos).' },
      { concepto: 'Sensor', definicion: 'Componente que permite al robot conocer el estado de su entorno (cámaras, LIDAR, ultrasonido, encoders, IMU).' },
      { concepto: 'Efector final', definicion: 'Elemento que interactúa directamente con el entorno: pinza, ventosa, soldador, herramienta de corte o cámara.' },
      { concepto: 'Controlador', definicion: 'El "cerebro" del robot: PLC, microcontrolador, computadora industrial, FPGA, Raspberry Pi o NVIDIA Jetson.' },
      { concepto: 'Reprogramabilidad', definicion: 'Capacidad de un robot de ser configurado para realizar diferentes tareas mediante programación, sin rediseñar el hardware.' },
      { concepto: 'Industria 4.0', definicion: 'Etapa de automatización industrial y manufactura inteligente en la que la robótica es uno de los pilares fundamentales.' },
    ],
    reflexion: [
      { pregunta: '¿Por qué se considera que la robótica es una disciplina multidisciplinaria?', respuestaModelo: 'Porque integra mecánica, electrónica, control, ciencias de la computación, inteligencia artificial, visión, matemáticas y física; cada área aporta elementos esenciales para el funcionamiento del robot.' },
      { pregunta: '¿Qué ventajas ofrece un robot reprogramable frente a un sistema automatizado fijo?', respuestaModelo: 'Mayor flexibilidad y libertad de movimiento, facilidad para modificar o cambiar la tarea sin rediseñar el sistema, e integración de múltiples sensores para adaptarse al entorno.' },
    ],
  },

  'cap-03-clasificacion-de-los-robots': {
    quiz: [
      {
        pregunta: 'La configuración típica de un robot SCARA es:',
        opciones: ['PPP', 'RRP', 'RRR', 'PRP'],
        correcta: 1,
        explicacion: 'El SCARA tiene dos articulaciones rotacionales y una prismática (RRP): las dos primeras giran en el plano horizontal y la tercera baja en vertical.',
      },
      {
        pregunta: '¿Qué tipo de robot usa típicamente tres articulaciones prismáticas (PPP)?',
        opciones: ['SCARA', 'Cartesiano', 'Articulado', 'Polar'],
        correcta: 1,
        explicacion: 'El robot cartesiano emplea tres articulaciones prismáticas que se mueven a lo largo de los ejes X, Y y Z.',
      },
      {
        pregunta: '¿Para qué tipo de tarea es especialmente adecuado el SCARA?',
        opciones: ['Pintura de superficies curvas', 'Ensamblaje vertical', 'Exploración submarina', 'Transporte de cargas pesadas'],
        correcta: 1,
        explicacion: 'Su movimiento horizontal rápido más el descenso vertical de la prismática lo hacen ideal para tareas de ensamblaje.',
      },
    ],
    flashcards: [
      { concepto: 'Robot cartesiano', definicion: 'Robot con tres articulaciones prismáticas (PPP) que se mueven a lo largo de los ejes X, Y y Z.' },
      { concepto: 'Robot cilíndrico', definicion: 'Robot cuyo espacio de trabajo tiene forma cilíndrica, combinando movimiento rotacional y lineal.' },
      { concepto: 'Robot SCARA', definicion: 'Selective Compliance Assembly Robot Arm. Configuración RRP muy usada en ensamblaje por su velocidad y precisión.' },
      { concepto: 'Robot articulado', definicion: 'Robot antropomórfico con articulaciones rotacionales que imita el brazo humano; muy versátil.' },
      { concepto: 'Robot paralelo', definicion: 'Robot con varias cadenas cinemáticas que conectan la base con el efector; alta rigidez y velocidad.' },
      { concepto: 'Grados de libertad', definicion: 'Número de movimientos independientes que puede realizar un robot.' },
      { concepto: 'Espacio de trabajo', definicion: 'Conjunto de todas las posiciones que el efector final puede alcanzar.' },
    ],
    reflexion: [
      { pregunta: '¿Por qué el robot SCARA es tan utilizado en tareas de ensamblaje?', respuestaModelo: 'Porque es muy rápido y preciso, su rigidez vertical permite insertar piezas con fuerza controlada, y su movimiento horizontal con descenso vertical encaja perfectamente con las operaciones de tomar y colocar.' },
    ],
  },

  'cap-04-morfologia-del-robot': {
    quiz: [
      {
        pregunta: 'Una articulación revoluta produce un movimiento:',
        opciones: ['Lineal', 'Rotacional', 'Esférico', 'Helicoidal'],
        correcta: 1,
        explicacion: 'La articulación revoluta genera rotación; la prismática genera desplazamiento lineal.',
      },
      {
        pregunta: 'Una articulación prismática produce un movimiento:',
        opciones: ['Rotacional', 'Lineal', 'Circular', 'Oscilatorio'],
        correcta: 1,
        explicacion: 'La articulación prismática desplaza linealmente un eslabón respecto al anterior.',
      },
    ],
    flashcards: [
      { concepto: 'Articulación revoluta', definicion: 'Articulación que produce movimiento de rotación entre dos eslabones.' },
      { concepto: 'Articulación prismática', definicion: 'Articulación que produce movimiento lineal (de deslizamiento) entre dos eslabones.' },
      { concepto: 'Eslabón', definicion: 'Cuerpo rígido que conecta dos articulaciones consecutivas en la estructura del robot.' },
    ],
    reflexion: [
      { pregunta: '¿Cuál es la diferencia entre una articulación revoluta y una prismática?', respuestaModelo: 'La revoluta produce rotación alrededor de un eje y su variable es un ángulo; la prismática produce desplazamiento lineal a lo largo de un eje y su variable es una distancia.' },
    ],
  },
};

export function bancoDe(slug) {
  return bancoPorCapitulo[slug] || null;
}

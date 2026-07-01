---
titulo: "Historia y Evolución de la Robótica"
numero: 2
parteNumero: 1
parteTitulo: "Fundamentos de la Robótica"
slug: "cap-02-historia-y-evolucion-de-la-robotica"
orden: 2
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Reconocer los hitos históricos que dieron origen a la robótica.
- Comprender de dónde vienen los términos "robot" y "robótica".
- Ubicar el nacimiento del robot industrial y su importancia.
- Entender por qué el método de Denavit-Hartenberg fue un punto de inflexión.

---

## De los autómatas antiguos al término "robot"

La robótica es joven comparada con otras ramas de la ingeniería, pero la idea de construir máquinas que imiten el comportamiento humano es milenaria. Mucho antes de la electricidad, varias civilizaciones construyeron autómatas que ejecutaban movimientos complejos usando solo principios mecánicos: figuras egipcias, dispositivos hidráulicos griegos, autómatas chinos y muñecos del Renacimiento. No eran robots en el sentido moderno, pero demostraban que una máquina podía actuar sin intervención humana continua.

Entre los pioneros destaca **Herón de Alejandría** (siglo I), que diseñó puertas automáticas para templos, teatros mecánicos y fuentes movidas por vapor, aire comprimido y sistemas hidráulicos. Siglos después, el ingeniero **Al-Jazarí** (1206) describió relojes hidráulicos, sirvientes automáticos y mecanismos musicales en su célebre libro de dispositivos ingeniosos, y es considerado uno de los padres de la ingeniería mecánica. Hacia 1495, **Leonardo da Vinci** diseñó un "caballero mecánico" capaz de sentarse, mover los brazos y girar la cabeza; nunca se construyó en su época, pero estudios modernos comprobaron que el diseño era funcional. Más tarde, la **Revolución Industrial** llevó la automatización a la producción con el telar de Jacquard, las máquinas de vapor y las primeras máquinas herramienta.

La palabra **robot** nació en 1921, en la obra de teatro *R.U.R. (Rossum's Universal Robots)* del escritor checo **Karel Čapek**. Proviene del término eslavo *robota*, que significa trabajo forzado o servidumbre (la idea, de hecho, se la sugirió su hermano Josef). Dos décadas después, el escritor y bioquímico **Isaac Asimov** acuñó el término *robotics* (robótica) y formuló las célebres **Tres Leyes de la Robótica**, a las que más tarde añadió una Ley Cero:

> **Primera Ley.** Un robot no hará daño a un ser humano ni permitirá, por inacción, que sufra daño.
>
> **Segunda Ley.** Un robot obedecerá las órdenes humanas, salvo que entren en conflicto con la Primera Ley.
>
> **Tercera Ley.** Un robot protegerá su propia existencia, mientras ello no entre en conflicto con las dos primeras.
>
> **Ley Cero.** Un robot no puede dañar a la humanidad ni permitir, por inacción, que sufra daño.

Aunque pertenecen a la ciencia ficción, estas leyes influyeron profundamente en la ética de la robótica real.

---

## El nacimiento del robot industrial

El salto de la fantasía a la fábrica ocurrió a mediados del siglo XX. En 1954, **George Devol** patentó el primer manipulador programable, el *Programmed Article Transfer*, precursor del robot industrial moderno. **Joseph Engelberger** reconoció su potencial y juntos fundaron **Unimation**, la primera empresa dedicada a fabricar robots industriales; por ello se conoce a Engelberger como el padre de la robótica industrial.

El resultado de esa colaboración fue **Unimate**, el primer robot industrial de la historia, que comenzó a operar en 1961 en una planta de General Motors. Era hidráulico, programable, con seis grados de libertad, y su tarea era retirar piezas fundidas a altísima temperatura, peligrosas para los operarios humanos. Ese momento marcó oficialmente el nacimiento de la robótica industrial.

Desde entonces, los robots industriales han evolucionado por generaciones: de los primeros robots **secuenciales sin sensores** (1960–1970), se pasó a robots con **sensores y control por computadora** (1970–1985), luego a la **visión artificial y la programación offline** (1985–2000), después a los **robots colaborativos y la IA aplicada** (2000–2020), y hoy a robots que integran aprendizaje automático, visión 3D, gemelos digitales y grandes modelos de lenguaje.

| Año | Acontecimiento |
|------|----------------|
| Siglo I | Autómatas de Herón de Alejandría |
| 1206 | Máquinas automáticas de Al-Jazarí |
| 1495 | Caballero mecánico de Leonardo da Vinci |
| 1804 | Telar de Jacquard |
| 1921 | Karel Čapek introduce la palabra "Robot" |
| 1942 | Isaac Asimov propone las Tres Leyes |
| 1954 | George Devol patenta el primer manipulador programable |
| 1961 | Instalación del robot Unimate |
| 1973 | Primer robot totalmente eléctrico |
| Décadas de 1980–1990 | Expansión industrial y visión artificial |
| Décadas de 2000–2010 | Robots colaborativos y autónomos |
| Década de 2020 | Integración masiva de IA y aprendizaje automático |

---

## El origen del método de Denavit-Hartenberg

Uno de los mayores desafíos de la robótica fue describir matemáticamente la posición y orientación de cada eslabón de un manipulador. En 1955, **Jacques Denavit** y **Richard S. Hartenberg** propusieron una convención que permite representar cualquier cadena cinemática usando solo cuatro parámetros por articulación: θ, d, a y α. Este método simplificó enormemente el análisis cinemático y se convirtió en el estándar de los libros, cursos y simuladores de robótica. Le dedicaremos una parte completa del manual más adelante.

---

## Resumen del capítulo

La robótica es fruto de siglos de avances en mecánica, matemáticas, electrónica e informática. De los autómatas antiguos a los robots inteligentes actuales, cada etapa añadió nuevas capacidades. El nacimiento del robot industrial con Unimate y la creación del método de Denavit-Hartenberg fueron los dos hitos que permitieron formalizar el estudio de la cinemática y el control de manipuladores.

---

### Conceptos clave

- Autómata
- Unimate
- Unimation
- George Devol
- Joseph Engelberger
- Karel Čapek
- Isaac Asimov
- Denavit-Hartenberg
- Robot industrial
- Robot colaborativo

---

### Avance del siguiente capítulo

En el siguiente capítulo estudiaremos la **clasificación de los robots**: sus configuraciones mecánicas, tipos de articulaciones, espacios de trabajo y aplicaciones. Esta clasificación será esencial para comprender después cómo se modelan matemáticamente.

---
titulo: "Clasificación de los Robots"
numero: 3
parteNumero: 1
parteTitulo: "Fundamentos de la Robótica"
slug: "cap-03-clasificacion-de-los-robots"
orden: 3
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Distinguir los principales tipos de robots según su estructura mecánica.
- Reconocer las configuraciones de articulaciones (R y P) de cada tipo.
- Comparar ventajas, desventajas y aplicaciones de cada configuración.
- Relacionar la geometría del robot con su modelado matemático.

---

## ¿Por qué clasificar los robots?

No todos los robots tienen la misma estructura ni se diseñaron para las mismas tareas: algunos destacan por su velocidad, otros por su precisión y otros por su capacidad de carga. Por eso existen varios criterios de clasificación, según su estructura mecánica, su movilidad, su aplicación o su grado de autonomía. El criterio más usado en la industria es la **estructura mecánica**, es decir, la disposición geométrica de sus ejes y articulaciones, que determina su espacio de trabajo, precisión y facilidad de modelado.

Para describir cada configuración usaremos la notación de articulaciones: **R** para una articulación rotacional (giro) y **P** para una prismática (deslizamiento lineal).

---

## Robot cartesiano

<div data-robot-anim="cartesiano"></div>
<div data-robot-esquema="cartesiano"></div>

<div data-robot-anim="cartesiano"></div>
<div data-robot-esquema="cartesiano"></div>

También llamado robot XYZ, está formado por tres ejes lineales perpendiculares entre sí, con tres articulaciones prismáticas (**PPP**). Ofrece muy alta precisión, gran rigidez y una programación sencilla, sobre un espacio de trabajo en forma de prisma rectangular. A cambio, es poco flexible y ocupa bastante espacio. Es la configuración de las impresoras 3D, las máquinas CNC, los plotters y los sistemas pick and place.

---

## Robot cilíndrico

<div data-robot-anim="cilindrico"></div>
<div data-robot-esquema="cilindrico"></div>

<div data-robot-anim="cilindrico"></div>
<div data-robot-esquema="cilindrico"></div>

Combina una rotación de base con dos desplazamientos lineales —vertical y radial— en configuración **RPP**. Su espacio de trabajo es cilíndrico y ofrece buena capacidad de carga. Se emplea en manipulación de piezas, carga y descarga de materiales y alimentación de máquinas herramienta.

---

## Robot polar

<div data-robot-anim="polar"></div>
<div data-robot-esquema="polar"></div> (esférico)

<div data-robot-anim="polar"></div>
<div data-robot-esquema="polar"></div>

En configuración **RRP**, combina dos rotaciones con una extensión lineal, de modo que su efector barre un volumen aproximadamente esférico. Tiene gran alcance y buena cobertura espacial, aunque su control es más complejo y su precisión menor que la de un cartesiano. Es habitual en soldadura, fundición y manipulación pesada.

---

## Robot SCARA

<div data-robot-anim="scara"></div>
<div data-robot-esquema="scara"></div>

<div data-robot-anim="scara"></div>
<div data-robot-esquema="scara"></div>

SCARA significa *Selective Compliance Assembly Robot Arm*. Sus dos primeras articulaciones son rotacionales y la tercera prismática (**RRP**): el brazo se mueve rápido en el plano horizontal y la herramienta baja en vertical. Es muy rápido, preciso y ocupa poco espacio, lo que lo hace ideal para el ensamblaje, aunque con un espacio de trabajo limitado. Domina el ensamblaje electrónico, la inserción de componentes, el pick and place y la industria farmacéutica.

---

## Robot articulado

<div data-robot-anim="articulado"></div>
<div data-robot-esquema="articulado"></div>

<div data-robot-anim="articulado"></div>
<div data-robot-esquema="articulado"></div>

Es el robot industrial más conocido y su apariencia recuerda a un brazo humano. Usa únicamente articulaciones rotacionales (típicamente **RRR** en sus primeros ejes, con 4 a 7 grados de libertad en total). Es muy flexible, con gran alcance y excelente control de la orientación del efector. Se usa en soldadura, pintura, paletizado, pulido y manufactura en general.

---

## Robot paralelo

A diferencia de los anteriores, su efector final está sostenido por **varias cadenas cinemáticas simultáneamente** —el robot Delta es el ejemplo clásico—. Esto le da muy alta velocidad, muy baja masa móvil y gran precisión, a costa de un espacio de trabajo reducido. Es el favorito para empaque, clasificación e industria alimentaria.

---

## Comparación entre configuraciones

| Tipo | GDL típicos | Espacio de trabajo | Precisión | Velocidad | Complejidad |
|------|-------------|-------------------|------------|------------|-------------|
| Cartesiano | 3 | Prismático | Muy alta | Media | Baja |
| Cilíndrico | 3 | Cilíndrico | Alta | Media | Media |
| Polar | 3 | Esférico | Media | Media | Alta |
| SCARA | 4 | Cilíndrico | Muy alta | Muy alta | Media |
| Articulado | 6 | Irregular | Alta | Alta | Muy alta |
| Paralelo | 3–6 | Limitado | Muy alta | Muy alta | Muy alta |

---

## Otras formas de clasificar

Más allá de la estructura, los robots se clasifican también por su **movilidad**: los fijos permanecen anclados (como los robots de soldadura industrial), mientras que los móviles se desplazan por tierra (ruedas, orugas o patas), aire (drones y UAV) o agua (vehículos submarinos ROV y AUV).

Por su **aplicación** encontramos robots industriales (procesos repetitivos), médicos (cirugía, rehabilitación, prótesis), de servicio (limpieza, atención al cliente), educativos (LEGO Mindstorms, plataformas Arduino) y espaciales (rovers, brazos orbitales).

Y por su **tipo de control** van desde los teleoperados —dirigidos por un humano, como los robots de desactivación de explosivos— a los semiautónomos, que combinan decisiones propias con supervisión, hasta los autónomos, que operan largos periodos sin intervención usando IA, visión artificial, SLAM y planeación de trayectorias.

Un caso especial son los **robots colaborativos (cobots)**, diseñados para compartir el espacio de trabajo con personas. Gracias a sus sensores de fuerza, detección de colisiones y programación intuitiva, se integran fácilmente y son muy populares en pequeñas y medianas empresas.

---

## Relación con el método de Denavit-Hartenberg

Todas estas configuraciones —cartesiana, SCARA, articulada o cualquier otra— pueden describirse con el mismo método: el de **Denavit-Hartenberg**. Consiste en asignar un sistema de coordenadas a cada articulación y definir cuatro parámetros por eslabón (θ, d, a y α). Comprender la estructura mecánica del robot facilita enormemente construir su tabla DH y desarrollar su modelo cinemático, como veremos más adelante.

---

## Resumen del capítulo

Vimos las principales clasificaciones de los robots según su estructura, movilidad, aplicación y control. Cada configuración tiene ventajas que la hacen idónea para ciertas tareas, y todas comparten un mismo lenguaje de modelado matemático a través del método de Denavit-Hartenberg.

---

### Conceptos clave

- Robot cartesiano
- Robot cilíndrico
- Robot polar
- Robot SCARA
- Robot articulado
- Robot paralelo
- Robot colaborativo
- Grados de libertad
- Espacio de trabajo

---

### Avance del siguiente capítulo

En el próximo capítulo estudiaremos la **morfología del robot**: eslabones, articulaciones, grados de libertad, actuadores, transmisiones, sensores y efectores finales. Serán la base para comprender cómo se modelan matemáticamente los manipuladores.

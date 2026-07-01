---
titulo: "Grados de Libertad y Espacio de Trabajo"
numero: 5
parteNumero: 1
parteTitulo: "Fundamentos de la Robótica"
slug: "cap-05-grados-de-libertad-y-espacio-de-trabajo"
orden: 5
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Comprender qué es un grado de libertad y por qué un cuerpo libre tiene seis.
- Calcular la movilidad de un mecanismo con el criterio de Grübler-Kutzbach.
- Reconocer la redundancia y las singularidades.
- Identificar el espacio de trabajo de cada tipo de robot.

---

## ¿Qué es un grado de libertad?

Un **grado de libertad (GDL, o DOF en inglés)** es un movimiento independiente que puede realizar un cuerpo o mecanismo. La cantidad de grados de libertad determina la flexibilidad de un robot, su capacidad de alcanzar posiciones y orientaciones, y también la dificultad de su control y de su modelo matemático: a más grados de libertad, más versatilidad, pero también más complejidad.

En un espacio tridimensional, un cuerpo rígido completamente libre posee **seis grados de libertad**: tres traslaciones (en X, Y y Z) y tres rotaciones (roll, pitch y yaw). Con estos seis movimientos se puede ubicar y orientar cualquier objeto en el espacio.

| Movimiento | Descripción |
|------------|-------------|
| Tx | Adelante y atrás |
| Ty | Izquierda y derecha |
| Tz | Arriba y abajo |
| Roll | Giro sobre X |
| Pitch | Giro sobre Y |
| Yaw | Giro sobre Z |

En un robot, cada articulación aporta grados de libertad: tanto la **revoluta (R)**, cuya variable es el ángulo $\theta$, como la **prismática (P)**, cuya variable es la distancia $d$, contribuyen con 1 GDL cada una. Así, un robot con una articulación tiene 1 GDL, un brazo RR tiene 2, un RRR tiene 3, y un brazo industrial típico tiene 6.

---

## ¿Por qué seis grados de libertad?

Para posicionar **completamente** una herramienta hay que controlar tanto su posición (X, Y, Z) como su orientación (roll, pitch, yaw). Esos son seis valores independientes, y por eso la mayoría de los robots industriales tienen exactamente seis grados de libertad.

Sin embargo, no todas las tareas requieren controlar la orientación. Una **impresora 3D** (configuración PPP) solo necesita posicionar la boquilla en X, Y y Z, sin orientarla. Un **robot SCARA** (RRPR) tiene 4 grados de libertad, suficientes para el ensamblaje. En el otro extremo, un robot es **redundante** cuando tiene más grados de libertad de los estrictamente necesarios —por ejemplo, 7 GDL—, lo que le permite evitar obstáculos, reducir singularidades y alcanzar una misma posición de varias formas. El brazo humano es el ejemplo perfecto de redundancia:

| Articulación | DOF |
|--------------|----:|
| Hombro | 3 |
| Codo | 1 |
| Antebrazo | 1 |
| Muñeca | 3 |

En conjunto, entre 7 y 8 grados de libertad que hacen posibles sus movimientos tan naturales.

---

## Movilidad: el criterio de Grübler-Kutzbach

Contar articulaciones no siempre basta, porque algunos mecanismos tienen restricciones adicionales. Para estimar su **movilidad** ($M$, el número de grados de libertad reales) se usa el criterio de Grübler-Kutzbach. Para mecanismos espaciales:

$$
M = 6(n-1-j)+\sum_{i=1}^{j} f_i
$$

y para mecanismos planos, la versión simplificada:

$$
M=3(n-1)-2j_1-j_2
$$

donde $n$ es el número de eslabones, $j$ el de articulaciones, $f_i$ los grados de libertad de cada articulación, y $j_1$, $j_2$ las articulaciones de uno y dos grados de libertad respectivamente.

Por ejemplo, para un **robot RR plano** con 3 eslabones y 2 articulaciones de 1 GDL:

$$
M=3(3-1)-2(2)=6-4=2
$$

que coincide con la intuición: 2 grados de libertad.

> **Nota:** esta fórmula estima la movilidad, pero hay mecanismos con restricciones especiales que requieren un análisis más detallado.

---

## Singularidades

Una **singularidad** es una configuración en la que el robot pierde uno o más grados de movimiento efectivos. El caso típico ocurre cuando varios eslabones quedan completamente alineados: en esa postura, ciertas direcciones de movimiento dejan de estar disponibles. Las singularidades provocan pérdida de precisión, velocidades articulares muy altas, inestabilidad numérica y dificultades para la cinemática inversa. Les dedicaremos un capítulo completo más adelante.

---

## Espacio de trabajo

El **espacio de trabajo** (*workspace*) es el conjunto de todas las posiciones que el efector final puede alcanzar, y cada arquitectura tiene el suyo característico: el robot **cartesiano** abarca un prisma rectangular; el **cilíndrico**, un cilindro; el **polar**, un volumen esférico; el **SCARA**, una región anular o cilíndrica; y el **articulado**, una geometría irregular determinada por la longitud de sus eslabones y los límites de sus articulaciones.

Conviene distinguir dos conceptos. El **espacio alcanzable** incluye todos los puntos que el efector puede tocar, aunque no en cualquier orientación. El **espacio útil** son las posiciones donde el robot puede trabajar cumpliendo a la vez los requisitos de posición y de orientación; en la práctica industrial suele ser menor que el alcanzable. El espacio de trabajo depende de la longitud de los eslabones, los límites articulares, las posibles colisiones entre eslabones, los obstáculos externos y las restricciones de seguridad.

---

## Relación con Denavit-Hartenberg

Cada grado de libertad se representa con un sistema de coordenadas local. Al construir una tabla DH, cada articulación aporta una variable ($\theta$ o $d$) y cada eslabón aporta sus parámetros geométricos ($a$ y $\alpha$); el conjunto describe por completo la geometría del manipulador. Comprender los grados de libertad y el espacio de trabajo facilita interpretar las transformaciones homogéneas que veremos a continuación.

---

## Resumen del capítulo

Introdujimos el grado de libertad y su papel en la movilidad de un robot, la diferencia entre traslaciones y rotaciones, el criterio de Grübler-Kutzbach, la redundancia cinemática y las singularidades. Finalmente vimos el espacio de trabajo y cómo la estructura mecánica condiciona las capacidades del manipulador.

---

### Conceptos clave

- Grado de libertad (DOF)
- Movilidad
- Redundancia cinemática
- Singularidad
- Espacio de trabajo
- Espacio alcanzable
- Espacio útil
- Grübler-Kutzbach

---

### Avance del siguiente capítulo

En el siguiente capítulo comenzaremos con los **fundamentos matemáticos de la robótica**: los sistemas de coordenadas, los marcos de referencia y las transformaciones entre sistemas, punto de partida para las matrices homogéneas y el método de Denavit-Hartenberg.

## PARTE II
## Fundamentos Matemáticos para la Robótica

---

---
titulo: "Espacio de Trabajo, Configuraciones y Singularidades"
numero: 14
parteNumero: 3
parteTitulo: "Cinemática de Manipuladores Robóticos"
slug: "cap-14-espacio-de-trabajo-configuraciones-y-singularidades"
orden: 14
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Distinguir el espacio alcanzable del espacio útil.
- Comprender que una misma posición admite varias configuraciones.
- Identificar las singularidades y sus consecuencias.
- Relacionar el análisis del espacio de trabajo con el método de Denavit-Hartenberg.

---

## ¿Puede el robot llegar ahí?

Ya sabemos calcular la posición y orientación del efector, pero queda una pregunta aún más importante: *¿puede realmente el robot alcanzar esa posición?* La respuesta depende de la longitud de los eslabones, el número de articulaciones, los límites mecánicos, la configuración y la presencia de singularidades. El conjunto de todas las posiciones que un manipulador puede alcanzar es su **espacio de trabajo**, y no todos los puntos del espacio son accesibles: la geometría del robot impone restricciones.

El tamaño y la forma del espacio de trabajo dependen del número y longitud de los eslabones, el tipo de articulaciones, los límites articulares, los obstáculos físicos y la herramienta instalada.

---

## Espacio alcanzable y espacio útil

Conviene distinguir dos conceptos. El **espacio alcanzable** (*reachable workspace*) incluye todas las posiciones que el efector puede tocar, aunque no necesariamente con cualquier orientación. El **espacio útil** (*dexterous workspace*) son las posiciones donde el efector puede adoptar **cualquier orientación** permitida. El útil siempre está contenido en el alcanzable, y suele ser menor.

Pensemos en un brazo humano: podemos tocar muchos puntos, pero no en todos podemos colocar la mano con cualquier orientación. En un robot ocurre lo mismo.

La arquitectura determina la geometría del espacio: aproximadamente prismático en el cartesiano, cilíndrico en el cilíndrico, esférico en el polar, e irregular y complejo en el antropomórfico. Además, los **límites articulares** lo reducen: aunque en teoría una revoluta podría girar indefinidamente, en la práctica hay topes mecánicos, por ejemplo $-170°\le\theta\le 170°$. También hay regiones físicamente inaccesibles porque un eslabón colisionaría con otro o con la base.

---

## Configuraciones

Una **configuración** es un conjunto específico de valores articulares, por ejemplo $(\theta_1,\theta_2,\theta_3)=(30°, 45°, 15°)$, y cada una produce una posición y orientación determinadas. Lo interesante es que **una misma posición puede alcanzarse con distintas configuraciones**. El ejemplo clásico es el brazo plano de dos articulaciones, que llega a un punto con el codo "arriba" o con el codo "abajo".

La elección de la configuración no es trivial: influye en el consumo energético, el tiempo de movimiento, la evitación de obstáculos, la cercanía a singularidades y el desgaste mecánico.

---

## Singularidades

Una **singularidad** es una configuración en la que el robot pierde uno o más grados efectivos de movimiento. En ella, algunos movimientos dejan de ser posibles, pequeñas velocidades articulares producen grandes velocidades del efector, y el control puede volverse inestable. Para sentirlo: extiende del todo un brazo y trata de mover solo el codo; algunas direcciones de movimiento prácticamente desaparecen. En un robot plano, esto ocurre cuando los dos eslabones quedan completamente alineados.

En robots industriales de seis ejes hay tres tipos típicos. La **singularidad de muñeca** ocurre cuando dos o más ejes de la muñeca se alinean, perdiendo temporalmente un grado de libertad rotacional. La **de codo** aparece cuando los eslabones intermedios quedan totalmente extendidos o plegados. Y la **de hombro** se produce cuando los primeros ejes se alinean de forma particular, reduciendo la capacidad de orientar el brazo.

Matemáticamente, una singularidad se detecta cuando el **Jacobiano** pierde rango, es decir, cuando $\det(J)=0$ (tema que se desarrolla en el capítulo del Jacobiano). Los sistemas de control modernos las evitan modificando la trayectoria, eligiendo otra configuración, aprovechando la redundancia, limitando velocidades o replanificando el movimiento.

No todas las zonas del espacio rinden igual: las **regiones de alta destreza** permiten movimientos suaves, alta precisión y buena capacidad de orientación. Para evaluarlas se usan métricas como la manipulabilidad de Yoshikawa, el número de condición del Jacobiano y los elipsoides de velocidad.

---

## Cálculo del espacio de trabajo

Una vez construida la tabla DH y obtenida la cinemática directa, se puede calcular el espacio de trabajo evaluando muchas configuraciones articulares: se varían sistemáticamente los ángulos entre sus límites y se calcula la posición del efector. Este procedimiento, habitual en simuladores y programación offline, genera un mapa del espacio alcanzable:

```python
import numpy as np
import matplotlib.pyplot as plt

L1, L2 = 300, 200
theta1 = np.linspace(0, np.pi, 100)
theta2 = np.linspace(0, np.pi, 100)
x, y = [], []

for t1 in theta1:
    for t2 in theta2:
        x.append(L1*np.cos(t1) + L2*np.cos(t1+t2))
        y.append(L1*np.sin(t1) + L2*np.sin(t1+t2))

plt.scatter(x, y, s=1)
plt.axis("equal")
plt.title("Espacio de trabajo de un manipulador plano de 2 GDL")
plt.xlabel("X (mm)"); plt.ylabel("Y (mm)")
plt.show()
```

---

## Ingeniería en la práctica

Antes de adquirir un robot, los ingenieros verifican que su espacio de trabajo cubra todas las posiciones de la aplicación. En una línea de soldadura automotriz, el robot debe alcanzar todos los puntos de la carrocería sin entrar en singularidades; en una celda de paletizado, cubrir el área de recepción y el pallet completo; en robótica quirúrgica, adaptarse al área anatómica minimizando movimientos innecesarios. Un robot con espacio insuficiente o singularidades frecuentes aumenta los tiempos de ciclo, reduce la precisión e incluso puede impedir la ejecución segura de la tarea.

Conviene evitar errores comunes: suponer que el robot alcanza cualquier punto, ignorar los límites articulares, confundir el espacio alcanzable con el útil, programar trayectorias que atraviesan singularidades, o pensar que una singularidad es un fallo —en realidad es una propiedad geométrica del mecanismo—.

---

## Resumen del capítulo

Estudiamos el espacio de trabajo, las configuraciones y las singularidades de los manipuladores: cómo la geometría determina las posiciones alcanzables, la diferencia entre espacio alcanzable y útil, las múltiples configuraciones para una misma posición, y las consecuencias de las singularidades sobre el control. Son conceptos esenciales antes de construir el modelo DH.

---

### Conceptos clave

- Espacio de trabajo
- Espacio alcanzable
- Espacio útil (dexterous workspace)
- Configuración
- Singularidad
- Región de destreza
- Manipulabilidad
- Límites articulares

---

### Ejercicios propuestos

1. Represente gráficamente el espacio de trabajo de un manipulador plano de 2 GDL y analice cómo cambia al modificar la longitud de los eslabones.
2. Explique por qué un robot antropomórfico puede alcanzar un punto con "codo arriba" y "codo abajo", y discuta ventajas y desventajas de cada configuración.
3. Investigue un robot comercial e identifique sus posibles configuraciones singulares y cómo el fabricante recomienda evitarlas.
4. Con un modelo de dos articulaciones, identifique una configuración singular y explique geométricamente la pérdida de movilidad.

---

### Avance del siguiente capítulo

En el próximo capítulo estudiaremos la **asignación de marcos de referencia**: cómo colocar correctamente los sistemas de coordenadas sobre cada eslabón. Es el paso previo e indispensable para construir la tabla del método de Denavit-Hartenberg.

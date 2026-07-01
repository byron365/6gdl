---
titulo: "Asignación de Marcos de Referencia"
numero: 15
parteNumero: 3
parteTitulo: "Cinemática de Manipuladores Robóticos"
slug: "cap-15-asignacion-de-marcos-de-referencia"
orden: 15
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Comprender por qué la asignación de marcos precede a la tabla DH.
- Aplicar las reglas para definir los ejes Z, X, Y y el origen de cada marco.
- Resolver los casos de ejes secantes, paralelos y coincidentes.
- Reconocer los marcos especiales: base, efector y herramienta.

---

## El verdadero primer paso del método DH

Un error frecuente es pensar que el método de Denavit-Hartenberg empieza con la tabla de parámetros. En realidad, el primer paso —y el más importante— es **definir correctamente los sistemas de referencia**. Si los marcos se asignan mal, la tabla DH será incorrecta, las matrices homogéneas serán incorrectas y la cinemática completa será incorrecta. Por eso, antes de aprender el método DH es imprescindible dominar la asignación de marcos.

Cada eslabón puede trasladarse, rotar y cambiar de orientación, así que necesita su propio sistema de coordenadas, y cada transformación homogénea describirá la relación entre dos marcos consecutivos. Una aclaración que suele confundir: en la convención DH clásica se asigna **un marco por cada articulación**, no por cada eslabón.

---

## Paso 1: el eje Z es el eje de movimiento

La regla más importante de todo el procedimiento es: **el eje $Z_i$ siempre coincide con el eje de movimiento de la articulación**. En una articulación revoluta, $Z$ apunta en la dirección del eje de rotación; en una prismática, en la dirección del desplazamiento. Identificar cómo se mueve cada articulación define automáticamente su eje Z.

---

## Paso 2: el eje X y la normal común

Para definir el eje X hay que estudiar la relación geométrica entre dos ejes Z consecutivos, $Z_i$ y $Z_{i+1}$, que pueden encontrarse en tres situaciones. Si son **secantes**, se cruzan en un punto y su distancia mínima es cero. Si son **paralelos**, nunca se cruzan y su distancia es constante (caso muy frecuente en SCARA y cartesianos). Y si son **coincidentes**, son exactamente el mismo eje, lo que requiere un tratamiento especial.

Cuando los ejes no coinciden, se traza la **normal común**: la línea perpendicular a ambos. Esta línea determina la dirección del eje $X_i$, que debe apuntar **desde $Z_i$ hacia $Z_{i+1}$** siguiendo la normal común. Los casos particulares se resuelven así: si los ejes se cortan, no hay normal común única y $X$ se elige perpendicular al plano que forman ambos ejes; si son paralelos, la normal es única y $X$ la sigue exactamente; y si coinciden, hay infinitas normales posibles, por lo que $X$ se elige libremente manteniendo la ortogonalidad y facilitando el modelado.

---

## Pasos 3 y 4: origen y eje Y

Una vez definidos Z y X, se elige el **origen**, normalmente en la intersección entre el eje Z y la normal común. Finalmente, el eje **Y nunca se elige directamente**: se obtiene aplicando la regla de la mano derecha para garantizar un sistema ortogonal de orientación positiva:

$$
Y = Z \times X
$$

En resumen, el procedimiento es: identificar Z, encontrar la normal común, definir X, elegir el origen y obtener Y con la regla de la mano derecha.

---

## Ejemplos por tipo de robot

El procedimiento se adapta a cada arquitectura. En un **robot de una articulación revoluta**, Z coincide con el eje de giro, X se elige perpendicular a Z, e Y se obtiene con la mano derecha. En un **robot SCARA**, los ejes son paralelos, así que la normal común los une y X la sigue. En un **robot antropomórfico**, los ejes de las primeras articulaciones suelen cortarse, por lo que X se define perpendicular al plano que forman. Y en un **robot cartesiano**, con ejes paralelos, la asignación resulta especialmente sencilla.

Algunos marcos son especiales. El sistema $\{0\}$ se fija a la **base** y es la referencia global del manipulador. Si hay una **herramienta**, se añade un marco adicional $\{T\}$. Y el último sistema, el del **efector**, suele colocarse en el centro de la herramienta o TCP (*Tool Center Point*).

---

## En la práctica y errores comunes

Los simuladores robóticos —RoboDK, MATLAB Robotics Toolbox, ROS con RViz o CoppeliaSim— requieren una correcta definición de los marcos para que el modelo coincida con el robot físico. Un error en la orientación de un solo eje puede generar trayectorias imposibles, colisiones o posiciones incorrectas del efector, por lo que en la práctica profesional se revisa cuidadosamente cada marco antes de validar el modelo. En Python, un marco se representa con su origen y una matriz cuyas columnas son los ejes X, Y y Z:

```python
import numpy as np

origin = np.array([100, 50, 0])
x_axis = np.array([1, 0, 0])
y_axis = np.array([0, 1, 0])
z_axis = np.array([0, 0, 1])

frame = np.column_stack((x_axis, y_axis, z_axis))
print("Origen:", origin)
print("Orientación:\n", frame)
```

Conviene evitar errores típicos: colocar Z en una dirección distinta al movimiento de la articulación, elegir un X que no sea perpendicular a los Z consecutivos, no respetar la regla de la mano derecha, cambiar arbitrariamente el origen, o confundir la convención DH clásica con la modificada.

---

## Relación con Denavit-Hartenberg

Una vez definidos correctamente todos los marcos, cada transformación entre marcos consecutivos podrá describirse con solo cuatro parámetros: $\theta_i$, $d_i$, $a_i$ y $\alpha_i$. Precisamente esos parámetros formarán la tabla de Denavit-Hartenberg del siguiente capítulo.

---

## Resumen del capítulo

Estudiamos cómo asignar marcos de referencia a un manipulador: las reglas para definir los ejes Z (el de movimiento), X (la normal común), el origen e Y (con la mano derecha), y cómo resolver los casos de ejes paralelos, secantes y coincidentes. Es el paso previo indispensable para construir la tabla DH.

---

### Conceptos clave

- Marco de referencia
- Eje Z (eje de movimiento)
- Eje X (normal común)
- Normal común
- Regla de la mano derecha
- TCP (Tool Center Point)
- Convención clásica y modificada

---

### Ejercicios propuestos

1. Asigne los marcos de referencia a un manipulador plano de dos articulaciones revolutas y justifique la orientación de cada eje.
2. Repita el procedimiento para un robot SCARA e identifique los casos de ejes paralelos.
3. Considere un robot cartesiano de tres ejes prismáticos y determine sus marcos según la convención clásica.
4. Analice un manipulador de seis ejes (real o simulado) y dibuje los sistemas de referencia de cada articulación antes de construir la tabla DH.

---

### Avance del siguiente capítulo

En el próximo capítulo estudiaremos el **método de Denavit-Hartenberg**: su origen, el significado de sus cuatro parámetros ($\theta$, $d$, $a$ y $\alpha$), la construcción sistemática de la tabla DH y la obtención de las matrices homogéneas de cada articulación, aplicándolo paso a paso a distintos manipuladores.

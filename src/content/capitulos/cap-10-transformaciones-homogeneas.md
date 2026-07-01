---
titulo: "Transformaciones Homogéneas"
numero: 10
parteNumero: 2
parteTitulo: "Fundamentos Matemáticos para la Robótica"
slug: "cap-10-transformaciones-homogeneas"
orden: 10
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Comprender por qué se unen posición y orientación en una sola matriz 4×4.
- Construir e interpretar una matriz de transformación homogénea.
- Transformar puntos, componer transformaciones y calcular su inversa.
- Relacionar las transformaciones homogéneas con el método de Denavit-Hartenberg.

---

## Una sola herramienta para posición y orientación

Ya sabemos representar posiciones con vectores y orientaciones con matrices de rotación. Pero cuando un robot mueve una herramienta, cambian ambas cosas a la vez. ¿Existe una única herramienta matemática capaz de representar posición y orientación simultáneamente? Sí: la **transformación homogénea**, el lenguaje universal de prácticamente todos los algoritmos modernos de robótica.

Trabajar por separado con un vector de posición y una matriz de rotación es poco práctico. La idea de las transformaciones homogéneas es unir ambos en una sola matriz. Para lograrlo, se añade una cuarta coordenada a los puntos: si antes un punto era $(x, y, z)$, ahora se escribe en **coordenadas homogéneas** como $(x, y, z, 1)$. Ese "1" no es una nueva dimensión física, sino un truco matemático —heredado de la geometría proyectiva— que permite expresar rotación y traslación con una única multiplicación de matrices.

---

## La matriz homogénea

Una transformación homogénea tiene siempre esta forma:

$$
T=
\begin{bmatrix}
R & t\\
0 & 1
\end{bmatrix}
=
\begin{bmatrix}
r_{11}&r_{12}&r_{13}&d_x\\
r_{21}&r_{22}&r_{23}&d_y\\
r_{31}&r_{32}&r_{33}&d_z\\
0&0&0&1
\end{bmatrix}
$$

donde $R$ es una matriz de rotación $3\times 3$ y $t$ un vector de traslación $3\times 1$. Cada parte tiene un significado físico claro: el bloque $3\times 3$ describe la **orientación** del nuevo sistema, la última columna describe la **posición** de su origen, y la última fila siempre vale $0\ 0\ 0\ 1$. Visto por columnas, las tres primeras son las direcciones de los ejes X, Y y Z del nuevo sistema, y la cuarta es la posición de su origen. En otras palabras, una matriz homogénea **describe completamente un sistema de referencia**.

---

## Transformar un punto

Para transformar un punto $P_H = (x, y, z, 1)$ basta una multiplicación:

$$
P'_H = T\,P_H
$$

que aplica la rotación y la traslación de una sola vez. Por ejemplo, una traslación pura ($R=I$) de $t=(2, 3, 1)$ da la matriz:

$$
T=
\begin{bmatrix}
1&0&0&2\\
0&1&0&3\\
0&0&1&1\\
0&0&0&1
\end{bmatrix}
$$

y al aplicarla al punto $(1, 2, 1, 1)$ obtenemos $(3, 5, 2, 1)$, justo el punto desplazado.

---

## Composición y cambio de referencia

La notación ${}^{0}T_{1}$ se lee como "la transformación que expresa coordenadas del sistema $\{1\}$ respecto al sistema $\{0\}$". Lo más potente es que las transformaciones se **encadenan multiplicándolas**. Si tenemos tres sistemas y queremos pasar directamente del $\{0\}$ al $\{2\}$:

$$
{}^{0}T_{2} = {}^{0}T_{1}\,{}^{1}T_{2}
$$

Esta propiedad es la que hace que las transformaciones homogéneas sean ideales para modelar robots articulados. En un robot de seis articulaciones, la transformación total desde la base hasta el efector es simplemente el producto de las seis:

$$
T = T_1 T_2 T_3 T_4 T_5 T_6
$$

Como con las rotaciones, **el orden importa**: $T_1 T_2 \neq T_2 T_1$. Exactamente este procedimiento se usa en el método de Denavit-Hartenberg.

---

## Inversa de una transformación

A menudo necesitamos volver del sistema nuevo al anterior. La inversa de una transformación homogénea tiene una forma cerrada muy cómoda:

$$
T^{-1}=
\begin{bmatrix}
R^T & -R^T t\\
0 & 1
\end{bmatrix}
$$

es decir, la rotación se transpone (porque las rotaciones son ortogonales) y la traslación se recalcula a partir de ella. Esto evita tener que invertir una matriz 4×4 completa. Toda transformación homogénea válida es invertible, conserva distancias y ángulos, se compone por multiplicación y describe por completo un sistema de referencia.

---

## Transformaciones activas y pasivas

Una misma transformación admite dos lecturas equivalentes. En la interpretación **activa**, el objeto se mueve y el sistema permanece fijo. En la **pasiva**, el objeto se queda quieto y lo que cambia es el sistema de referencia desde el que lo observamos. Matemáticamente son idénticas, aunque conceptualmente distintas.

Las transformaciones homogéneas aparecen en casi toda la robótica: cinemática directa e inversa, planeación de trayectorias, jacobianos, dinámica, control, calibración, visión artificial, SLAM y simulación.

---

## Relación con Denavit-Hartenberg

Cada articulación de un robot se describe con una transformación homogénea. El método de Denavit-Hartenberg ofrece una forma sistemática de construir esa matriz usando solo cuatro parámetros (θ, d, a y α): cada fila de la tabla DH genera exactamente una matriz homogénea, y todas se multiplican para obtener la posición y orientación del efector respecto a la base.

En Python con NumPy, transformar un punto es tan directo como multiplicar la matriz por el vector:

```python
import numpy as np

T = np.array([
    [1, 0, 0, 2],
    [0, 1, 0, 3],
    [0, 0, 1, 1],
    [0, 0, 0, 1]
])

P = np.array([[1], [2], [1], [1]])

P_prima = T @ P
print(P_prima)   # -> [[3] [5] [2] [1]]
```

---

## Resumen del capítulo

Introdujimos las transformaciones homogéneas como herramienta para representar a la vez posición y orientación. Vimos la construcción de la matriz 4×4, el significado de cada bloque, cómo transformar puntos, cómo componer transformaciones encadenándolas y cómo calcular su inversa. Es el fundamento inmediato del método de Denavit-Hartenberg.

---

### Conceptos clave

- Transformación homogénea
- Coordenadas homogéneas
- Matriz 4×4
- Composición de transformaciones
- Cambio de referencia
- Inversa de una transformación

---

### Ejercicios propuestos

1. Construya una matriz homogénea que represente una traslación de 150 mm en X, 50 mm en Y y 25 mm en Z, sin rotación.
2. Aplique esa transformación al punto $P=(100, 20, 30, 1)$ y determine su nueva posición.
3. Construya una matriz homogénea que represente una rotación de 90° alrededor de Z seguida de una traslación de 100 mm sobre X.
4. Calcule la inversa de la matriz anterior y verifique que $T^{-1}T=I$.

---

### Avance del siguiente capítulo

En el siguiente capítulo estudiaremos la **composición de transformaciones y los cambios de referencia**, encadenando varias transformaciones para describir sistemas cinemáticos complejos. Es el último paso matemático antes de la **cinemática directa** y el **método de Denavit-Hartenberg**.

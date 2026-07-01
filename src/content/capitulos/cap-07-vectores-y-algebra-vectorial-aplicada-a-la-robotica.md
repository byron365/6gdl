---
titulo: "Vectores y Álgebra Vectorial Aplicada a la Robótica"
numero: 7
parteNumero: 2
parteTitulo: "Fundamentos Matemáticos para la Robótica"
slug: "cap-07-vectores-y-algebra-vectorial-aplicada-a-la-robotica"
orden: 7
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Diferenciar escalares de vectores y operar con estos últimos.
- Calcular magnitud, vector unitario, suma, resta y producto por escalar.
- Comprender el producto escalar y el producto vectorial y sus aplicaciones.
- Relacionar los vectores unitarios de un marco con las matrices de rotación.

---

## Escalares y vectores

La robótica moderna se construye sobre el álgebra vectorial: cuando un robot mueve su efector, orienta una herramienta o aplica una fuerza, está operando con vectores. Por eso, antes de las matrices de rotación, conviene dominar este lenguaje.

Un **escalar** es una cantidad que solo tiene magnitud, sin dirección ni sentido: la masa, la temperatura, el tiempo o el voltaje son escalares (una temperatura de 25 °C no apunta a ningún lado). Un **vector**, en cambio, tiene magnitud, dirección y sentido a la vez, y se dibuja como una flecha. En robótica se usan vectores para representar posición, velocidad, aceleración, fuerza, torque, orientación y gravedad; casi todo movimiento puede expresarse con ellos.

Matemáticamente, un vector tridimensional se escribe como una columna:

$$
\vec{v}=
\begin{bmatrix}
x\\
y\\
z
\end{bmatrix}
$$

y representa un desplazamiento desde el origen hasta un punto del espacio.

---

## Magnitud, vector unitario y vectores base

La **magnitud** de un vector es su longitud, y se calcula con el teorema de Pitágoras:

$$
|\vec{v}|=\sqrt{x^2+y^2+z^2}
$$

Por ejemplo, para $\vec{v}=(3, 4, 0)$, la magnitud es $\sqrt{3^2+4^2}=5$.

Un **vector unitario** tiene magnitud 1 y se obtiene dividiendo el vector por su magnitud, $\hat{u}=\dfrac{\vec{v}}{|\vec{v}|}$. Para el mismo ejemplo, $\hat{u}=(0.6,\ 0.8,\ 0)$. Los tres **vectores base** son los unitarios que apuntan a lo largo de los ejes X, Y y Z:

$$
\hat{i}=\begin{bmatrix}1\\0\\0\end{bmatrix}\quad
\hat{j}=\begin{bmatrix}0\\1\\0\end{bmatrix}\quad
\hat{k}=\begin{bmatrix}0\\0\\1\end{bmatrix}
$$

---

## Operaciones básicas

La **suma** y la **resta** se hacen componente por componente:

$$
\vec{A}+\vec{B}=
\begin{bmatrix}
A_x+B_x\\
A_y+B_y\\
A_z+B_z
\end{bmatrix}
\qquad
\vec{A}-\vec{B}=
\begin{bmatrix}
A_x-B_x\\
A_y-B_y\\
A_z-B_z
\end{bmatrix}
$$

Por ejemplo, $(2,1,3)+(1,4,2)=(3,5,5)$. La resta es útil para calcular el desplazamiento entre dos puntos. La **multiplicación por un escalar** $k\vec{v}$ mantiene la dirección pero cambia la longitud: $2\cdot(1,2,3)=(2,4,6)$.

---

## Producto escalar (producto punto)

El producto escalar combina dos vectores y devuelve un número:

$$
\vec{A}\cdot\vec{B}=A_xB_x+A_yB_y+A_zB_z = |A||B|\cos\theta
$$

Mide qué tan alineados están dos vectores: positivo si apuntan en direcciones similares, negativo si son opuestas, y **cero si son perpendiculares**. Por ejemplo, $(2,1,0)\cdot(3,2,0)=6+2+0=8$. En robótica se usa para calcular ángulos, detectar perpendicularidad, proyectar vectores y calcular trabajo mecánico.

Una aplicación frecuente es la **proyección** de un vector sobre otro, que indica cuánto de $A$ apunta en la dirección de $B$:

$$
\mathrm{proj}_B(A)=\frac{A\cdot B}{|B|^2}\,B
$$

---

## Producto vectorial (producto cruz)

El producto vectorial $\vec{A}\times\vec{B}$ devuelve **otro vector**, perpendicular a los dos originales, cuya magnitud equivale al área del paralelogramo que forman. Se calcula como un determinante:

$$
\vec{A}\times\vec{B}=
\begin{vmatrix}
\hat{i}&\hat{j}&\hat{k}\\
A_x&A_y&A_z\\
B_x&B_y&B_z
\end{vmatrix}
$$

La dirección del resultado se obtiene con la regla de la mano derecha (índice hacia $A$, medio hacia $B$, pulgar hacia $A\times B$). A diferencia del producto escalar, **el orden importa**:

$$
\vec{A}\times\vec{B}=-(\vec{B}\times\vec{A})
$$

Este producto aparece continuamente en el cálculo del torque, la velocidad angular, los jacobianos y la dinámica. El **torque**, por ejemplo, es el producto vectorial del brazo de palanca por la fuerza:

$$
\vec{\tau}=\vec{r}\times\vec{F}
$$

---

## Vectores y marcos de referencia

Cada sistema de referencia de un robot se describe con tres vectores unitarios ortogonales entre sí: precisamente sus ejes X, Y y Z. En el próximo capítulo veremos que estos tres vectores forman las columnas de una **matriz de rotación**, que es como la orientación de un marco se representa matemáticamente.

Conviene evitar errores comunes: confundir un punto con un vector, olvidar normalizar cuando se necesita un unitario, invertir el orden del producto vectorial, o usar el producto escalar cuando se requiere el vectorial.

---

## Resumen del capítulo

Estudiamos el álgebra vectorial aplicada a la robótica: la diferencia entre escalares y vectores, sus magnitudes, vectores unitarios y operaciones básicas, y los productos escalar y vectorial. Estas herramientas son esenciales para describir fuerzas, velocidades, orientaciones y movimientos.

---

### Conceptos clave

- Escalar
- Vector
- Magnitud
- Vector unitario
- Producto escalar
- Producto vectorial
- Torque
- Proyección
- Regla de la mano derecha

---

### Avance del siguiente capítulo

En el próximo capítulo estudiaremos el **álgebra matricial**: cómo construir y multiplicar matrices y por qué son el lenguaje para describir las transformaciones y orientaciones de los robots, paso previo a las matrices de rotación y las transformaciones homogéneas.

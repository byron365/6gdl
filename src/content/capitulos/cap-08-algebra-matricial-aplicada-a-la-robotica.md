---
titulo: "Álgebra Matricial Aplicada a la Robótica"
numero: 8
parteNumero: 2
parteTitulo: "Fundamentos Matemáticos para la Robótica"
slug: "cap-08-algebra-matricial-aplicada-a-la-robotica"
orden: 8
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Reconocer los tipos de matrices más usados en robótica.
- Operar con matrices: suma, producto, transpuesta, determinante e inversa.
- Comprender por qué el producto matricial no es conmutativo.
- Resolver sistemas lineales de la forma AX = B.

---

## ¿Qué es una matriz?

Los robots no solo necesitan posiciones: deben rotar objetos, cambiar de sistema de referencia y resolver ecuaciones cinemáticas, y todas esas operaciones se hacen con **matrices**. Una matriz es un arreglo rectangular de números organizados en filas y columnas, que se nombra con una letra mayúscula:

$$
A=
\begin{bmatrix}
1 & 2 & 3\\
4 & 5 & 6
\end{bmatrix}
$$

Su **dimensión** se expresa como $m\times n$, donde $m$ es el número de filas y $n$ el de columnas; la matriz anterior es $2\times 3$. Cada elemento se identifica con dos índices, $a_{ij}$ (fila $i$, columna $j$): en una matriz $\begin{bmatrix}2&5\\7&1\end{bmatrix}$, tenemos $a_{11}=2$, $a_{12}=5$, $a_{21}=7$ y $a_{22}=1$.

---

## Tipos de matrices

En robótica aparecen varios tipos. Una **matriz fila** tiene una sola fila ($1\times n$) y una **matriz columna** una sola columna ($m\times 1$) —esta última es como un vector—. La **matriz cuadrada** tiene igual número de filas y columnas, y es la más usada.

Entre las cuadradas destacan algunas especiales. La **matriz identidad** $I$ tiene unos en la diagonal y ceros en el resto; es el equivalente al número 1, porque $AI=IA=A$:

$$
I=
\begin{bmatrix}
1&0&0\\
0&1&0\\
0&0&1
\end{bmatrix}
$$

La **matriz diagonal** solo tiene valores no nulos en la diagonal principal; la **matriz nula** tiene todos sus elementos en cero; y la **matriz simétrica** es igual a su transpuesta ($A=A^T$).

La **transpuesta** $A^T$ se obtiene intercambiando filas por columnas:

$$
A=\begin{bmatrix}1&2\\3&4\end{bmatrix}
\quad\Rightarrow\quad
A^T=\begin{bmatrix}1&3\\2&4\end{bmatrix}
$$

---

## Operaciones básicas

La **suma** y la **resta** solo son posibles entre matrices de la misma dimensión, y se hacen elemento por elemento. Por ejemplo:

$$
\begin{bmatrix}1&2\\3&4\end{bmatrix}+
\begin{bmatrix}5&1\\2&0\end{bmatrix}=
\begin{bmatrix}6&3\\5&4\end{bmatrix}
$$

La **multiplicación por un escalar** multiplica cada elemento por ese número: $3A$ triplica cada entrada de $A$.

---

## Producto de matrices

Es probablemente la operación más importante de toda la robótica. Dos matrices pueden multiplicarse solo si **el número de columnas de A es igual al número de filas de B**; las dimensiones internas desaparecen y quedan las externas:

$$
(2\times 3)\cdot(3\times 4) = (2\times 4)
$$

Por ejemplo:

$$
\begin{bmatrix}1&2\\3&4\end{bmatrix}
\begin{bmatrix}5&6\\7&8\end{bmatrix}=
\begin{bmatrix}19&22\\43&50\end{bmatrix}
$$

La diferencia más importante respecto a los números es que el producto matricial **no es conmutativo**: en general $AB\neq BA$. Sí cumple, en cambio, la propiedad asociativa $A(BC)=(AB)C$ y la distributiva $A(B+C)=AB+AC$.

---

## Determinante e inversa

El **determinante** es un número asociado a una matriz cuadrada, escrito $|A|$. Para una matriz $2\times 2$:

$$
A=\begin{bmatrix}a&b\\c&d\end{bmatrix}
\quad\Rightarrow\quad
|A|=ad-bc
$$

Por ejemplo, $\begin{vmatrix}2&3\\1&5\end{vmatrix}=10-3=7$. En robótica el determinante sirve para verificar si una matriz es invertible, detectar singularidades y validar matrices de rotación.

La **matriz inversa** $A^{-1}$ cumple $AA^{-1}=I$, y solo existe cuando $|A|\neq 0$. Para una matriz $2\times 2$ se obtiene intercambiando la diagonal, cambiando el signo de los otros dos elementos y dividiendo todo por el determinante. Por ejemplo, para $A=\begin{bmatrix}2&1\\5&3\end{bmatrix}$ el determinante es $2\cdot 3 - 1\cdot 5 = 1$, así que:

$$
A^{-1}=\frac{1}{|A|}
\begin{bmatrix}3&-1\\-5&2\end{bmatrix}=
\begin{bmatrix}3&-1\\-5&2\end{bmatrix}
$$

La inversa se usa para cambiar de sistema de referencia, resolver la cinemática inversa y en la localización y navegación.

---

## Sistemas de ecuaciones lineales

Muchas ecuaciones de la robótica se escriben en forma matricial $AX=B$:

$$
\begin{bmatrix}2&1\\1&3\end{bmatrix}
\begin{bmatrix}x\\y\end{bmatrix}=
\begin{bmatrix}5\\7\end{bmatrix}
$$

Si existe la inversa de $A$, la solución es $X=A^{-1}B$. Este procedimiento es habitual en cinemática y control.

---

## Las matrices en robótica

Las matrices aparecen en casi todas las áreas, cada aplicación con su tamaño característico:

| Aplicación | Tipo de matriz |
|------------|----------------|
| Rotaciones | 3×3 |
| Transformaciones homogéneas | 4×4 |
| Jacobiano | 6×n |
| Matriz de inercia | n×n |
| Matriz DH | 4×4 |
| Calibración | 3×3 o 4×4 |

El método de Denavit-Hartenberg, en particular, usa una matriz homogénea de **4×4** para describir la transformación entre dos marcos consecutivos, obtenida a partir de cuatro parámetros geométricos. Por eso dominar el álgebra matricial es indispensable antes de las matrices de rotación y las transformaciones homogéneas.

Conviene evitar errores comunes: sumar matrices de dimensiones distintas, multiplicar ignorando la compatibilidad de dimensiones, asumir que $AB=BA$, intentar invertir una matriz con determinante cero, o confundir la transpuesta con la inversa.

---

## Resumen del capítulo

Presentamos las matrices como herramienta fundamental del modelado robótico: sus tipos, las operaciones básicas, el producto matricial, la transpuesta, el determinante y la inversa, y cómo se usan para resolver sistemas lineales y representar transformaciones.

---

### Conceptos clave

- Matriz
- Dimensión
- Matriz identidad
- Transpuesta
- Producto matricial
- Determinante
- Matriz inversa
- Sistema lineal

---

### Avance del siguiente capítulo

En el siguiente capítulo estudiaremos las **matrices de rotación**, uno de los conceptos más importantes de la robótica: cómo representar rotaciones en 2D y 3D, cómo construirlas alrededor de los ejes X, Y y Z, y por qué preservan distancias y ángulos. Serán la base de las transformaciones homogéneas y del método de Denavit-Hartenberg.

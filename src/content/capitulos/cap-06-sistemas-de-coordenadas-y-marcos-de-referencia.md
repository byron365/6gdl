---
titulo: "Sistemas de Coordenadas y Marcos de Referencia"
numero: 6
parteNumero: 2
parteTitulo: "Fundamentos Matemáticos para la Robótica"
slug: "cap-06-sistemas-de-coordenadas-y-marcos-de-referencia"
orden: 6
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Comprender por qué toda posición en robótica es relativa a un sistema de referencia.
- Diferenciar un punto de un vector.
- Entender qué es un marco de referencia y la regla de la mano derecha.
- Distinguir el sistema global de los sistemas locales de un robot.

---

## Toda posición es relativa

Todo problema de robótica comienza con una pregunta aparentemente sencilla: *¿dónde está el robot?* Si alguien dice "la herramienta está en la posición (1.5, 0.8, 0.4)", la información está incompleta, porque falta responder: **¿respecto a qué sistema de referencia?** En robótica no existe la posición absoluta: toda posición es relativa a un sistema de coordenadas. Precisamente por eso el método de Denavit-Hartenberg consiste en asignar un sistema de coordenadas a cada eslabón del robot.

Un **sistema de coordenadas** es un conjunto de ejes que permite describir matemáticamente la posición de un punto en el espacio, dando una referencia común para medir posiciones, orientaciones y movimientos. En dos dimensiones, un punto se define con dos valores, $P=(x, y)$; en las tres dimensiones en las que trabajan los robots se añade un tercer eje, y el punto pasa a ser $P=(x, y, z)$. Por convención, X suele ir de izquierda a derecha, Y de adelante hacia atrás y Z de arriba abajo, aunque lo esencial es mantener la consistencia durante todo el análisis. Todo sistema tiene un **origen** $O=(0,0,0)$, el punto desde el cual se miden todas las posiciones.

---

## Punto y vector

Aunque se escriban de forma parecida, un punto y un vector son cosas distintas. Un **punto** representa únicamente una posición —un lugar en el espacio— y no tiene dirección ni longitud. Un **vector**, en cambio, representa dirección, sentido y magnitud, y suele dibujarse como una flecha:

$$
\vec{v}=
\begin{bmatrix}
x\\
y\\
z
\end{bmatrix}
$$

| Punto | Vector |
|--------|---------|
| Indica una posición | Indica un desplazamiento |
| No posee dirección | Tiene dirección |
| No posee sentido | Tiene sentido |
| Se expresa con coordenadas | Se expresa con componentes |

Esta diferencia será muy importante al estudiar las matrices homogéneas.

---

## Marcos de referencia

En robótica no basta con hablar de ejes sueltos: se usa un concepto más completo, el **marco de referencia** (*frame*), formado por un origen y tres ejes (X, Y, Z). Cada marco es un sistema de coordenadas completo.

¿Por qué usar varios? Porque un robot tiene muchas piezas móviles, y conviene que cada una —la base, cada articulación, el efector— tenga su propio marco, para describir su movimiento de forma independiente.

```mermaid
graph TD

A[{0} Base]

A --> B[{1} Primer eslabón]

B --> C[{2} Segundo eslabón]

C --> D[{3} Tercer eslabón]

D --> E[Efector Final]
```

Normalmente se distinguen dos clases. El **sistema global** (también llamado base, mundo o *world frame*), denotado $\{0\}$, es fijo y nunca cambia. Los **sistemas locales** $\{1\}, \{2\}, \{3\}, \dots$ pertenecen a cada eslabón y sí se mueven con el robot. Es como un automóvil: respecto a la carretera el automóvil se mueve, pero respecto al propio automóvil el conductor permanece inmóvil. Ambas afirmaciones son correctas; todo depende del sistema de referencia.

---

## Orientación y regla de la mano derecha

Conocer la posición del origen no es suficiente: también hay que saber cómo están orientados los ejes. Dos marcos pueden compartir origen y, aun así, tener orientaciones distintas.

Para garantizar la coherencia, en robótica casi todas las convenciones usan la **regla de la mano derecha**: si el índice apunta hacia X y el dedo medio hacia Y, el pulgar señala automáticamente el sentido positivo de Z. Esta regla mantiene la consistencia en las rotaciones y en los productos vectoriales.

La notación que usaremos en todo el libro es la habitual: $\{i\}$ para el sistema del eslabón $i$, con $O_i$ su origen y $X_i, Y_i, Z_i$ sus ejes.

---

## Importancia en Denavit-Hartenberg

El método DH consiste justamente en asignar un marco a cada articulación siguiendo reglas específicas, y luego calcular la transformación entre marcos consecutivos:

$$
\{0\}\rightarrow\{1\}\rightarrow\{2\}\rightarrow\cdots\rightarrow\{n\}
$$

Estas transformaciones permitirán conocer la posición y orientación del efector final respecto a la base. Conviene evitar algunos errores comunes: confundir un punto con un vector, cambiar arbitrariamente la orientación de los ejes, no aplicar la regla de la mano derecha, o mezclar coordenadas de distintos sistemas sin indicar a qué marco pertenecen.

Por ejemplo, si la herramienta de un robot está en $P=(400, 250, 150)$ mm respecto a la base, esas cifras son 400 mm sobre X, 250 sobre Y y 150 sobre Z. Si definimos un nuevo marco en el extremo del primer eslabón, las coordenadas de ese mismo punto cambiarán, aunque la herramienta no se haya movido ni un milímetro. Esa idea es la base de las transformaciones homogéneas.

---

## Resumen del capítulo

Introdujimos los sistemas de coordenadas y los marcos de referencia, fundamentales para describir la posición y orientación de un robot. Diferenciamos punto y vector, vimos la importancia de la regla de la mano derecha y comprobamos que un mismo objeto puede tener coordenadas distintas según el marco usado. Es el fundamento geométrico del método de Denavit-Hartenberg.

---

### Conceptos clave

- Sistema de coordenadas
- Marco de referencia (frame)
- Origen
- Punto
- Vector
- Sistema global
- Sistema local
- Regla de la mano derecha

---

### Avance del siguiente capítulo

En el próximo capítulo estudiaremos los **vectores y el álgebra vectorial**: suma, resta, producto escalar y producto vectorial, y su aplicación para describir movimientos, fuerzas y orientaciones. Serán indispensables para las matrices de rotación y las transformaciones homogéneas.

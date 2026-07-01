---
titulo: "El Método de Denavit-Hartenberg"
numero: 16
parteNumero: 3
parteTitulo: "Cinemática de Manipuladores Robóticos"
slug: "cap-16-el-metodo-de-denavit-hartenberg"
orden: 16
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Comprender la idea fundamental del método de Denavit-Hartenberg.
- Interpretar físicamente los cuatro parámetros DH (θ, d, a, α).
- Construir la tabla DH y la matriz homogénea de cada articulación.
- Obtener la cinemática directa multiplicando las matrices.

---

## ¿Cómo modelar un robot completo de forma sistemática?

Ya sabemos representar posiciones y orientaciones, usar transformaciones homogéneas, asignar marcos y analizar el espacio de trabajo. Ahora respondemos a la pregunta clave: *¿cómo describir matemáticamente un robot completo de manera sistemática?* En lugar de construir a mano una transformación para cada articulación, el **método de Denavit-Hartenberg** establece un procedimiento estandarizado que modela cualquier manipulador serial usando solo **cuatro parámetros por articulación**.

El método fue publicado en 1955 por **Jacques Denavit** y **Richard S. Hartenberg**, y simplificó tanto el análisis de mecanismos que sigue siendo, hasta hoy, una de las herramientas más usadas en robótica industrial y académica. Su ventaja es ofrecer un lenguaje común, una representación compacta, fácil de implementar, escalable a manipuladores complejos y compatible con simuladores y bibliotecas de robótica.

---

## Los cuatro parámetros DH

La idea fundamental es que la transformación entre dos marcos consecutivos puede lograrse con **cuatro transformaciones elementales** aplicadas en este orden: rotación alrededor de $Z$, traslación a lo largo de $Z$, traslación a lo largo de $X$ y rotación alrededor de $X$. Cada una corresponde a un parámetro:

- $\theta_i$: rotación alrededor de $Z_i$. Es la rotación que alinea los ejes $X$; en una articulación **revoluta** es la variable, en una prismática es constante.
- $d_i$: traslación sobre $Z_i$. En una articulación **prismática** es la variable, en una revoluta es constante.
- $a_i$: longitud del eslabón, la distancia entre dos ejes consecutivos medida sobre $X_i$ (la longitud de la normal común). Siempre es un parámetro geométrico fijo.
- $\alpha_i$: ángulo de torsión, el ángulo entre $Z_i$ y $Z_{i+1}$ medido alrededor de $X_i$. Describe cómo cambia la orientación entre articulaciones; también es fijo.

| Parámetro | Símbolo | Variable/Fijo | Descripción |
|------------|----------|---------------|-------------|
| Ángulo articular | $\theta$ | Variable en R | Rotación alrededor de $Z$ |
| Desplazamiento | $d$ | Variable en P | Traslación sobre $Z$ |
| Longitud | $a$ | Fijo | Distancia entre ejes |
| Torsión | $\alpha$ | Fijo | Ángulo entre ejes $Z$ |

---

## La matriz DH

Cada una de las cuatro transformaciones elementales es una matriz homogénea 4×4. Al multiplicarlas en orden se obtiene la matriz DH general:

$$
{}^{i-1}T_i = R_z(\theta_i)\,T_z(d_i)\,T_x(a_i)\,R_x(\alpha_i)
$$

cuyo resultado es la ecuación más importante del modelado cinemático mediante DH:

$$
{}^{i-1}T_i=
\begin{bmatrix}
\cos\theta_i & -\sin\theta_i\cos\alpha_i & \sin\theta_i\sin\alpha_i & a_i\cos\theta_i\\
\sin\theta_i & \cos\theta_i\cos\alpha_i & -\cos\theta_i\sin\alpha_i & a_i\sin\theta_i\\
0 & \sin\alpha_i & \cos\alpha_i & d_i\\
0 & 0 & 0 & 1
\end{bmatrix}
$$

Este orden de transformaciones es fundamental y no debe alterarse en la convención clásica.

---

## Construir la tabla DH

Cada articulación aporta una fila a la tabla. Para un manipulador de tres articulaciones:

| i | $\theta_i$ | $d_i$ | $a_i$ | $\alpha_i$ |
|---|------------|-------|-------|------------|
| 1 | θ₁ | d₁ | a₁ | α₁ |
| 2 | θ₂ | d₂ | a₂ | α₂ |
| 3 | θ₃ | d₃ | a₃ | α₃ |

Puedes practicar con el **constructor de tablas DH** interactivo: edita los cuatro parámetros de cada fila y observa cómo se calcula la matriz total y se dibuja el brazo.

Como ejemplo, un **brazo plano RR** con $a_1=L_1$, $a_2=L_2$ y el resto de parámetros nulos tiene esta tabla:

| i | θ | d | a | α |
|---|---|---|---|---|
| 1 | θ₁ | 0 | L₁ | 0 |
| 2 | θ₂ | 0 | L₂ | 0 |

y su transformación total es ${}^{0}T_2 = {}^{0}T_1\,{}^{1}T_2$. En un **robot SCARA**, la tabla refleja dos articulaciones revolutas (donde varía θ) y una prismática (donde varía d), lo que muestra la flexibilidad del método.

---

## Convención clásica y modificada

Existen dos variantes muy usadas. La **convención clásica (Craig)** es la más difundida en textos introductorios y cursos universitarios. La **convención modificada (MDH)** es empleada por varios fabricantes y simuladores, y cambia el orden de las transformaciones y la asignación de los marcos. Conviene conocer ambas; este libro desarrolla primero la clásica.

---

## Obtener la cinemática directa

Una vez construidas las matrices individuales, la cinemática directa es su producto:

$$
{}^{0}T_n = {}^{0}T_1\,{}^{1}T_2\cdots{}^{n-1}T_n
$$

La matriz resultante contiene la orientación, la posición y el sistema de referencia completo del efector. Antes de confiar en un modelo DH conviene verificar que las unidades sean consistentes, que las matrices de rotación sean ortogonales, que $\det(R)=1$ y que las posiciones obtenidas coincidan con la geometría esperada.

En Python, la matriz DH se implementa directamente a partir de la fórmula general:

```python
import numpy as np

def dh(theta, d, a, alpha):
    ct, st = np.cos(theta), np.sin(theta)
    ca, sa = np.cos(alpha), np.sin(alpha)
    return np.array([
        [ct, -st*ca,  st*sa, a*ct],
        [st,  ct*ca, -ct*sa, a*st],
        [0,      sa,     ca,    d],
        [0,       0,      0,    1]
    ])

A1 = dh(np.deg2rad(30), 0, 300, 0)
A2 = dh(np.deg2rad(45), 0, 200, 0)
T = A1 @ A2
print(T)
```

El mismo cálculo en MATLAB con la Robotics Toolbox:

```matlab
A1 = trotz(deg2rad(30)) * transl(300,0,0);
A2 = trotz(deg2rad(45)) * transl(200,0,0);
T = A1 * A2;
disp(T)
```

El método DH se usa para construir modelos que luego se incorporan a simuladores, controladores y planificadores. Algunos fabricantes lo complementan con representaciones alternativas (coordenadas de tornillo, o URDF en ROS) cuando necesitan más flexibilidad, pero comprender DH sigue siendo fundamental porque da una base geométrica clara y facilita validar modelos más avanzados.

Conviene evitar errores comunes: intercambiar el orden de las transformaciones, asignar mal los parámetros, confundir la convención clásica con la modificada, mezclar grados y radianes, o no verificar la orientación de los marcos antes de construir la tabla.

---

## Resumen del capítulo

Presentamos el método de Denavit-Hartenberg como herramienta sistemática para modelar manipuladores seriales: su origen, el significado físico de los cuatro parámetros, la construcción de la tabla, la derivación de la matriz homogénea general y la obtención de la cinemática directa multiplicando las matrices de cada articulación. Con esto se cierra el recorrido desde los fundamentos hasta el modelado completo de un robot.

---

### Conceptos clave

- Método de Denavit-Hartenberg
- Parámetros DH (θ, d, a, α)
- Tabla DH
- Matriz homogénea
- Convención clásica y modificada
- Cinemática directa
- Longitud del eslabón
- Ángulo de torsión

---

### Ejercicios propuestos

1. Construya la tabla DH de un manipulador plano RR y obtenga su matriz de transformación total.
2. Modele con DH un robot cartesiano PPP e identifique qué parámetros son variables y cuáles constantes.
3. Implemente en Python una función que reciba los parámetros DH de una articulación y devuelva su matriz homogénea.
4. Compare la cinemática obtenida con ecuaciones geométricas y con el método DH para un manipulador de 2 GDL.

---

### Cierre del manual

Has recorrido el camino completo: desde qué es un robot y cómo se clasifica, pasando por los fundamentos matemáticos (vectores, matrices, rotaciones y transformaciones homogéneas), hasta la cinemática de manipuladores y el método de Denavit-Hartenberg. Con estas herramientas puedes describir matemáticamente cualquier manipulador serial y calcular la posición y orientación de su efector final. El siguiente paso natural en tu formación sería la cinemática inversa, el Jacobiano y la dinámica de robots.

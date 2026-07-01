---
titulo: "Cinemática Directa"
numero: 12
parteNumero: 3
parteTitulo: "Cinemática de Manipuladores Robóticos"
slug: "cap-12-cinematica-directa"
orden: 12
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Definir la cinemática directa y diferenciarla de la dinámica.
- Calcular la posición del efector de un brazo plano con ecuaciones geométricas.
- Modelar la cinemática directa mediante transformaciones homogéneas.
- Relacionar la cinemática directa con el método de Denavit-Hartenberg.

---

## ¿Dónde está el efector final?

Uno de los problemas fundamentales de la robótica es responder a una pregunta aparentemente sencilla: *¿dónde está el efector final del robot?* Responderla implica considerar a la vez la geometría del manipulador, la longitud de sus eslabones, el tipo de articulaciones, el valor de cada variable articular y la orientación de cada sistema de referencia. La disciplina que resuelve este problema es la **cinemática directa**.

La cinemática es la rama de la mecánica que estudia el movimiento sin considerar las fuerzas que lo producen; analiza el manipulador desde un punto de vista puramente geométrico. No se pregunta qué fuerza ejerce un motor ni cuánto torque se necesita —eso pertenece a la dinámica—.

| Cinemática | Dinámica |
|------------|----------|
| Estudia el movimiento | Estudia las causas del movimiento |
| No considera fuerzas | Considera fuerzas y torques |
| Analiza posición, velocidad y aceleración | Analiza masa, inercia y energía |
| Se basa en geometría | Se basa en las leyes de Newton y Euler |

En concreto, la **cinemática directa** determina la posición y orientación del efector a partir de los valores conocidos de las articulaciones. Sus entradas son los ángulos articulares, los desplazamientos lineales y las dimensiones del robot; su salida es la posición y orientación del efector. La variable de cada articulación depende de su tipo: un ángulo $\theta$ para las rotacionales, un desplazamiento $d$ para las prismáticas.

---

## Cinemática directa de un brazo plano

Empecemos con el ejemplo más conocido de la robótica: un brazo plano de dos articulaciones rotacionales, con eslabones de longitud $L_1$ y $L_2$ y ángulos $\theta_1$ y $\theta_2$. La posición del efector es:

$$
x = L_1\cos\theta_1 + L_2\cos(\theta_1+\theta_2)
$$

$$
y = L_1\sin\theta_1 + L_2\sin(\theta_1+\theta_2)
$$

### Ejemplo numérico

Con $L_1=300$ mm, $L_2=200$ mm, $\theta_1=30°$ y $\theta_2=45°$:

$$
x = 300\cos 30° + 200\cos 75° \approx 311.2\text{ mm}
$$

$$
y = 300\sin 30° + 200\sin 75° \approx 343.2\text{ mm}
$$

de modo que el efector se encuentra aproximadamente en $P=(311.2,\ 343.2)$ mm. Puedes comprobarlo en el simulador interactivo, ajustando ángulos y longitudes.

---

## Del enfoque geométrico al matricial

Las ecuaciones geométricas funcionan bien para robots sencillos, pero al aumentar el número de articulaciones se vuelven larguísimas, llenas de términos trigonométricos y difíciles de mantener. Por eso se usan **transformaciones homogéneas**: cada articulación se representa con una matriz, y la transformación total es su producto. Para un robot de tres grados de libertad:

$$
{}^{0}T_{3} = {}^{0}T_{1}\,{}^{1}T_{2}\,{}^{2}T_{3}
$$

Cada matriz responde a "¿cómo está ubicado un eslabón respecto al anterior?", y al multiplicarlas sucesivamente obtenemos la ubicación del efector respecto a la base.

```mermaid
graph LR

A[Base]

A --> B[Eslabón 1]

B --> C[Eslabón 2]

C --> D[Eslabón 3]

D --> E[Efector Final]
```

Esa matriz final lo contiene todo: en la última columna, la posición del origen del efector; en el bloque $3\times 3$, su orientación. El enfoque matricial permite modelar cualquier número de articulaciones, reutilizar cálculos, implementar algoritmos eficientes e integrar fácilmente sensores y herramientas. Se usa en robots industriales y colaborativos, brazos quirúrgicos, impresoras 3D, máquinas CNC, simuladores y visión artificial.

---

## Implementación en código

En Python, cada eslabón se construye combinando rotaciones y traslaciones:

```python
import numpy as np

def rot_z(theta):
    c, s = np.cos(theta), np.sin(theta)
    return np.array([
        [c, -s, 0, 0],
        [s,  c, 0, 0],
        [0,  0, 1, 0],
        [0,  0, 0, 1]
    ])

def trans_x(a):
    return np.array([
        [1, 0, 0, a],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ])

theta = np.deg2rad(30)
T = rot_z(theta) @ trans_x(300)
print(T)
```

El mismo cálculo en MATLAB usando la Robotics Toolbox:

```matlab
theta = deg2rad(30);
R = trotz(theta);
T = transl(300,0,0);
A = R*T;
disp(A)
```

Conviene evitar errores frecuentes: confundir la cinemática directa con la inversa, usar grados donde se esperan radianes, multiplicar las matrices en orden incorrecto, o mezclar metros y milímetros en un mismo modelo.

---

## Relación con Denavit-Hartenberg

El método de Denavit-Hartenberg ofrece una forma sistemática de construir las matrices homogéneas de cada articulación; una vez construidas, la cinemática directa se obtiene multiplicándolas. Por eso ambos conceptos están estrechamente ligados: la cinemática directa es la puerta de entrada al método DH.

---

## Resumen del capítulo

Introdujimos la cinemática directa como el problema de hallar la posición y orientación del efector a partir de las variables articulares. Vimos el ejemplo geométrico del brazo plano, justificamos el uso de transformaciones homogéneas para modelar manipuladores complejos y mostramos su implementación en código. Es la puerta de entrada al método de Denavit-Hartenberg.

---

### Conceptos clave

- Cinemática
- Cinemática directa
- Variables articulares
- Efector final
- Cadena cinemática
- Transformación homogénea
- Modelo geométrico

---

### Ejercicios propuestos

1. Calcule la posición del efector de un manipulador plano de dos eslabones con $L_1=250$ mm, $L_2=150$ mm, $\theta_1=40°$ y $\theta_2=35°$.
2. Represente con transformaciones homogéneas un manipulador de tres articulaciones rotacionales y escriba la expresión matricial de su cinemática directa.
3. Implemente en Python una función que reciba una lista de matrices homogéneas y devuelva la posición del efector.
4. Explique las ventajas de las transformaciones homogéneas frente a las ecuaciones trigonométricas cuando aumentan los grados de libertad.

---

### Avance del siguiente capítulo

En el próximo capítulo estudiaremos los **tipos de articulaciones y los grados de libertad**: cómo los distintos mecanismos condicionan el movimiento, cómo se calculan los grados de libertad de un manipulador y cómo influyen en su capacidad de alcanzar posiciones y orientaciones.

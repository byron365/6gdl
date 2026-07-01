---
titulo: "Tipos de Articulaciones y Grados de Libertad"
numero: 13
parteNumero: 3
parteTitulo: "Cinemática de Manipuladores Robóticos"
slug: "cap-13-tipos-de-articulaciones-y-grados-de-libertad"
orden: 13
---
---

## Objetivos del capítulo

Al finalizar este capítulo el estudiante será capaz de:

- Identificar los cinco tipos principales de articulaciones y su variable.
- Relacionar las combinaciones de articulaciones con la arquitectura del robot.
- Comprender la movilidad y la redundancia de un manipulador.
- Conectar las variables articulares con el método de Denavit-Hartenberg.

---

## Articulaciones: el origen del movimiento

Todo robot está formado por cuerpos rígidos —los **eslabones**— unidos por **articulaciones**. Los eslabones aportan la estructura; las articulaciones aportan el movimiento. Una articulación es un mecanismo que conecta dos cuerpos y permite uno o varios movimientos relativos entre ellos: rotación, traslación o una combinación de ambas.

Recordemos que un **grado de libertad (GDL)** es un movimiento independiente. Una puerta solo rota (1 GDL); un cajón solo se desliza (1 GDL); y un cuerpo libre en el espacio tiene 6 GDL (tres traslaciones y tres rotaciones). Lo que distingue a cada robot es cómo combina sus articulaciones para controlar algunos o todos esos movimientos.

---

## Los cinco tipos de articulaciones

En robótica existen cinco tipos fundamentales de articulaciones. La **revoluta (R)** permite solo rotación, con variable $\theta$; es la más usada por su precisión y facilidad de control, y aparece en robots antropomórficos, SCARA, colaborativos y humanoides. La **prismática (P)** permite solo movimiento lineal, con variable $d$; ofrece movimiento rectilíneo, gran rigidez y excelente precisión, típica de robots cartesianos, CNC, impresoras 3D y sistemas pick and place.

Las otras tres son menos frecuentes en manipuladores industriales. La **cilíndrica (C)** combina una rotación y una traslación sobre el mismo eje (2 GDL); la **esférica (S)** permite rotación alrededor de varios ejes, como una rótula (3 GDL), y se usa en muñecas robóticas y humanoides; y la **helicoidal (H)** acopla rotación y traslación mediante una rosca, como un tornillo (1 GDL).

| Articulación | Movimiento | Variable | GDL |
|--------------|------------|----------|-----|
| Revoluta (R) | Rotación | $\theta$ | 1 |
| Prismática (P) | Traslación | $d$ | 1 |
| Cilíndrica (C) | Rotación + Traslación | $\theta, d$ | 2 |
| Esférica (S) | Tres rotaciones | Tres ángulos | 3 |
| Helicoidal (H) | Rotación + Traslación acopladas | Paso de rosca | 1 |

---

## Arquitecturas según las articulaciones

La combinación de articulaciones define la arquitectura del manipulador. Las más comunes son la **RRR** (brazo antropomórfico), la **RRP** (SCARA), la **PPP** (cartesiano), la **RPR** (cilíndrico) y la **RRRRRR** (robot industrial de seis ejes). Un robot de 6 GDL puede controlar por completo la posición y la orientación del efector, ubicándolo en cualquier orientación alcanzable dentro de su espacio de trabajo.

Cuando un robot tiene **más grados de libertad de los necesarios** para una tarea —por ejemplo 7 GDL— se dice que es **redundante**: puede alcanzar una misma posición con distintas configuraciones articulares. Esto le permite evitar obstáculos y singularidades, mejorar la maniobrabilidad y optimizar el gasto energético, a costa de un control más complejo y una cinemática inversa que ya no tiene solución única.

---

## Movilidad

La movilidad es el número total de movimientos independientes que permite un mecanismo; en manipuladores de cadena abierta suele coincidir con el número de grados de libertad. Para mecanismos más complejos (cerrados o paralelos) se usa la fórmula de Grübler-Kutzbach:

$$
M=6(n-1)-\sum_{i=1}^{j}(6-f_i)
$$

donde $M$ es la movilidad, $n$ el número de eslabones (incluida la base), $j$ el de articulaciones y $f_i$ los grados de libertad de cada una. Por ejemplo, un manipulador con base, dos eslabones y dos articulaciones revolutas (cada una de 1 GDL) tiene una movilidad de 2 GDL, como cabía esperar.

---

## Relación con la cinemática y con Denavit-Hartenberg

Cada articulación introduce una variable articular, y cada variable genera una transformación homogénea: a más articulaciones, más matrices y más compleja la cinemática. En el método de Denavit-Hartenberg, **cada articulación genera exactamente una fila** de la tabla DH, donde la variable será $\theta$ para las revolutas y $d$ para las prismáticas. Por eso comprender las articulaciones es esencial antes de construir una tabla DH.

En software, un modelo simple de articulación puede representarse así:

```python
class Joint:
    def __init__(self, joint_type, value):
        self.joint_type = joint_type
        self.value = value

j1 = Joint("Revoluta", 30)     # grados
j2 = Joint("Prismatica", 150)  # mm

print(j1.joint_type, j1.value)
print(j2.joint_type, j2.value)
```

Conviene evitar errores comunes: confundir los grados de libertad con el número de motores, suponer que todos los robots de seis ejes tienen el mismo espacio de trabajo, creer que una articulación prismática usa un ángulo como variable, o asumir que más grados de libertad siempre implican mejor desempeño.

---

## Resumen del capítulo

Estudiamos los cinco tipos de articulaciones y su variable, cómo sus combinaciones definen la arquitectura del robot (RRR, RRP, PPP…), y los conceptos de movilidad y redundancia. Vimos también cómo cada articulación se traduce en una fila de la tabla DH, conectando este capítulo con el método de Denavit-Hartenberg.

---

### Conceptos clave

- Articulación
- Grado de libertad (GDL)
- Movilidad
- Articulación revoluta
- Articulación prismática
- Redundancia
- Variable articular
- Arquitectura robótica

---

### Ejercicios propuestos

1. Clasifique según su secuencia de articulaciones: robot cartesiano, SCARA, cilíndrico y brazo antropomórfico de seis ejes. Indique la notación (PPP, RRP, RPR, RRRRRR…) y justifique.
2. Un manipulador tiene dos articulaciones revolutas y dos prismáticas. Indique las variables articulares y el número total de grados de libertad.
3. Explique dos ventajas y dos desventajas de añadir un séptimo grado de libertad a un brazo industrial.
4. Investigue un robot industrial comercial y describa su tipo de articulaciones, sus grados de libertad y sus aplicaciones.

---

### Avance del siguiente capítulo

En el próximo capítulo estudiaremos el **espacio de trabajo, las configuraciones y las singularidades**: cómo las dimensiones y articulaciones de un robot determinan las regiones que puede alcanzar, qué son las configuraciones singulares y por qué representan un reto para el control y la planificación de trayectorias.

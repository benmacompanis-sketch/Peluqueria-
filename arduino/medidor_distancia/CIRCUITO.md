# Proyecto 7 - Medidor de Distancias

## Materiales

| Componente | Cantidad |
|---|---|
| Arduino UNO | 1 |
| Sensor ultrasónico HC-SR04 | 1 |
| Protoboard | 1 |
| Cables (jumpers) | 4 |

---

## A - Circuito en Tinkercad

### Conexiones

```
HC-SR04          Arduino UNO
-------          -----------
VCC    --------> 5V
GND    --------> GND
TRIG   --------> Pin 9  (Digital - Salida)
ECHO   --------> Pin 10 (Digital - Entrada)
```

### Diagrama de conexión (texto)

```
                        +-----+
         +----[USB]----+|     |
         |             ||     |
  [5V]---+             || A   |
  [GND]--+      UNO    || R   |
                       || D   |
  Pin 9 (TRIG) --------|| U   |
  Pin 10(ECHO) --------|| I   |
                       || N   |
                       || O   |
                       +-----+

         +-------------------+
         |    HC-SR04        |
         | [VCC][GND][TRIG][ECHO]|
         |  ( )  ( )         |
         +-------------------+
```

> Para armar el circuito en **Tinkercad**:
> 1. Abrir [tinkercad.com](https://www.tinkercad.com) → Circuits → Crear nuevo
> 2. Agregar Arduino UNO desde la biblioteca
> 3. Agregar sensor ultrasónico (Ultrasonic Distance Sensor)
> 4. Conectar según la tabla de conexiones
> 5. Tomar captura de pantalla del circuito completo

---

## B - Video del circuito físico

El video debe mostrar:
- El **Monitor Serial** con las distancias en centímetros actualizándose
- La **protoboard** con el circuito armado y el sensor midiendo un objeto
- Un papel visible con el **número de grupo y curso**

---

## C - Programa

Ver archivo [`medidor_distancia.ino`](./medidor_distancia.ino)

### Explicación del código

**`setup()`**
- Inicia la comunicación serial a 9600 baudios
- Configura `PIN_TRIG` (pin 9) como salida y `PIN_ECHO` (pin 10) como entrada

**`loop()`**
- Llama a `medirDistancia()` cada 500 ms
- Imprime la distancia en el Monitor Serial
- Muestra alertas si el objeto está muy cerca (< 5 cm) o fuera de rango (> 400 cm)

**`medirDistancia()`**
1. Envía un pulso de 10 µs al pin TRIG
2. Mide cuánto tiempo tarda el pin ECHO en regresar a LOW con `pulseIn()`
3. Aplica la fórmula: `distancia (cm) = (duración_µs × 0.034) / 2`
   - `0.034` = velocidad del sonido en cm/µs
   - Se divide por 2 porque el sonido va y vuelve

### Rango del sensor HC-SR04

| Parámetro | Valor |
|---|---|
| Distancia mínima | 2 cm |
| Distancia máxima | 400 cm |
| Ángulo de detección | 15° |
| Frecuencia ultrasónica | 40 kHz |

### Salida del Monitor Serial (ejemplo)

```
=== Medidor de Distancia ===
Sensor: HC-SR04 | Arduino UNO
----------------------------
Distancia: 12.3 cm
Distancia: 11.8 cm
Distancia: 3.2 cm
  >> OBJETO MUY CERCA <<
Distancia: 245.6 cm
```

/*
  Medidor de Distancia con Sensor Ultrasonico HC-SR04
  Materiales:
    - Arduino UNO
    - Sensor ultrasonico HC-SR04
    - Protoboard
    - Cables

  Conexiones:
    HC-SR04 VCC  --> Arduino 5V
    HC-SR04 GND  --> Arduino GND
    HC-SR04 TRIG --> Arduino Pin 9
    HC-SR04 ECHO --> Arduino Pin 10
*/

const int PIN_TRIG = 9;
const int PIN_ECHO = 10;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  Serial.println("=== Medidor de Distancia ===");
  Serial.println("Sensor: HC-SR04 | Arduino UNO");
  Serial.println("----------------------------");
}

void loop() {
  float distancia = medirDistancia();

  Serial.print("Distancia: ");
  Serial.print(distancia, 1);
  Serial.println(" cm");

  if (distancia < 5.0) {
    Serial.println("  >> OBJETO MUY CERCA <<");
  } else if (distancia > 400.0) {
    Serial.println("  >> FUERA DE RANGO <<");
  }

  delay(500);
}

float medirDistancia() {
  // Asegurar que TRIG empiece en LOW
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);

  // Pulso de 10 microsegundos en TRIG
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // Medir el tiempo que ECHO permanece en HIGH (timeout: 30000 us ~ 5 metros)
  long duracion = pulseIn(PIN_ECHO, HIGH, 30000);

  // Convertir tiempo a distancia: velocidad sonido = 0.034 cm/us, dividir por 2 (ida y vuelta)
  float distancia = (duracion * 0.034) / 2.0;
  return distancia;
}

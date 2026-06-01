# DISEÑO UX/UI — G-M PELUQUEROS PALERMO

---

## 1. PALETA DE COLORES

```
Principal:    #1A1A1A  — Negro carbón      (autoridad, elegancia, cabello)
Acento:       #C8A96E  — Dorado cálido     (premium accesible, calidez)
Secundario:   #F5F0E8  — Crema marfil      (limpieza, fondo cálido)
Texto:        #2C2C2C  — Casi negro        (legibilidad)
Gris suave:   #8A8A8A  — Gris medio        (texto secundario)
Blanco puro:  #FFFFFF  — Blanco            (tarjetas, formularios)
Éxito:        #2D7A4F  — Verde esmeralda   (confirmaciones, disponibilidad)
Alerta:       #C0392B  — Rojo oscuro       (cancelaciones, errores)
```

**Justificación:** Negro + Dorado es la combinación más utilizada por salones premium 
internacionales (Vidal Sassoon, John Paul Mitchell). Transmite profesionalismo sin ser frío. 
El crema marfil aporta calidez que conecta con el trato personalizado que ya distingue al local.

---

## 2. TIPOGRAFÍAS

| Uso                | Fuente             | Peso        | Característica                    |
|--------------------|--------------------|-------------|-----------------------------------|
| Títulos H1–H2      | Playfair Display   | 700 / 900   | Serif elegante, presencia visual  |
| Subtítulos H3–H4   | Cormorant Garamond | 500 / 600   | Refinada, femenina/masculina      |
| Cuerpo de texto    | Inter              | 400 / 500   | Máxima legibilidad web/móvil      |
| UI / Botones       | Inter              | 600 / 700   | Claridad en acciones              |
| Acento decorativo  | Cormorant Garamond | 300 italic  | Frases destacadas, citas          |

**Google Fonts CDN:** Playfair Display + Cormorant Garamond + Inter

---

## 3. ESTILO VISUAL

- **Estética:** Editorial-barrio → lujo accesible. No minimalismo extremo ni recargado.
- **Fotografía:** Fondos oscuros o neutros, primer plano de cabello con textura, 
  fotos del local con luz cálida. Antes/después en formato cuadrado.
- **Iconografía:** Línea fina (stroke), sin relleno sólido. Tamaño 24px/20px.
- **Espaciado:** Generoso. Máximo 70 caracteres por línea. Padding secciones: 80–120px vertical.
- **Sombras:** Sutiles, color oscuro con baja opacidad (box-shadow: 0 4px 24px rgba(0,0,0,0.08)).
- **Bordes:** Radius 8px para tarjetas, 4px para inputs, 999px para botones pill.
- **Animaciones:** Fade-in on scroll (IntersectionObserver), transiciones 300ms ease. 
  Sin animaciones distractoras.

---

## 4. EXPERIENCIA DE USUARIO (UX)

### Principios
1. **Mobile-first** → +70% del tráfico vendrá de móviles.
2. **3 clics a la reserva** → desde la home, máximo 3 acciones hasta confirmar turno.
3. **Confianza visual** → reseñas reales, fotos del local, nombres del equipo.
4. **Velocidad** → Lighthouse score > 90. Imágenes WebP, lazy loading.
5. **Accesibilidad** → WCAG 2.1 AA. Contraste mínimo 4.5:1. Foco de teclado visible.

### Flujo principal (reserva)
```
HOME
  └─► [Reservar turno] CTA
        └─► /turnos
              ├─► 1. Seleccionar servicio (cards visuales)
              ├─► 2. Seleccionar profesional (o "cualquiera")
              ├─► 3. Elegir fecha en calendario
              ├─► 4. Elegir horario disponible
              ├─► 5. Datos del cliente (o login)
              └─► 6. Confirmación + WhatsApp automático
```

### Flujo secundario (primera visita)
```
HOME → Servicios → precio estimado → Galería → Reservar
```

---

## 5. DISEÑO RESPONSIVE

| Breakpoint   | Ancho          | Layout                                    |
|--------------|----------------|-------------------------------------------|
| Mobile S     | 320px          | 1 columna, nav hamburguesa                |
| Mobile L     | 375–428px      | 1 columna, botones full-width             |
| Tablet       | 768px          | 2 columnas, nav horizontal compacto       |
| Desktop      | 1024px         | 3 columnas, nav completo                  |
| Desktop L    | 1280–1440px    | 4 columnas max, contenido max 1200px      |
| Ultra wide   | >1440px        | Centrado con márgenes laterales           |

### Comportamiento específico
- **Header:** sticky en desktop, ocultar en scroll down / mostrar en scroll up en móvil.
- **Sistema de turnos:** wizard de pasos en móvil (step-by-step), panel lateral en desktop.
- **Galería:** slider horizontal en móvil, masonry grid en desktop.
- **Mapa:** altura fija 300px en móvil, 450px en desktop.

# BASE DE DATOS — G-M PELUQUEROS PALERMO
## Motor: PostgreSQL 16

---

## DIAGRAMA DE RELACIONES (texto)

```
branches (sucursales)
    │
    ├──< employees (empleados)
    │       │
    │       ├──< schedules (horarios laborales)
    │       ├──< vacations (ausencias/vacaciones)
    │       └──< employee_services (qué servicios hace cada empleado)
    │
    ├──< service_categories
    │       └──< services (servicios)
    │               └──< employee_services
    │
    └──< appointments (reservas)
            ├── users (cliente)
            ├── employees (profesional asignado)
            ├── services (servicio reservado)
            ├──< payments (pagos)
            └──< notifications (notificaciones enviadas)

users
    ├──< appointments
    ├──< waitlist_entries (lista de espera)
    └──< notifications
```

---

## TABLAS

### 1. `branches` — Sucursales
```sql
CREATE TABLE branches (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    address       TEXT NOT NULL,
    city          VARCHAR(80) NOT NULL,
    phone         VARCHAR(30),
    email         VARCHAR(120),
    whatsapp      VARCHAR(30),
    instagram_url VARCHAR(200),
    facebook_url  VARCHAR(200),
    maps_url      TEXT,
    timezone      VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2. `users` — Usuarios / Clientes
```sql
CREATE TABLE users (
    id                SERIAL PRIMARY KEY,
    email             VARCHAR(180) UNIQUE NOT NULL,
    phone             VARCHAR(30),
    password_hash     VARCHAR(255),                    -- NULL si OAuth
    first_name        VARCHAR(80) NOT NULL,
    last_name         VARCHAR(80) NOT NULL,
    birth_date        DATE,
    gender            VARCHAR(20),
    avatar_url        TEXT,
    role              VARCHAR(20) DEFAULT 'client'    -- client | employee | manager | admin
                      CHECK (role IN ('client','employee','manager','admin')),
    auth_provider     VARCHAR(30) DEFAULT 'local',    -- local | google | facebook
    auth_provider_id  VARCHAR(200),
    whatsapp_opt_in   BOOLEAN DEFAULT TRUE,
    email_opt_in      BOOLEAN DEFAULT TRUE,
    notes             TEXT,                            -- notas internas del staff
    is_active         BOOLEAN DEFAULT TRUE,
    last_login_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
```

---

### 3. `employees` — Empleados
```sql
CREATE TABLE employees (
    id            SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id     INT NOT NULL REFERENCES branches(id),
    title         VARCHAR(80),                         -- "Colorista", "Peluquero/a"
    bio           TEXT,
    avatar_url    TEXT,
    display_order INT DEFAULT 0,
    hired_at      DATE,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);
```

---

### 4. `service_categories` — Categorías de servicios
```sql
CREATE TABLE service_categories (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(80) NOT NULL,
    slug          VARCHAR(80) UNIQUE NOT NULL,
    description   TEXT,
    icon          VARCHAR(80),
    display_order INT DEFAULT 0,
    is_active     BOOLEAN DEFAULT TRUE
);

-- Datos iniciales
INSERT INTO service_categories (name, slug, icon, display_order) VALUES
  ('Cortes', 'cortes', 'scissors', 1),
  ('Color y Mechas', 'color', 'palette', 2),
  ('Tratamientos', 'tratamientos', 'sparkles', 3),
  ('Alisado y Keratina', 'alisado', 'waves', 4),
  ('Peinados', 'peinados', 'crown', 5),
  ('Barba', 'barba', 'razor', 6);
```

---

### 5. `services` — Servicios
```sql
CREATE TABLE services (
    id              SERIAL PRIMARY KEY,
    category_id     INT NOT NULL REFERENCES service_categories(id),
    name            VARCHAR(120) NOT NULL,
    slug            VARCHAR(120) UNIQUE NOT NULL,
    description     TEXT,
    duration_min    INT NOT NULL,                       -- duración en minutos
    price_from      DECIMAL(10,2),                     -- precio base
    price_to        DECIMAL(10,2),                     -- precio máximo (si varía)
    currency        CHAR(3) DEFAULT 'ARS',
    image_url       TEXT,
    requires_deposit BOOLEAN DEFAULT FALSE,
    deposit_amount  DECIMAL(10,2),
    display_order   INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Servicios base para G-M Peluqueros
INSERT INTO services (category_id, name, slug, duration_min, price_from) VALUES
  (1, 'Corte de cabello mujer',  'corte-mujer',     45, NULL),
  (1, 'Corte de cabello hombre', 'corte-hombre',    30, NULL),
  (1, 'Corte + Brushing',        'corte-brushing',  60, NULL),
  (2, 'Coloración completa',     'coloracion',      90, NULL),
  (2, 'Mechas / Balayage',       'balayage',       120, NULL),
  (2, 'Babylights',              'babylights',     150, NULL),
  (2, 'Retoque raíz',            'retoque-raiz',    60, NULL),
  (3, 'Hidratación profunda',    'hidratacion',     60, NULL),
  (3, 'Keratina',                'keratina',       150, NULL),
  (4, 'Brushing',                'brushing',        40, NULL),
  (6, 'Arreglo de barba',        'barba',           20, NULL);
```

---

### 6. `employee_services` — Servicios que ofrece cada empleado
```sql
CREATE TABLE employee_services (
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    service_id  INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    custom_duration_min INT,                          -- sobreescribe si el empleado es más lento/rápido
    custom_price DECIMAL(10,2),                       -- precio personalizado del empleado
    PRIMARY KEY (employee_id, service_id)
);
```

---

### 7. `schedules` — Horarios laborales semanales
```sql
CREATE TABLE schedules (
    id            SERIAL PRIMARY KEY,
    employee_id   INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo
    start_time    TIME NOT NULL,
    end_time      TIME NOT NULL,
    break_start   TIME,
    break_end     TIME,
    is_active     BOOLEAN DEFAULT TRUE,
    valid_from    DATE,
    valid_until   DATE
);

CREATE INDEX idx_schedules_employee ON schedules(employee_id, day_of_week);
```

---

### 8. `vacations` — Vacaciones y ausencias
```sql
CREATE TABLE vacations (
    id            SERIAL PRIMARY KEY,
    employee_id   INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date    DATE NOT NULL,
    end_date      DATE NOT NULL,
    reason        VARCHAR(50) DEFAULT 'vacation'    -- vacation | sick | personal | holiday
                  CHECK (reason IN ('vacation','sick','personal','holiday','other')),
    notes         TEXT,
    approved_by   INT REFERENCES users(id),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 9. `appointments` — Reservas / Turnos
```sql
CREATE TABLE appointments (
    id                  SERIAL PRIMARY KEY,
    branch_id           INT NOT NULL REFERENCES branches(id),
    user_id             INT NOT NULL REFERENCES users(id),
    employee_id         INT NOT NULL REFERENCES employees(id),
    service_id          INT NOT NULL REFERENCES services(id),
    start_at            TIMESTAMPTZ NOT NULL,
    end_at              TIMESTAMPTZ NOT NULL,                  -- calculado: start_at + duration
    status              VARCHAR(30) DEFAULT 'pending'
                        CHECK (status IN (
                          'pending','confirmed','in_progress',
                          'completed','cancelled','no_show','rescheduled'
                        )),
    cancellation_reason TEXT,
    notes               TEXT,                                  -- notas del cliente
    internal_notes      TEXT,                                  -- notas del staff
    source              VARCHAR(30) DEFAULT 'web'              -- web | whatsapp | phone | walkin
                        CHECK (source IN ('web','whatsapp','phone','walkin','app')),
    gcal_event_id       VARCHAR(200),                          -- Google Calendar event ID
    reminder_sent_24h   BOOLEAN DEFAULT FALSE,
    reminder_sent_1h    BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at        TIMESTAMPTZ
);

CREATE INDEX idx_appointments_start ON appointments(start_at);
CREATE INDEX idx_appointments_employee ON appointments(employee_id, start_at);
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_status ON appointments(status);
```

---

### 10. `payments` — Pagos
```sql
CREATE TABLE payments (
    id                  SERIAL PRIMARY KEY,
    appointment_id      INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    amount              DECIMAL(10,2) NOT NULL,
    currency            CHAR(3) DEFAULT 'ARS',
    status              VARCHAR(30) DEFAULT 'pending'
                        CHECK (status IN ('pending','completed','failed','refunded','partial')),
    method              VARCHAR(30)
                        CHECK (method IN ('cash','card','transfer','mp','rapipago','online')),
    provider            VARCHAR(50),                           -- mercadopago | stripe | etc.
    provider_tx_id      VARCHAR(200),
    provider_response   JSONB,
    paid_at             TIMESTAMPTZ,
    refunded_at         TIMESTAMPTZ,
    refund_amount       DECIMAL(10,2),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 11. `notifications` — Notificaciones
```sql
CREATE TABLE notifications (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id  INT REFERENCES appointments(id) ON DELETE SET NULL,
    type            VARCHAR(50) NOT NULL
                    CHECK (type IN (
                      'confirmation','reminder_24h','reminder_1h',
                      'cancellation','reschedule','waitlist_available',
                      'payment_receipt','marketing'
                    )),
    channel         VARCHAR(20) NOT NULL
                    CHECK (channel IN ('email','whatsapp','sms','push')),
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','sent','delivered','failed','read')),
    subject         VARCHAR(200),
    body            TEXT NOT NULL,
    sent_at         TIMESTAMPTZ,
    read_at         TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_status ON notifications(status) WHERE status = 'pending';
```

---

### 12. `waitlist_entries` — Lista de espera
```sql
CREATE TABLE waitlist_entries (
    id            SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id     INT NOT NULL REFERENCES branches(id),
    service_id    INT NOT NULL REFERENCES services(id),
    employee_id   INT REFERENCES employees(id),               -- NULL = cualquier empleado
    preferred_dates DATE[],                                   -- array de fechas preferidas
    preferred_time_from TIME,
    preferred_time_to   TIME,
    status        VARCHAR(20) DEFAULT 'waiting'
                  CHECK (status IN ('waiting','notified','booked','expired','cancelled')),
    notified_at   TIMESTAMPTZ,
    expires_at    TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 13. `settings` — Configuración global
```sql
CREATE TABLE settings (
    id          SERIAL PRIMARY KEY,
    branch_id   INT REFERENCES branches(id) ON DELETE CASCADE, -- NULL = global
    key         VARCHAR(100) NOT NULL,
    value       TEXT,
    type        VARCHAR(20) DEFAULT 'string'
                CHECK (type IN ('string','integer','boolean','json')),
    description TEXT,
    UNIQUE(branch_id, key)
);

-- Configuraciones iniciales
INSERT INTO settings (branch_id, key, value, type, description) VALUES
  (NULL, 'booking_advance_days',    '60',    'integer', 'Días máximos de anticipación para reservas'),
  (NULL, 'min_cancel_hours',        '2',     'integer', 'Horas mínimas de antelación para cancelar'),
  (NULL, 'whatsapp_reminders',      'true',  'boolean', 'Enviar recordatorios por WhatsApp'),
  (NULL, 'email_reminders',         'true',  'boolean', 'Enviar recordatorios por email'),
  (NULL, 'gcal_integration',        'false', 'boolean', 'Integración Google Calendar activa'),
  (NULL, 'mp_public_key',           '',      'string',  'MercadoPago public key'),
  (NULL, 'slot_interval_minutes',   '30',    'integer', 'Intervalo entre slots disponibles'),
  (NULL, 'whatsapp_business_token', '',      'string',  'Token WhatsApp Business API');
```

---

## VISTAS ÚTILES

```sql
-- Vista: turnos del día con info completa
CREATE VIEW v_daily_appointments AS
SELECT
    a.id,
    a.start_at,
    a.end_at,
    a.status,
    u.first_name || ' ' || u.last_name AS client_name,
    u.phone AS client_phone,
    eu.first_name || ' ' || eu.last_name AS employee_name,
    s.name AS service_name,
    s.duration_min,
    s.price_from,
    p.amount AS paid_amount,
    p.status AS payment_status
FROM appointments a
JOIN users u ON u.id = a.user_id
JOIN employees e ON e.id = a.employee_id
JOIN users eu ON eu.id = e.user_id
JOIN services s ON s.id = a.service_id
LEFT JOIN payments p ON p.appointment_id = a.id
WHERE a.status NOT IN ('cancelled');

-- Vista: disponibilidad por empleado (uso interno del engine de reservas)
CREATE VIEW v_employee_available_slots AS
SELECT
    e.id AS employee_id,
    eu.first_name || ' ' || eu.last_name AS employee_name,
    sc.day_of_week,
    sc.start_time,
    sc.end_time
FROM employees e
JOIN users eu ON eu.id = e.user_id
JOIN schedules sc ON sc.employee_id = e.id
WHERE e.is_active = TRUE AND sc.is_active = TRUE;
```

# 🚀 Job Applications API

API REST para la gestión de postulaciones laborales, desarrollada con **Node.js**, **Express** y **MySQL**. Permite registrar postulaciones de candidatos a vacantes, calculando de forma automática el **puntaje** y la **prioridad** según reglas de negocio predefinidas, garantizando integridad referencial y trazabilidad completa del proceso de selección.

---

## 🧰 Stack Tecnológico

| Componente | Tecnología | Versión |
|---|---|---|
| Runtime | Node.js | ≥ 18.x |
| Framework Web | Express | ^4.19 |
| Base de Datos | MySQL | ≥ 8.0 |
| Driver BD | `mysql2` (con promesas) | ^3.11 |
| Variables de Entorno | `dotenv` | ^16.4 |
| Módulo | ES Modules (ESM) | Nativo |

---

## 📂 Estructura del Proyecto

El proyecto sigue una **arquitectura en capas** para garantizar separación de responsabilidades, testabilidad y mantenibilidad:

```
job-applications-api/
├── package.json              # Dependencias y scripts
├── .env.example              # Plantilla de variables de entorno
├── database.sql              # Script DDL + datos de prueba
├── README.md                 # Esta documentación
├── RESPUESTAS.md             # Sección de Inteligencia Artificial
├── CHAT.md                   # Historial de interacción con IA
└── src/
    ├── server.js             # Punto de entrada (arranque)
    ├── app.js                # Configuración de Express
    ├── config/
    │   └── db.js             # Pool de conexiones MySQL
    ├── constants/
    │   └── enums.js          # Constantes del dominio
    ├── routes/               # Definición de rutas HTTP
    │   └── applications.routes.js
    ├── controllers/          # Capa de presentación (req/res)
    │   └── applications.controller.js
    ├── services/             # Lógica de negocio
    │   └── applications.service.js
    ├── repositories/         # Acceso a datos (SQL)
    │   └── applications.repository.js
    ├── validators/           # Validación de payloads
    │   └── applications.validator.js
    ├── utils/                # Utilidades (scoring, helpers)
    │   └── scoring.js
    └── tests/                # Pruebas automatizadas
        └── scoring.test.js
```

**Flujo de una petición:**
`HTTP Request → Routes → Controller → Validator → Service → Repository → MySQL`

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd job-applications-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la base de datos MySQL

Conéctate a tu servidor MySQL y ejecuta el script `database.sql`:

```bash
mysql -u root -p < database.sql
```

Esto creará:
- La base de datos `job_applications`.
- Las tablas `candidates`, `vacancies` y `applications` con sus restricciones.
- **Datos de prueba**: 4 candidatos y 3 vacantes (incluyendo una en estado `CLOSED`).

### 4. Configurar variables de entorno

Copia el archivo de ejemplo y ajústalo a tu entorno:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto donde escuchará la API | `3000` |
| `DB_HOST` | Host del servidor MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | `mi_password_seguro` |
| `DB_NAME` | Nombre de la base de datos | `job_applications` |

> ⚠️ **Importante:** El archivo `.env` **nunca** debe subirse al repositorio. Ya está incluido en `.gitignore`.

---

## ▶️ Ejecución de la Aplicación

### Modo desarrollo (con recarga automática)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

La API estará disponible en: `http://localhost:3000`

**Verificación de salud:**
```bash
curl http://localhost:3000/health
# Respuesta: {"status":"ok"}
```

---

## 📡 Documentación de Endpoints

### 🔐 Reglas Globales

- **Content-Type:** `application/json`
- **Códigos HTTP estándar:** `200`, `201`, `400`, `404`, `409`, `500`
- **Respuestas de error:** `{ "error": "mensaje descriptivo" }`

---

### 📌 `POST /applications` — Registrar una Postulación

Registra una nueva postulación. El **puntaje** y la **prioridad** se calculan automáticamente en el backend; el cliente **no debe enviarlos**.

#### Request

```http
POST /applications
Content-Type: application/json

{
  "candidateId": 3,
  "vacancyId": 1,
  "source": "REFERRAL",
  "coverLetter": "I have four years of experience building REST APIs with Node.js and SQL databases"
}
```

#### Validaciones

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| `candidateId` | integer | ✅ | Debe existir en `candidates` |
| `vacancyId` | integer | ✅ | Debe existir en `vacancies` y estar en estado `OPEN` |
| `source` | enum | ✅ | `REFERRAL` · `INTERNAL` · `JOB_BOARD` · `OTHER` |
| `coverLetter` | string | ❌ | Texto libre |

#### Reglas de Negocio Aplicadas

1. **Vacante cerrada:** si la vacante está en estado `CLOSED`, se rechaza con `409 Conflict`.
2. **Duplicidad:** un candidato no puede postular dos veces a la misma vacante (restricción `UNIQUE` en BD + validación en servicio).
3. **Cálculo automático de puntaje** (ver tabla en sección *Motor de Puntaje*).
4. **Asignación automática de prioridad** según el puntaje obtenido.

#### Response `201 Created`

```json
{
  "id": 1,
  "candidateId": 3,
  "vacancyId": 1,
  "source": "REFERRAL",
  "coverLetter": "I have four years of experience...",
  "score": 9,
  "priority": "TOP",
  "status": "RECEIVED"
}
```

---

### 📌 `GET /applications` — Listar Postulaciones

Lista postulaciones con filtros opcionales. Ordenamiento por defecto: **puntaje DESC** y **fecha de creación DESC**.

#### Request

```http
GET /applications?status=RECEIVED&vacancyId=1&limit=10&offset=0
```

#### Parámetros de Query

| Parámetro | Tipo | Descripción |
|---|---|---|
| `candidateId` | integer | Filtrar por candidato |
| `vacancyId` | integer | Filtrar por vacante |
| `status` | enum | `RECEIVED` · `IN_REVIEW` · `REJECTED` · `HIRED` |
| `priority` | enum | `LOW` · `MEDIUM` · `HIGH` · `TOP` |
| `source` | enum | Fuente de postulación |
| `limit` | integer | Cantidad de resultados (default: 50) |
| `offset` | integer | Paginación (default: 0) |

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "candidateId": 3,
    "candidateName": "Carla Gómez",
    "vacancyId": 1,
    "vacancyTitle": "Senior Backend Engineer",
    "source": "REFERRAL",
    "score": 9,
    "priority": "TOP",
    "status": "RECEIVED",
    "createdAt": "2026-10-01T10:00:00.000Z",
    "updatedAt": "2026-10-01T10:00:00.000Z"
  }
]
```

---

### 📌 `PATCH /applications/:id/status` — Actualizar Estado

Cambia el estado de una postulación existente.

> **Nota:** Se utiliza `PATCH` (no `PUT`) por ser semánticamente correcto para actualizaciones parciales de un recurso.

#### Request

```http
PATCH /applications/1/status
Content-Type: application/json

{
  "estado": "IN_REVIEW"
}
```

#### Validaciones

- El `estado` debe ser uno de: `RECEIVED`, `IN_REVIEW`, `REJECTED`, `HIRED`.
- La postulación debe existir (si no, retorna `404`).

#### Response `200 OK`

```json
{
  "id": 1,
  "candidateId": 3,
  "candidateName": "Carla Gómez",
  "vacancyId": 1,
  "vacancyTitle": "Senior Backend Engineer",
  "coverLetter": "...",
  "source": "REFERRAL",
  "score": 9,
  "priority": "TOP",
  "status": "IN_REVIEW",
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-01T10:30:00.000Z"
}
```

---

## 🧠 Motor de Puntaje y Prioridad

### Tabla de Reglas

| Condición | Puntaje |
|---|:---:|
| Años de experiencia del candidato ≥ mínimos exigidos | `+4` |
| Fuente es `REFERRAL` | `+3` |
| Fuente es `INTERNAL` | `+2` |
| Carta contiene `"node"`, `"sql"` o `"api"` (case-insensitive, cuenta una sola vez) | `+2` |
| Carta tiene más de 500 caracteres | `+1` |
| Candidato tiene ≥ 3 postulaciones **activas** en **otras** vacantes | `-2` |

- **Puntaje mínimo garantizado:** `0` (nunca negativo).
- **Postulaciones activas:** aquellas en estado `RECEIVED` o `IN_REVIEW`.

### Mapeo de Prioridad

| Puntaje | Prioridad |
|:---:|:---:|
| 0 – 2 | `LOW` |
| 3 – 4 | `MEDIUM` |
| 5 – 6 | `HIGH` |
| ≥ 7 | `TOP` |

---

## 🏛️ Decisiones Técnicas Relevantes

### 1. Arquitectura en capas
Se separa la lógica HTTP (controllers), reglas de negocio (services) y acceso a datos (repositories). Esto permite:
- Reemplazar el driver de BD sin tocar la lógica de negocio.
- Testear servicios de forma aislada mediante mocks.
- Evolucionar cada capa independientemente.

### 2. Cálculo automático de puntaje y prioridad
El cliente **nunca** envía `score` ni `priority`. Esto garantiza que las reglas de negocio no puedan ser manipuladas desde el frontend y centraliza la lógica en `src/utils/scoring.js`, facilitando su evolución y testeo unitario.

### 3. Integridad referencial en la base de datos
- `UNIQUE (candidato_id, vacante_id)`: evita duplicados a nivel de BD, no solo de aplicación.
- `ON DELETE RESTRICT`: impide eliminar candidatos/vacantes con postulaciones asociadas.
- `CHECK (puntaje >= 0)`: refuerza la regla de negocio en la capa de persistencia.

### 4. Manejo de errores estructurado
- `ValidationError` (400): errores de sintaxis en el payload.
- `BusinessError` (400/404/409): errores de reglas de negocio.
- Error global en Express: captura excepciones no manejadas y evita filtrar detalles internos.

### 5. Pool de conexiones MySQL
Se utiliza `mysql2/promise` con pool configurado (`connectionLimit: 10`, `enableKeepAlive`) para reutilizar conexiones y soportar concurrencia correctamente.

### 6. Sobre la regla de duplicidad por 30 días ⚠️
> **Nota de transparencia técnica:** en los requisitos de documentación se menciona una *"regla de duplicidad de 30 días"*. Esta regla **no formó parte del scope original** definido en los requerimientos de negocio iniciales, por lo que **no está implementada** en la versión actual del código. La implementación actual previene duplicados de forma **permanente** mediante restricción `UNIQUE` en la BD.
>
> **Propuesta de mejora futura:** si se desea habilitar la reapertura de postulaciones después de 30 días, se debería:
> 1. Eliminar la restricción `UNIQUE` actual.
> 2. Agregar en el servicio una consulta que verifique si existe una postulación del mismo candidato a la misma vacante con `fecha_creacion >= NOW() - INTERVAL 30 DAY`.
> 3. Retornar `409 Conflict` en caso afirmativo.

---

## 🧪 Pruebas Automatizadas

El proyecto incluye pruebas unitarias sobre la lógica de cálculo de puntaje y prioridad, ubicadas en `src/tests/scoring.test.js`.

### Ejecutar las pruebas

```bash
npm test
```

### Casos cubiertos

1. **Puntaje máximo (TOP):** candidato con experiencia suficiente, fuente `REFERRAL` y palabras clave en la carta.
2. **Puntaje con penalización por exceso de postulaciones activas.**
3. **Puntaje mínimo garantizado (0):** cuando las penalizaciones superarían los puntos positivos.
4. **Mapeo correcto de prioridad** para todos los rangos (`LOW`, `MEDIUM`, `HIGH`, `TOP`).
5. **Detección case-insensitive** de palabras clave en la carta.

<div>
  <a href = "https://chat.qwen.ai/s/eb54a2e6-b5bd-4c8b-8aaf-3664551217cf?fev=0.3.12"> Link Chat Qwen
</div>
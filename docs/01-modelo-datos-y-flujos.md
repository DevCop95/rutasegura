# 01 - Modelo de Datos y Flujos

Estado: borrador v0.1

## Supuestos tecnicos

- Base de datos local actual: SQLite.
- Base de datos futura: PostgreSQL con PostGIS.
- Identificadores: UUID.
- Campos comunes: `created_at`, `updated_at`.
- Borrado: preferir ocultamiento o soft delete para auditoria, no eliminacion fisica inmediata.
- Coordenadas: almacenar `lat`/`lng` del incidente, no ubicacion en vivo del usuario.

## Enums v1

```text
user_type:
  CITIZEN
  BUSINESS
  ADMIN

report_type:
  INSTANTANEO
  OFICIAL

report_status:
  NO_VERIFICADO
  COMUNITARIAMENTE_CONFIABLE
  VERIFICADO
  RECHAZADO
  OCULTO

vote_value:
  SI
  NO
  NO_SE

business_status:
  BORRADOR
  PENDIENTE_PAGO
  PENDIENTE_VERIFICACION
  APROBADO
  RECHAZADO
  SUSPENDIDO

source_status:
  PENDIENTE
  ACEPTADO
  RECHAZADO
  ERROR
```

## Tablas principales

### users

Representa ciudadanos, empresas y admins.

Campos sugeridos:

- `id`
- `email`
- `password_hash`
- `alias`
- `photo_url`
- `user_type`
- `rank`
- `reputation_score`
- `reports_verified_count`
- `reports_unverified_count`
- `reports_rejected_count`
- `votes_cast_count`
- `last_login_at`
- `is_active`

Notas:

- `email` no debe ser publico.
- `alias`, `rank`, `reputation_score` y contadores si pueden ser publicos.

### businesses

Representa empresas o lugares que quieren aparecer como puntos seguros en fases posteriores.

Campos sugeridos:

- `id`
- `owner_user_id`
- `name`
- `category`
- `description`
- `address_text`
- `location`
- `status`
- `reputation_score`
- `sponsor_label`
- `approved_at`
- `rejected_reason`

### reports

Representa incidentes reportados.

Campos sugeridos:

- `id`
- `creator_user_id`
- `report_type`
- `status`
- `title`
- `description`
- `incident_category`
- `occurred_at`
- `location`
- `city`
- `neighborhood`
- `parent_report_id`
- `duplicate_group_count`
- `community_yes_count`
- `community_no_count`
- `community_unknown_count`
- `community_score`
- `verified_at`
- `hidden_at`
- `hidden_reason`

Notas:

- `parent_report_id` permite agrupar duplicados.
- Un reporte padre resume el incidente; los hijos conservan trazabilidad.
- `description` debe ser moderable y nunca debe requerir datos personales.

### report_votes

Representa votos comunitarios sobre reportes.

Campos sugeridos:

- `id`
- `report_id`
- `voter_user_id`
- `vote_value`
- `weight_snapshot`
- `reason`

Restricciones:

- Un usuario solo puede votar una vez por reporte.
- El creador del reporte no debe votar su propio reporte.

### business_votes

Representa validacion comunitaria de negocios o puntos seguros.

Campos sugeridos:

- `id`
- `business_id`
- `voter_user_id`
- `vote_value`
- `weight_snapshot`
- `reason`

### report_sources

Representa noticias o fuentes aportadas para verificar reportes.

Campos sugeridos:

- `id`
- `report_id`
- `submitted_by_user_id`
- `url`
- `source_domain`
- `title`
- `published_at`
- `extracted_text_hash`
- `status`
- `match_score`
- `reviewed_at`
- `review_notes`

## Diagrama ER

```mermaid
erDiagram
    USERS ||--o{ REPORTS : creates
    USERS ||--o{ REPORT_VOTES : casts
    USERS ||--o{ REPORT_SOURCES : submits
    USERS ||--o{ BUSINESSES : owns
    USERS ||--o{ BUSINESS_VOTES : casts

    REPORTS ||--o{ REPORT_VOTES : receives
    REPORTS ||--o{ REPORT_SOURCES : has
    REPORTS ||--o{ REPORTS : groups

    BUSINESSES ||--o{ BUSINESS_VOTES : receives

    USERS {
      uuid id PK
      string email
      string alias
      string user_type
      string rank
      int reputation_score
    }

    REPORTS {
      uuid id PK
      uuid creator_user_id FK
      uuid parent_report_id FK
      string report_type
      string status
      string incident_category
      geography location
      datetime occurred_at
    }

    REPORT_VOTES {
      uuid id PK
      uuid report_id FK
      uuid voter_user_id FK
      string vote_value
      int weight_snapshot
    }

    REPORT_SOURCES {
      uuid id PK
      uuid report_id FK
      uuid submitted_by_user_id FK
      string url
      string status
      decimal match_score
    }

    BUSINESSES {
      uuid id PK
      uuid owner_user_id FK
      string name
      string category
      string status
      geography location
    }
```

## Indices importantes

- `reports.location` con indice GiST.
- `reports.occurred_at`.
- `reports.status`.
- `reports.parent_report_id`.
- `report_votes(report_id, voter_user_id)` unico.
- `report_sources(report_id, url)` unico.
- `business_votes(business_id, voter_user_id)` unico.

## Flujo: crear reporte instantaneo

```mermaid
flowchart TD
    A[Usuario autenticado] --> B[Completa formulario de incidente]
    B --> C[API valida categoria, texto, fecha y ubicacion]
    C --> D{Posible duplicado cercano?}
    D -- No --> E[Crear reporte padre NO_VERIFICADO]
    D -- Si --> F[Crear reporte hijo con parent_report_id]
    E --> G[Publicar marcador en mapa]
    F --> G
    G --> H[Notificar a usuarios cercanos en fase posterior]
    H --> I[Job revisa reportes antiguos]
    I --> J[Reporte queda historico NO_VERIFICADO si no logra votos suficientes]
```

Regla inicial de duplicado:

- Misma ciudad.
- Misma categoria o categoria compatible.
- Distancia menor o igual a 150 metros.
- Diferencia de tiempo menor o igual a 2 horas.
- Si hay varios candidatos, usar como padre el reporte mas antiguo con mayor score.

## Flujo: votos y reputacion

```mermaid
flowchart TD
    A[Usuario ve reporte] --> B[Vota SI, NO o NO_SE]
    B --> C[API guarda voto unico]
    C --> D[Recalcular conteos del reporte]
    D --> E{Supera umbral comunitario?}
    E -- Si positivo --> F[Estado COMUNITARIAMENTE_CONFIABLE]
    E -- Si negativo --> G[Estado RECHAZADO o cola admin]
    E -- No --> H[Mantener NO_VERIFICADO]
    F --> I[Job recalcula reputacion de autor y votantes]
    G --> I
    H --> I
```

Regla inicial de confianza comunitaria:

- `SI` ponderado mayor o igual a 5.
- Ratio `SI / (SI + NO)` mayor o igual a 0.7.
- Al menos 3 usuarios distintos.

Regla inicial de rechazo:

- `NO` ponderado mayor o igual a 5.
- Ratio `NO / (SI + NO)` mayor o igual a 0.7.
- Enviar a cola admin antes de ocultar si contiene lenguaje sensible.

## Flujo: aportar noticia

Este flujo pertenece a una fase posterior, pero el modelo queda preparado.

```mermaid
flowchart TD
    A[Usuario pega URL en ficha de reporte] --> B[API crea report_source PENDIENTE]
    B --> C[Worker descarga y extrae contenido]
    C --> D[Buscar ciudad, barrio, fecha y palabras clave]
    D --> E{Coincidencia suficiente?}
    E -- Si --> F[report_source ACEPTADO]
    F --> G[Reporte VERIFICADO]
    G --> H[Sumar reputacion al usuario que aporto fuente]
    E -- No --> I[report_source RECHAZADO]
    I --> J[Reporte conserva su estado anterior]
```

## Flujo: empresa patrocinada

Este flujo queda fuera del MVP civico inicial.

```mermaid
flowchart TD
    A[Empresa crea perfil] --> B[Define campana]
    B --> C[Stripe Checkout]
    C --> D[Webhook confirma pago]
    D --> E[Estado PENDIENTE_VERIFICACION]
    E --> F[Votacion comunitaria local]
    F --> G{Umbral suficiente?}
    G -- Si --> H[Admin aprueba punto seguro patrocinado]
    G -- No --> I[Rechazo o revision manual]
```

## Reputacion v1

Reglas iniciales simples:

- +3 puntos si un reporte del usuario llega a `COMUNITARIAMENTE_CONFIABLE`.
- +5 puntos si un reporte llega a `VERIFICADO` por fuente aceptada.
- +1 punto si un voto del usuario coincide con el resultado final.
- -2 puntos si un reporte queda `RECHAZADO`.
- -10 puntos y revision admin si hay abuso repetido o datos personales publicados.

Rangos iniciales:

- `NUEVO`: 0 a 9 puntos.
- `COLABORADOR`: 10 a 49 puntos.
- `CONFIABLE`: 50 a 149 puntos.
- `GUARDIAN`: 150 o mas puntos.

Los nombres de rangos deben validarse con usuarios piloto para evitar tono policial o vigilante.

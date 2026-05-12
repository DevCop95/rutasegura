# 03 - Roadmap por Fases

Estado: borrador v0.1

## Ajuste clave

La gobernanza minima entra desde el inicio. Privacidad, moderacion y manejo de reportes sensibles no deben esperar hasta el final, porque afectan el modelo de datos, los permisos, la interfaz y la confianza del piloto.

## Fase 0 - Alcance y ciudad piloto

Duracion estimada: 1 a 2 semanas.

Objetivo:

- Evitar diseno en el aire.
- Elegir ciudad piloto.
- Definir problema, usuario objetivo y alcance real del MVP.

Entregables:

- Documento de alcance.
- Lista de actores a contactar.
- Primer conjunto de metricas de exito.

Criterio de salida:

- El equipo puede explicar en menos de 2 minutos que problema resuelve RutaSegura, para quien y que queda fuera.

## Fase 1 - Modelo, flujos y reglas

Duracion estimada: 1 a 2 semanas.

Objetivo:

- Definir tablas, estados, flujos y reglas iniciales.
- Integrar gobernanza minima antes del desarrollo.

Entregables:

- Diagrama ER.
- Diagramas de flujo.
- Reglas v1 de reputacion, votos y duplicados.
- Politica inicial de privacidad y moderacion.

Criterio de salida:

- Se puede implementar la base de datos sin inventar estados nuevos cada dia.

## Fase 2 - Arquitectura tecnica

Duracion estimada: 1 semana.

Objetivo:

- Fijar stack y estructura de repo.
- Decidir frontera entre frontend, API, DB y worker.

Entregables:

- README tecnico.
- Diagrama de arquitectura.
- Estructura inicial de carpetas.
- Lista de endpoints MVP.

Criterio de salida:

- Un desarrollador puede levantar el entorno local y entender donde vive cada responsabilidad.

## Fase 3 - MVP civico sin Stripe ni scraper

Duracion estimada: 4 a 6 semanas.

Objetivo:

- Tener el nucleo civico funcionando antes de monetizacion o verificacion automatica.

Orden sugerido:

1. Autenticacion y perfiles basicos.
2. Crear reportes instantaneos.
3. Mapa con marcadores y detalle.
4. Votos comunitarios.
5. Reputacion y rangos.
6. Deteccion simple de duplicados.
7. Moderacion minima.

Entregables:

- Web responsive.
- API funcional.
- Base de datos con migraciones.
- Jobs de reputacion y estado.
- Panel admin minimo.

Criterio de salida:

- Un usuario piloto puede registrarse, crear un reporte, verlo en el mapa y recibir votos de otros usuarios.

## Fase 4 - Fuentes y verificacion avanzada

Duracion estimada: 2 a 4 semanas.

Objetivo:

- Combinar verificacion comunitaria con respaldo de noticias u otras fuentes publicas.

Entregables:

- Formulario para aportar URL.
- Tabla `report_sources`.
- Worker que descarga, extrae y evalua coincidencias.
- UI con fuente aceptada o rechazada.

Criterio de salida:

- Un reporte puede pasar a `VERIFICADO` por una fuente publica aceptada, con trazabilidad visible.

## Fase 5 - Empresas, Stripe y puntos seguros

Duracion estimada: 2 a 3 semanas.

Objetivo:

- Crear ingreso sin romper la confianza civica.

Entregables:

- Registro de empresa.
- Perfil publico de negocio.
- Checkout de Stripe.
- Webhook de pago.
- Votacion comunitaria de puntos seguros.
- Etiqueta clara de patrocinio.

Criterio de salida:

- Una empresa puede pagar una campana, pero no aparecer como punto seguro hasta pasar validacion comunitaria/admin.

## Fase 6 - Piloto cerrado

Duracion estimada: 4 a 8 semanas.

Objetivo:

- Probar con usuarios reales y ajustar reglas.

Acciones:

- Reclutar 20 a 100 usuarios.
- Incluir una ONG, un colegio/colectivo o lideres barriales si es posible.
- Medir reportes, votos, abuso, tiempo de verificacion y utilidad percibida.
- Ajustar rangos, pesos, umbrales y UX.

Criterio de salida:

- Hay evidencia de utilidad real o una decision clara de pivotear.

## Fase 7 - Formalizacion

Duracion estimada: continua.

Objetivo:

- Formalizar politicas, protocolos y responsabilidades para operar como civic-tech serio.

Entregables:

- Terminos de uso.
- Politica de privacidad.
- Protocolo de solicitudes de autoridad.
- Protocolo de reportes sensibles.
- Proceso de apelacion y moderacion.

Criterio de salida:

- La plataforma puede operar publicamente con reglas comprensibles, auditables y defendibles.

## Definicion de MVP terminado

El MVP se considera terminado cuando:

- Existe registro/login.
- Hay perfiles publicos con alias, rango y reputacion.
- Se pueden crear reportes instantaneos con ubicacion.
- El mapa muestra reportes por area visible.
- Los usuarios pueden votar reportes.
- La reputacion se recalcula de forma automatica.
- Los duplicados se agrupan.
- Un admin puede ocultar contenido sensible o abusivo.
- Las reglas basicas de privacidad y moderacion estan documentadas.

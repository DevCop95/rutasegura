# 00 - Alcance del MVP

Estado: borrador v0.1  
Ciudad piloto propuesta: Cartagena, Colombia  
Producto: web responsive, sin app nativa en la primera version

## Problema

Las personas necesitan informacion reciente, local y comprensible sobre incidentes de seguridad urbana, pero las fuentes disponibles suelen estar fragmentadas entre rumores, chats privados, noticias, reportes oficiales y experiencias individuales.

RutaSegura ataca un problema acotado:

> Mapa colaborativo de seguridad urbana y puntos seguros, basado en reportes recientes de calle, votos comunitarios y verificacion progresiva.

No intenta resolver todo el crimen urbano ni reemplazar a autoridades, medios o lineas de emergencia.

## Usuario objetivo inicial

Ciudadanos que se mueven por la ciudad y quieren:

- Reportar un incidente reciente de forma simple.
- Consultar zonas con reportes cercanos.
- Votar si un reporte coincide con lo que saben o han visto.
- Construir reputacion comunitaria por aportar informacion util.

Usuarios secundarios para fases posteriores:

- Empresas o lugares que quieren postularse como puntos seguros.
- ONG, colegios o colectivos barriales que quieren observar patrones.
- Administradores/moderadores que revisan abuso, duplicados y reportes sensibles.

## Hipotesis del MVP

Si se ofrece un mapa simple, rapido y con reglas claras de reputacion, un grupo piloto de ciudadanos puede generar reportes utiles y filtrar informacion dudosa mediante votacion comunitaria, incluso antes de integrar scraping de noticias o pagos.

## Alcance incluido

El MVP funcional incluye:

- Registro/login de ciudadanos.
- Alias publico y perfil basico.
- Reportes instantaneos de incidentes de calle.
- Mapa con marcadores y detalle de reportes.
- Votos comunitarios: "si", "no", "no se".
- Reputacion y rangos basicos.
- Agrupacion simple de reportes duplicados por distancia, tiempo y categoria.
- Estados de reporte: `NO_VERIFICADO`, `COMUNITARIAMENTE_CONFIABLE`, `RECHAZADO`, `OCULTO`.
- Panel admin minimo para ocultar reportes abusivos o sensibles.
- Politicas minimas de privacidad, moderacion y manejo de reportes sensibles.

## Fuera del MVP

Queda fuera de la primera version:

- App nativa iOS/Android.
- Stripe y campanas pagadas.
- Scraper automatico de noticias.
- Verificacion oficial automatizada.
- Chat entre usuarios.
- Alertas en tiempo real complejas.
- Analitica publica avanzada.
- Integraciones con autoridades.

## Actores a atraer despues del MVP

Actores deseables para la etapa piloto:

- Una ONG local con trabajo comunitario o seguridad ciudadana.
- Un colegio, universidad o colectivo juvenil.
- Una empresa local con presencia fisica y reputacion de lugar seguro.
- Un contacto municipal o lider barrial para retroalimentacion.
- Un medio local o periodista interesado en datos urbanos.

## Criterios de exito del MVP

Metricas iniciales:

- 20 a 100 usuarios piloto registrados.
- Al menos 5 reportes reales por semana durante el piloto.
- 40% o mas de reportes con algun voto comunitario.
- Tiempo medio menor a 24 horas para recibir el primer voto.
- Menos de 10% de reportes ocultos por abuso o informacion sensible mal publicada.
- Feedback cualitativo claro sobre confianza, utilidad y friccion del flujo.

## Principios de producto

- Seguridad primero: no publicar datos personales de victimas, sospechosos o menores.
- Privacidad por defecto: el usuario publica alias, no identidad civil.
- Transparencia: todo estado de verificacion debe explicar su fuente.
- Humildad civica: la plataforma no declara culpables ni reemplaza denuncias formales.
- Utilidad local: mejor pocos flujos confiables que una plataforma enorme e incompleta.

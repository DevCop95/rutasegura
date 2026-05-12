# 04 - Gobernanza y Riesgos

Estado: borrador v0.1

## Principios

- No hacer dano: la plataforma no debe facilitar acoso, senalamiento publico ni justicia por mano propia.
- Minimizar datos: guardar solo lo necesario para operar el servicio.
- Transparencia: explicar por que un reporte aparece como no verificado, confiable, verificado, rechazado u oculto.
- Responsabilidad: toda accion admin debe quedar auditada.
- Separacion entre civico y comercial: pagar no convierte un negocio en punto seguro.

## Datos publicos y privados

Publico:

- Alias.
- Foto opcional.
- Rango.
- Reputacion.
- Conteos agregados.
- Reportes creados si no contienen datos sensibles.

Privado:

- Email.
- Hash de contrasena.
- Historial de login.
- Datos tecnicos de seguridad.
- Acciones de moderacion no publicadas.

No se debe guardar:

- Ubicacion en vivo del usuario.
- Documentos de identidad en el MVP.
- Datos personales de victimas, sospechosos o menores.
- Direcciones exactas de domicilios privados cuando no sean necesarias para el incidente.

## Reportes sensibles

Categorias que requieren cuidado especial:

- Violencia sexual.
- Menores de edad.
- Violencia intrafamiliar.
- Trata de personas.
- Autolesion o riesgo suicida.
- Datos medicos.
- Nombres, fotos o senalamientos de personas.

Regla inicial:

- El formulario debe advertir que no se publiquen nombres, fotos, placas o datos personales.
- Si el texto contiene datos personales o una categoria sensible, el reporte entra a revision o se publica con detalles reducidos.
- Los admins pueden ocultar detalles manteniendo una senal agregada si es util para seguridad urbana.

## Reportes falsos o maliciosos

Senales de riesgo:

- Muchos reportes rechazados del mismo usuario.
- Texto repetido en varios reportes.
- Reportes contra una persona o negocio especifico sin evidencia.
- Lenguaje discriminatorio, amenazas o datos personales.
- Votos coordinados desde cuentas nuevas.

Acciones posibles:

- Reducir peso de votos.
- Pasar reportes a cola admin.
- Ocultar reporte.
- Suspender cuenta.
- Bloquear creacion temporalmente por rate limit.

## Solicitudes de autoridad

Protocolo inicial:

- No compartir datos privados por solicitud informal.
- Registrar toda solicitud recibida.
- Exigir canal legal/formal antes de entregar informacion privada.
- Entregar solo el minimo necesario.
- Notificar al usuario cuando sea legalmente posible.
- Mantener log interno de que se compartio, por que y con quien.

## Empresas y patrocinio

Riesgos:

- Que una empresa pague para parecer segura sin validacion real.
- Que usuarios crean que "patrocinado" equivale a "verificado".
- Que la plataforma incentive ocultar reportes negativos cerca de anunciantes.

Reglas iniciales:

- Toda aparicion pagada debe tener etiqueta visible.
- Un negocio patrocinado necesita validacion comunitaria y/o admin.
- Los reportes cercanos a negocios patrocinados no deben ocultarse por presion comercial.
- El score de seguridad debe separarse del estado de pago.

## Moderacion minima MVP

Acciones admin necesarias:

- Ocultar reporte.
- Restaurar reporte.
- Cambiar categoria.
- Marcar reporte como sensible.
- Suspender usuario.
- Ver historial de acciones.

Cada accion debe guardar:

- Admin responsable.
- Fecha/hora.
- Motivo.
- Estado anterior.
- Estado nuevo.

## Lenguaje de producto

Evitar terminos que parezcan sentencia o acusacion:

- Preferir "reporte", "incidente", "informacion no verificada".
- Evitar "culpable", "delincuente", "criminal identificado".
- Evitar rankings publicos de "zonas malas" sin contexto.

## Pendientes legales

Antes de piloto publico:

- Terminos de uso.
- Politica de privacidad.
- Aviso de no emergencia.
- Politica de contenido.
- Proceso de solicitud de eliminacion o correccion.
- Revision legal local si la plataforma maneja datos sensibles o solicitudes de autoridad.

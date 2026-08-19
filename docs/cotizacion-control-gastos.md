# COTIZACIÓN — SISTEMA WEB CONTROLGASTOS

**Cotización N.º:** [COMPLETAR]  
**Fecha:** [COMPLETAR]  
**Proveedor:** [NOMBRE O RAZÓN SOCIAL]  
**RUT:** [COMPLETAR]  
**Cliente:** [NOMBRE O RAZÓN SOCIAL DEL CLIENTE]  
**Vigencia de la propuesta:** [COMPLETAR] días

## 1. Resumen ejecutivo

La presente propuesta considera el desarrollo y puesta en funcionamiento de **ControlGastos**, una plataforma web destinada a centralizar el registro, control y consulta de gastos asociados a distintos Centros de Costo. El sistema diferencia las funciones disponibles para administradores y usuarios, controla los permisos de acceso y facilita el análisis y respaldo de la información mediante paneles, filtros y exportaciones.

## 2. Objetivo

Entregar una solución centralizada que permita registrar gastos de manera ordenada, asignarlos al Centro de Costo correspondiente, controlar qué centros puede utilizar cada usuario y proporcionar a la administración información consolidada para su revisión y análisis.

## 3. Alcance funcional

### 3.1. Acceso y seguridad

- Inicio y cierre de sesión mediante correo electrónico y contraseña.
- Contraseñas almacenadas de forma cifrada.
- Perfiles diferenciados de Administrador y Usuario.
- Protección de páginas y operaciones según el rol.
- Activación y desactivación de cuentas.
- Bloqueo de acceso para cuentas inactivas.

### 3.2. Funcionalidades del Administrador

- Dashboard con total gastado, cantidad de gastos, promedio por gasto y Centros de Costo utilizados.
- Gráficos de gastos por Centro de Costo, tipo de comprobante y tendencia mensual.
- Filtros por Centro de Costo y rango de fechas.
- Registro y consulta de gastos.
- Listado general con comercio, usuario, Centro de Costo, fecha, hora, tipo y monto.
- Filtros del listado por fechas, Centro de Costo y tipo de comprobante.
- Visualización del detalle completo de cada gasto.
- Edición de gastos registrados.
- Eliminación de gastos con confirmación previa.
- Exportación de gastos a CSV, Excel y PDF, respetando los filtros aplicados.
- Creación, edición, activación y desactivación de Centros de Costo.
- Creación de usuarios con rol Administrador o Usuario.
- Validación de correo único y requisitos mínimos de contraseña.
- Activación y desactivación de usuarios.
- Asignación de uno o varios Centros de Costo a cada usuario.
- Modificación posterior de los Centros de Costo asignados.
- Protección para evitar que un administrador desactive su propia cuenta.

### 3.3. Funcionalidades del Usuario

- Dashboard de acceso rápido.
- Registro de gastos con comercio, monto, fecha, tipo, Centro de Costo y notas.
- Selección exclusiva de los Centros de Costo asignados por un administrador.
- Validación de permisos para impedir registros en centros no autorizados.
- Consulta del historial de gastos propios.
- Visualización del detalle de cada gasto.
- Edición de gastos propios.
- Eliminación de gastos propios con confirmación previa.
- Exportación del historial propio a CSV, Excel y PDF.
- Visualización separada de fecha y hora de registro.
- Paginación de resultados.

## 4. Configuración técnica y puesta en producción

La solución será instalada en el servidor VPS proporcionado por el cliente, incluyendo la preparación de la aplicación, conexión con la base de datos, configuración de las variables necesarias, publicación mediante Nginx y ejecución permanente mediante PM2. También se configurará la aplicación para funcionar bajo la ruta acordada y reiniciarse automáticamente ante una caída del proceso o reinicio del servidor.

## 5. Entregables

- Aplicación web ControlGastos operativa.
- Módulo de administración.
- Módulo de usuarios.
- Base de datos configurada.
- Gestión de roles y permisos por Centro de Costo.
- Reportes descargables en CSV, Excel y PDF.
- Aplicación instalada y publicada en el VPS.
- Código fuente del proyecto.
- Guía básica de despliegue y operación.
- [CAPACITACIÓN / MANUAL DE USUARIO, SI CORRESPONDE].

## 6. Propuesta económica

| Ítem | Descripción | Valor neto |
|---|---|---:|
| 1 | Análisis, diseño y estructura del sistema | $[COMPLETAR] |
| 2 | Acceso, seguridad, roles y permisos | $[COMPLETAR] |
| 3 | Dashboard administrativo y gráficos | $[COMPLETAR] |
| 4 | Gestión de gastos: registro, consulta, edición y eliminación | $[COMPLETAR] |
| 5 | Gestión de Centros de Costo | $[COMPLETAR] |
| 6 | Gestión de usuarios y asignación de centros | $[COMPLETAR] |
| 7 | Exportación CSV, Excel y PDF | $[COMPLETAR] |
| 8 | Configuración y puesta en producción en VPS | $[COMPLETAR] |
|  | **Subtotal neto** | **$[COMPLETAR]** |
|  | **IVA 19%** | **$[COMPLETAR]** |
|  | **Total** | **$[COMPLETAR]** |

## 7. Plazo de ejecución

El plazo estimado para el desarrollo, validación y puesta en producción es de **[COMPLETAR] días hábiles**, contados desde la aceptación formal de la propuesta, recepción del pago inicial y entrega de los accesos e información requeridos.

## 8. Forma de pago

- **[COMPLETAR]%** al aceptar la propuesta e iniciar el proyecto.
- **[COMPLETAR]%** al presentar la versión funcional para revisión.
- **[COMPLETAR]%** contra entrega y puesta en producción.

## 9. Garantía y soporte

Se considera una garantía de **[COMPLETAR] días** desde la entrega, aplicable a errores atribuibles a las funcionalidades incluidas en esta propuesta. Nuevas funciones, cambios de alcance, modificaciones solicitadas posteriormente o problemas originados por servicios de terceros serán evaluados y cotizados por separado.

Se puede contratar adicionalmente un servicio mensual de soporte, respaldo y mantenimiento por un valor de **$[COMPLETAR] + IVA**.

## 10. Responsabilidades del cliente

- Proporcionar acceso al VPS, dominio y servicios necesarios.
- Entregar oportunamente usuarios, información y criterios de validación.
- Revisar y aprobar los avances dentro de los plazos acordados.
- Cubrir los costos de hosting, dominio y servicios externos que correspondan.
- Mantener respaldos o contratar el servicio de respaldo ofrecido.

## 11. Exclusiones

Salvo que se incorporen expresamente mediante una ampliación de alcance, esta propuesta no incluye:

- Aplicación móvil nativa para Android o iOS.
- Recuperación automática de contraseña por correo electrónico.
- Integración con sistemas contables, ERP o bancos.
- Firma electrónica.
- Notificaciones por correo, WhatsApp o SMS.
- Respaldo automático y monitoreo mensual del servidor.
- Certificado SSL, dominio o costos del proveedor de hosting.
- Carga masiva desde sistemas externos.
- Funcionalidades adicionales no descritas en el alcance.

## 12. Aceptación

La aceptación de esta propuesta confirma la conformidad con el alcance, valores, plazos y condiciones indicadas.

| Por el proveedor | Por el cliente |
|---|---|
| Nombre: [COMPLETAR] | Nombre: [COMPLETAR] |
| Firma: | Firma: |
| Fecha: | Fecha: |


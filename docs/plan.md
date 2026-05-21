ESPECIFICACION Y REGISTRO DE PRUEBAS UNITARIAS E INTEGRATIVAS

Proyecto: Plataforma Web - Fundacion Sociodeportiva Atenas

Responsables: Juan Eduardo Jaramillo Guerrero y Nicolas Gonzalez Franco

Fecha de ejecucion del corte: 19 de abril de 2026

Version del sistema: v1.0

---

1. IDENTIFICACION DE LOS MODULOS TESTEADOS

| ID Modulo | Nombre del modulo | Descripcion de funcionalidad |
| :-- | :-- | :-- |
| M-01 | Beneficiarios | Registro, actualizacion, eliminacion, filtros y consolidacion por sede. |
| M-02 | Autenticacion | Inicio/cierre de sesion, estado de autenticacion y persistencia de sesion. |
| M-03 | RBAC (roles y permisos) | Rutas protegidas, autorizacion por rol y restricciones de acceso. |
| M-04 | Donaciones | Registro, consulta y estadisticas de donaciones de donante y administrador. |
| M-05 | Pagos (Bold Checkout) | Flujo de pago y validaciones de integracion con pasarela. |
| M-06 | Evaluaciones | Registro, consulta, filtrado y exportacion de evaluaciones. |
| M-07 | Sedes | Administracion de sedes, estados y relacion con beneficiarios/evaluaciones. |
| M-08 | Proyectos sociales | CRUD, metas, progreso y consolidacion financiera por proyecto. |
| M-09 | Contenidos del sitio | Gestion de contenido publico, carga, edicion y activacion/desactivacion. |
| M-10 | Comunidad (Galeria/Testimonios) | Gestion de recursos de comunidad y publicacion de evidencias. |
| M-11 | Usuarios y vistas de gestion | Consultas de usuario, vistas administrativas y director/director sede/donador. |
| M-12 | Almacenamiento | Carga y recuperacion de archivos de soporte (imagenes/documentos). |

---

2. REGISTRO DE PRUEBAS UNITARIAS (LOGICA Y VALIDACION)

Objetivo: validar funciones, utilidades, esquemas y hooks en aislamiento.

Registro completo de pruebas principales unitarias (suite por archivo, sin subpruebas it/test).

Total de pruebas principales unitarias: 25

| ID Prueba | Modulo | Escenario de prueba | Resultado esperado | Resultado obtenido | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- |
| PU-01 | M-09 | Gestion de estado en administracion de contenido (carga, error y refresco). | El hook debe mantener consistencia de estado y mensajes de error. | Estados y transiciones validados en flujo unitario. | Pass |
| PU-02 | M-06 + M-07 | Filtros y exportaciones de evaluaciones por sede en diferentes periodos. | Debe filtrar/exportar correctamente y manejar escenarios sin datos. | Reglas de filtro y exportacion confirmadas. | Pass |
| PU-03 | M-07 | Carga de sedes, estadisticas y manejo de errores en hook de sedes. | Debe resolver datos y fallback controlado ante error. | Carga y fallback validados. | Pass |
| PU-04 | M-01 | Consolidacion de beneficiarios con filtros y estados de carga. | Debe mapear beneficiarios y controlar loading/error. | Flujo de hook estable y consistente. | Pass |
| PU-05 | M-08 | Gestion de proyectos con consulta, transformacion y refresco. | Debe retornar lista de proyectos con estructura esperada. | Datos normalizados y refresco correcto. | Pass |
| PU-06 | M-09 | Lectura de contenido publico y manejo de ausencia de datos. | Debe cargar contenido activo y manejar vacios sin romper UI. | Comportamiento esperado validado. | Pass |
| PU-07 | M-04 | Calculo y exposicion de metricas de donaciones en hook de donaciones. | Debe consolidar metricas y responder a cambios de estado. | Metricas calculadas correctamente. | Pass |
| PU-08 | M-03 | Proteccion de rutas segun autenticacion y rol. | Debe permitir o denegar acceso segun matriz RBAC. | Acceso restringido y redireccion verificados. | Pass |
| PU-09 | M-11 | Normalizacion de errores de aplicacion para mensajes reutilizables. | Debe mapear errores tecnicos a mensajes de usuario. | Normalizacion consistente validada. | Pass |
| PU-10 | M-01 | Operaciones CRUD de beneficiario desde servicio unitario con mocks Supabase. | Debe crear/consultar/actualizar/eliminar con mapeo correcto. | Flujo CRUD validado con respuestas mockeadas. | Pass |
| PU-11 | M-01 | Utilidades de beneficiario para parseo y validacion de campos. | Debe transformar datos de entrada/salida segun contrato. | Utilidades responden segun esperado. | Pass |
| PU-12 | M-12 | Servicio de almacenamiento para carga/lectura de recursos. | Debe gestionar rutas y errores de almacenamiento correctamente. | Operaciones de storage verificadas. | Pass |
| PU-13 | M-09 | Servicio de contenido para consulta y actualizacion de registros publicos. | Debe persistir cambios y devolver datos consistentes. | Servicio opera correctamente en escenarios cubiertos. | Pass |
| PU-14 | M-08 | Servicio de proyectos con alta, consulta y actualizacion de estado. | Debe mantener coherencia de datos de proyecto. | Operaciones y mapeo de proyecto correctos. | Pass |
| PU-15 | M-11 | Hook de toast para apilar, cerrar y limpiar notificaciones. | Debe manejar cola de mensajes sin duplicidades inesperadas. | Reducer/hook de toast validado. | Pass |
| PU-16 | M-05 | Utilidades de pago Bold para construir y validar payload de checkout. | Debe formar payload valido y manejar datos incompletos. | Payload y validaciones correctas. | Pass |
| PU-17 | M-07 | Servicio de sedes para consulta y actualizacion de informacion sede. | Debe retornar estructura estable y controlar errores. | Respuestas y manejo de error verificados. | Pass |
| PU-18 | M-11 | Hook responsive para detectar modo movil/escritorio. | Debe actualizar estado ante cambios de viewport. | Comportamiento responsive validado. | Pass |
| PU-19 | M-06 | Servicio de evaluaciones para registro, consulta y eliminacion controlada. | Debe respetar reglas de tipo y detalle de evaluacion. | Reglas de servicio verificadas. | Pass |
| PU-20 | M-02 | Servicio de autenticacion (login/logout/sesion) en unit tests. | Debe manejar credenciales, sesion y errores esperados. | Flujo de autenticacion correcto. | Pass |
| PU-21 | M-01 + M-06 | Calculos de beneficiario a partir de datos de evaluacion y progreso. | Debe calcular indicadores sin inconsistencias de tipo. | Indicadores y formulas validados. | Pass |
| PU-22 | M-04 | Servicio de donaciones con estadisticas admin/donador y filtros temporales. | Debe consolidar totales y periodos correctamente. | Metricas y agregaciones correctas. | Pass |
| PU-23 | M-11 | Reducer de toast en acciones add/remove/dismiss. | Debe transicionar estado segun accion recibida. | Transiciones del reducer correctas. | Pass |
| PU-24 | M-06 | Utilidades de evaluacion para normalizar tipo, comentario y payload. | Debe generar estructura valida por tipo de formulario. | Utilidades verificadas con alta cobertura de ramas. | Pass |
| PU-25 | M-11 | Utilidades generales de aplicacion para helpers transversales. | Deben mantener comportamiento determinista en entradas validas. | Helpers validados en escenarios cubiertos. | Pass |

---

3. REGISTRO DE PRUEBAS DE INTEGRACION (CONECTIVIDAD Y FLUJO DE DATOS)

Objetivo: verificar interaccion entre componentes React, hooks, servicios de Supabase y capa de reportes.

Registro completo de pruebas principales de integracion (suite por archivo, sin subpruebas it/test).

Total de pruebas principales de integracion: 9

| ID Prueba | Modulos relacionados | Escenario de prueba | Resultado esperado | Resultado obtenido | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- |
| PI-01 | M-02 + M-03 | Flujo integrado de autenticacion y control RBAC en hooks. | Debe sostener sesion y habilitar vistas segun rol. | Flujo autenticacion/permiso validado extremo a extremo en capa hook. | Pass |
| PI-02 | M-04 | Flujo de donaciones con consulta integrada de metricas de donador. | Debe consolidar datos y devolver estadisticas coherentes. | Integracion de metricas confirmada. | Pass |
| PI-03 | M-01 | Flujo completo de beneficiarios desde hook con servicios mockeados de datos. | Debe cargar, actualizar estado y reflejar cambios consistentes. | Flujo integrado de beneficiarios validado. | Pass |
| PI-04 | M-08 | Flujo de proyectos en hook + servicio con recarga de informacion. | Debe mantener consistencia entre consulta y estado local. | Integracion de proyectos validada. | Pass |
| PI-05 | M-01 | Integracion del servicio de beneficiarios contra cadena de consultas Supabase. | Debe persistir y recuperar datos con mapeo correcto. | Persistencia/lectura integrada verificada. | Pass |
| PI-06 | M-04 | Integracion del servicio de donaciones con agregaciones y filtros temporales. | Debe calcular totales y periodos de forma consistente. | Agregaciones integradas correctas. | Pass |
| PI-07 | M-05 | Integracion del flujo Bold Checkout en capa de utilidades y consumo externo. | Debe construir peticion de pago valida y controlar respuestas. | Flujo de checkout integrado validado. | Pass |
| PI-08 | M-08 | Integracion del servicio de proyectos en operaciones de consulta y actualizacion. | Debe mantener contrato de datos entre capas. | Contrato y comportamiento integrados correctos. | Pass |
| PI-09 | M-02 + M-03 | Integracion del servicio de autenticacion con politicas de acceso por rol. | Debe autenticar usuario y aplicar restricciones de rol. | Autenticacion y restricciones RBAC verificadas. | Pass |

---

4. RESUMEN DE RESULTADOS

| Metrica | Valor |
| :-- | :-- |
| Total de suites ejecutadas | 34 |
| Total de pruebas ejecutadas | 375 |
| Pruebas unitarias ejecutadas | 344 |
| Pruebas de integracion ejecutadas | 31 |
| Pruebas exitosas (Pass) | 375 |
| Pruebas fallidas (Fail) | 0 |
| Porcentaje de exito | 100% |
| Cobertura global lineas | 96.91% |
| Cobertura global statements | 96.46% |
| Cobertura global funciones | 96.21% |
| Cobertura global ramas | 86.88% |

Observaciones generales:
- Se estabilizaron pruebas con limpieza de cache temporal entre casos para evitar contaminacion de estado.
- Se reforzo cobertura de ramas en modulos de evaluaciones y utilidades de evaluacion.
- El pipeline CI se mantiene estable en verde.
- En este documento, PU y PI listan todas las pruebas principales (34 suites): 25 unitarias y 9 de integracion.
- El total de 375 corresponde a subpruebas internas ejecutadas dentro de esas 34 suites.

---

5. LISTA DE MODULOS PRINCIPALES Y ESTADO

| Modulo principal | Estado actual |
| :-- | :-- |
| Beneficiarios (M-01) | Realizado |
| Autenticacion (M-02) | Realizado |
| RBAC (M-03) | Realizado |
| Donaciones (M-04) | Realizado |
| Pagos Bold (M-05) | Parcial |
| Evaluaciones (M-06) | Realizado |
| Sedes (M-07) | Realizado |
| Proyectos (M-08) | Realizado |
| Contenidos (M-09) | En progreso avanzado |
| Comunidad: Galeria/Testimonios (M-10) | Pendiente |
| Usuarios y vistas de gestion (M-11) | Pendiente |
| Almacenamiento (M-12) | Realizado (unitaria) |

---

6. FIRMAS DE VALIDACION

| Responsable Tecnico | Director de la Fundacion (Validador) |
| :-- | :-- |
| Juan Eduardo Jaramillo G. | [Nombre del Director] |





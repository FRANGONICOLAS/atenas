ESPECIFICACION Y REGISTRO DE PRUEBAS UNITARIAS E INTEGRATIVAS

Proyecto: Plataforma Web - Fundacion Sociodeportiva Atenas

Responsables: Juan Eduardo Jaramillo Guerrero y Nicolas Gonzalez Franco

Fecha de ejecucion del corte: 18 de abril de 2026

Version del sistema: v1.0

---

1. IDENTIFICACION DE LOS MODULOS TESTEADOS

| ID Modulo | Nombre del Modulo | Descripcion de funcionalidad |
| :-- | :-- | :-- |
| M-01 | Beneficiarios | Registro, actualizacion, eliminacion, filtros y consolidacion de datos de beneficiarios por sede. |
| M-02 | Autenticacion y RBAC | Inicio de sesion, sesion activa, rutas protegidas y restricciones por rol de usuario. |
| M-03 | Donaciones y Pagos | Registro de donaciones, estadisticas de donante/admin e integracion con pasarela de pago. |
| M-04 | Evaluaciones y Sedes | Gestion de evaluaciones por sede, exportaciones, asignacion de sede por usuario y operacion de sedes. |
| M-05 | Contenidos y Comunidad | Gestion de contenido publico (imagenes/banners), hooks de contenido y trazabilidad de recursos comunitarios. |

---

2. REGISTRO DE PRUEBAS UNITARIAS (LOGICA Y VALIDACION)

Objetivo: Validar que funciones, utilidades, esquemas y hooks operen correctamente de forma aislada.

| ID Prueba | Modulo | Escenario de prueba | Resultado esperado | Resultado obtenido | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- |
| PU-01 | M-01 | Validacion de formulario de registro con campos vacios (schema). | El sistema retorna error de validacion y bloquea el guardado. | Se dispararon errores de validacion correctamente y no hubo persistencia. | Pass |
| PU-02 | M-01 | Fecha de nacimiento en formato invalido en alta de beneficiario. | El schema detecta tipo/estructura invalida y notifica al usuario. | Validacion rechazada; se genero mensaje de error y no se ejecuto el create. | Pass |
| PU-03 | M-02 | Render de ruta protegida con usuario no autorizado. | El componente de proteccion debe bloquear acceso y redirigir o negar vista. | Ruta protegida bloqueo acceso segun perfil simulado en pruebas unitarias. | Pass |
| PU-04 | M-03 | Calculo de estadisticas de donacion con estados approved/pending mezclados. | Solo approved impacta totales y metricas de proyectos. | Totales, proyectos soportados y recientes se calcularon segun regla definida. | Pass |
| PU-05 | M-04 | Exportacion por tipo/periodo en evaluaciones de sede con filtros. | Se debe generar reporte solo con evaluaciones que cumplen tipo y rango. | PDF generado en escenarios validos; en escenarios vacios se mostro mensaje controlado. | Pass |
| PU-06 | M-05 | Apertura/edicion/validacion de contenido sin archivo requerido. | Debe mostrar error de validacion y evitar envio de contenido. | Se bloqueo submit y se mostro retroalimentacion al usuario. | Pass |

---

3. REGISTRO DE PRUEBAS DE INTEGRACION (CONECTIVIDAD Y FLUJO DE DATOS)

Objetivo: Verificar interaccion entre componentes React, hooks y servicios con Supabase y capas de reporte.

| ID Prueba | Modulos relacionados | Escenario de prueba | Resultado esperado | Resultado obtenido | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- |
| PI-01 | M-01 + Supabase | Persistencia de nuevo beneficiario desde servicio y recuperacion posterior. | Registro visible con datos minimos requeridos y consistentes. | Registro creado y mapeado correctamente en flujo de servicio/integracion. | Pass |
| PI-02 | M-02 + UI | Intento de acceso a ruta administrativa con rol no permitido. | Se bloquea el acceso a la vista protegida. | Flujo de proteccion validado en integracion con navegacion de prueba. | Pass |
| PI-03 | M-03 + Supabase | Consolidacion de estadisticas de donante con consultas de donacion, proyectos y beneficiarios impactados. | Se integran consultas encadenadas y se retornan metricas coherentes. | Integracion correcta, incluyendo escenarios de datos faltantes y fallback. | Pass |
| PI-04 | M-04 + Servicios de reporte | Exportacion de evaluaciones por sede y refresco de lista tras eliminacion. | Debe mantener consistencia entre estado visual, servicio y reporte generado. | Flujo validado: eliminacion y recarga correctas; exportacion con reglas de filtro. | Pass |
| PI-05 | M-05 + Supabase | Carga y refresco de contenidos publicos con stats de gestion. | El estado del hook refleja datos remotos y errores controlados. | Carga de contenidos y estadisticas validada, incluyendo manejo de errores. | Pass |

---

4. RESUMEN DE RESULTADOS

| Metrica | Valor |
| :-- | :-- |
| Total de suites ejecutadas | 34 |
| Total de pruebas ejecutadas | 375 |
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
- El pipeline CI se mantiene estable en verde al cierre de este corte.

---

5. LISTA DE MODULOS PRINCIPALES Y ESTADO (REALIZADO / PENDIENTE)

| Dominio principal | Estado actual | Evidencia de estado |
| :-- | :-- | :-- |
| Auth y sesion | Realizado | Servicios y hooks base en verde con pruebas unitarias e integracion. |
| Pagos / Bold checkout | Parcial | `boldCheckout` cubierto; prueba directa de `bold.service` pendiente por limitacion de entorno (`import.meta`). |
| Donaciones | Realizado | Servicio y hook en verde, con cobertura alta y casos de consolidacion admin/donante. |
| Beneficiarios | Realizado | Servicio y hook cubiertos, incluyendo escenarios de validacion y evaluaciones vinculadas. |
| Proyectos sociales | Realizado | Servicio y hook en verde con mapeos, filtros y flujos CRUD validados. |
| Evaluaciones y seguimiento | Realizado | Servicio + hook de sede en verde, exportaciones y ramas de error cubiertas. |
| Gestion de sedes | Realizado | Servicio + hook en verde, incluidos escenarios de mapa/geocoding y errores controlados. |
| Contenidos (sitio publico) | En progreso avanzado | `content.service`, `useSiteContent`, `useSiteContentManagement` cubiertos; cierre funcional pendiente de bloque comunidad completo. |
| Galeria y testimonios | Pendiente | Falta cierre formal del bloque RT-G*. |
| Usuarios y vistas de gestion | Pendiente | Falta cierre formal del bloque RT-U*. |
| Almacenamiento | Realizado (unitaria) | Servicio cubierto en pruebas unitarias. |

---

6. FIRMAS DE VALIDACION

| Responsable tecnico | Director de la Fundacion (Validador) |
| :-- | :-- |
| Juan Eduardo Jaramillo G. | [Nombre del Director] |

 
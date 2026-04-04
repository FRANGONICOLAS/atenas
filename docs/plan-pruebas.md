# Plan de Pruebas - Atenas (Formato de Informe)

## 1. Resumen Ejecutivo

### 1.1 Objetivo general
Definir, ejecutar y evidenciar un plan de pruebas unitarias e integracion para los modulos criticos de la aplicacion Atenas, con trazabilidad por archivo y criterios de aceptacion medibles.

### 1.2 Alcance aprobado
- Interfaz (componentes y vistas React).
- Hooks personalizados.
- Estado global.
- Integracion con Supabase.
- Integracion de pagos Bold.
- Gestion de usuarios y roles (RBAC).
- Donaciones y trazabilidad financiera.
- Beneficiarios.
- Proyectos sociales.
- Evaluaciones y seguimiento.
- Gestion de sedes.
- Reportes y exportaciones.
- Manejo de errores y resiliencia.

### 1.3 Estado actual consolidado
- Ultima ejecucion CI: `npm run test:ci`.
- Resultado: 33 suites aprobadas, 359 pruebas aprobadas, 0 fallidas.
- Cobertura global actual: 98.50% lineas, 98.07% statements, 97.00% funciones, 91.85% ramas.
- Observacion: avance fuerte en Paso 19 con bloque de Contenidos casi completo (`content.service` 83.87%, `useSiteContent` 95.65%, `useSiteContentManagement` 94.28%) y cierre de deuda en `beneficiaryCalculations` (100% ramas).

---

## 2. Metodologia y Criterios

### 2.1 Enfoque metodologico
- Tipo de pruebas: unitarias e integracion.
- Estrategia de mocks: Supabase y servicios externos simulados con contrato uniforme `data/error`.
- Ejecucion: pipeline CI estable en cada iteracion.
- Trazabilidad: cada bloque de ejecucion actualiza estado por modulo y evidencia en este documento.

### 2.2 Criterios globales de aceptacion
- Cobertura global de codigo >= 70%.
- Cobertura de modulos criticos >= 80% en los componentes priorizados de negocio.
- Cero pruebas fallidas en CI.

### 2.3 Criterios de rechazo
- Fallas en flujos criticos (auth, RBAC, pagos, donaciones, beneficiarios).
- Errores no controlados en integraciones Supabase/Bold.
- Inestabilidad de CI.

---

## 3. Matriz de Riesgo (Prioridad)

| Modulo | Riesgo principal | Impacto | Probabilidad | Prioridad |
| :-- | :-- | :-- | :-- | :-- |
| Auth y sesion | Accesos indebidos o sesion inconsistente | Alto | Alta | Alta |
| Pagos Bold | Estados transaccionales incorrectos | Alto | Alta | Alta |
| Donaciones | Inconsistencia de montos y trazabilidad | Alto | Media | Alta |
| Beneficiarios | Datos incompletos o reglas sociales incorrectas | Alto | Media | Alta |
| Proyectos | Reglas de negocio y seguimiento incorrecto | Alto | Media | Alta |
| Evaluaciones | Perdida de trazabilidad por periodo/sede | Alto | Media | Alta |
| Sedes | Cruce de informacion entre sedes | Alto | Media | Alta |
| Reportes | Datos inexactos para auditoria | Alto | Media | Alta |
| Resiliencia | Caidas por errores de red o terceros | Alto | Alta | Alta |

---

## 4. Trazabilidad por Modulo y Archivo

| ID | Dominio | Archivo objetivo | Tipo de prueba | Estado |
| :-- | :-- | :-- | :-- | :-- |
| RT-A01 | Auth | `src/api/services/auth.service.ts` | Unitaria + Integracion | Cubierto |
| RT-A02 | Auth | `src/hooks/useAuth.ts` | Unitaria + Integracion | Cubierto |
| RT-B01 | Bold | `src/api/services/bold.service.ts` | Unitaria + Integracion | Pendiente (limitacion `import.meta`) |
| RT-B02 | Bold | `src/lib/boldCheckout.ts` | Unitaria + Integracion | Cubierto |
| RT-D01 | Donaciones | `src/api/services/donation.service.ts` | Unitaria + Integracion | Cubierto |
| RT-D02 | Donaciones | `src/hooks/useDonations.ts` | Unitaria + Integracion | Cubierto |
| RT-BF01 | Beneficiarios | `src/api/services/beneficiary.service.ts` | Unitaria + Integracion | Cubierto |
| RT-BF02 | Beneficiarios | `src/hooks/useBeneficiaries.ts` | Unitaria + Integracion | Cubierto |
| RT-P01 | Proyectos | `src/api/services/project.service.ts` | Unitaria + Integracion | Cubierto |
| RT-P02 | Proyectos | `src/hooks/useProjects.ts` | Unitaria + Integracion | Cubierto |
| RT-E01 | Evaluaciones | `src/api/services/evaluation.service.ts` | Unitaria + Integracion | Cubierto |
| RT-E02 | Evaluaciones | `src/hooks/useSedeEvaluations.ts` | Unitaria + Integracion | Cubierto |
| RT-H01 | Sedes | `src/api/services/headquarter.service.ts` | Unitaria + Integracion | Cubierto |
| RT-H02 | Sedes | `src/hooks/useHeadquarters.ts` | Unitaria + Integracion | Cubierto |
| RT-C01 | Contenidos | `src/api/services/content.service.ts` | Unitaria + Integracion | En progreso |
| RT-C02 | Contenidos | `src/hooks/useSiteContent.ts` | Unitaria + Integracion | En progreso |
| RT-C03 | Contenidos | `src/hooks/useSiteContentManagement.ts` | Unitaria + Integracion | En progreso |
| RT-G01 | Galeria | `src/api/services/gallery.service.ts` | Unitaria + Integracion | Pendiente |
| RT-G02 | Testimonios | `src/api/services/testimonial.services.ts` | Unitaria + Integracion | Pendiente |
| RT-G03 | Testimonios | `src/hooks/useTestimonial.ts` | Unitaria + Integracion | Pendiente |
| RT-U01 | Usuarios | `src/api/services/user.service.ts` | Unitaria + Integracion | Pendiente |
| RT-U02 | Usuarios | `src/hooks/useAdminView.ts` | Unitaria + Integracion | Pendiente |
| RT-U03 | Usuarios | `src/hooks/useDirectorView.ts` | Unitaria + Integracion | Pendiente |
| RT-U04 | Usuarios | `src/hooks/useDirectorSedeView.ts` | Unitaria + Integracion | Pendiente |
| RT-U05 | Usuarios | `src/hooks/useDonatorView.ts` | Unitaria + Integracion | Pendiente |
| RT-S01 | Almacenamiento | `src/api/services/storage.service.ts` | Unitaria + Integracion | Cubierto (unitaria) |

---

## 5. Plan de Ejecucion por Pasos (Definicion Formal)

| Paso | Objetivo | Actividades principales | Evidencia esperada | Criterio de cierre | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Paso 1 | Definir alcance | Consolidar alcance tecnico y funcional | Alcance validado | Alcance aprobado | Completado |
| Paso 2 | Riesgos y criticidad | Construir matriz impacto/probabilidad | Matriz de riesgo | Riesgos priorizados | Completado |
| Paso 3 | Trazabilidad | Mapear requisitos a casos por archivo | Matriz RT-* | Todos los modulos trazados | Completado |
| Paso 4 | Umbrales de calidad | Definir criterios de aceptacion/rechazo | Umbrales formales | Criterios aprobados | Completado |
| Paso 5 | Setup tecnico | Configurar Jest/RTL/mocks/scripts | CI ejecutable | Pipeline estable | Completado |
| Paso 6 | Estandar de mocks | Unificar contratos de simulacion | Mocks reutilizables | Contrato estandar en uso | Completado |
| Paso 7 | Cobertura base unitaria | Probar UI/hooks/estado base | Suites unitarias iniciales | Unitarias estables | Completado |
| Paso 8 | Cobertura base integracion | Probar flujos Supabase/Bold base | Suites integracion iniciales | Integracion estable | Completado |
| Paso 9 | Seguridad funcional | Validar RBAC/sesion/forbidden | Casos de acceso | Escenarios de seguridad cubiertos | Completado |
| Paso 10 | Resiliencia | Validar timeout/errores controlados | Casos de error y recuperacion | Manejo de error validado | Completado |
| Paso 11 | Cierre de brechas inicial | Subir cobertura en modulos base | Incremento medible | CI estable y brechas documentadas | Completado |
| Paso 12 | Brechas criticas | Mitigar puntos tecnicos de cobertura | Casos adicionales | Cobertura incremental estable | Completado |
| Paso 13 | Hooks y errores avanzados | Profundizar ramas y edge cases | Nuevos casos unitarios | Reduccion de brecha | Completado |
| Paso 14 | Normalizar cobertura | Excluir infraestructura de test del calculo | Cobertura real de producto | Metodologia de coverage correcta | Completado |
| Paso 15 | Bloque Donaciones | Cubrir `donation.service` + `useDonations` | Tests unitarios/integracion + CI | RT-D01/RT-D02 cerrados | Completado |
| Paso 16 | Bloque Beneficiarios | Cubrir `beneficiary.service` + `useBeneficiaries` | Tests unitarios/integracion + CI | RT-BF01/RT-BF02 cerrados | Completado |
| Paso 17 | Bloque Proyectos | Cubrir `project.service` + `useProjects` | Tests + evidencia CI | RT-P01/RT-P02 cerrados | Completado |
| Paso 17A | Mejora de cobertura de soporte | Cubrir `storage.service` y `beneficiaryUtils` | Tests unitarios + evidencia CI | Cobertura global >= 70% y modulos en 100% lineas | Completado |
| Paso 17B | Hardening de ramas | Cubrir ramas de error/fallback en servicios y hooks | Tests unitarios/integracion + evidencia CI | Incremento de branch coverage en modulos prioritarios | Completado |
| Paso 17C | Ejecucion de 3 frentes priorizados | Completar bloque hooks + servicios + beneficiarios | Tests unitarios/integracion + evidencia CI | Cumplir solicitud de ataque en 3 puntos | Completado |
| Paso 17D | Hardening focalizado adicional | Agregar escenarios de validacion/fallback/error en 6 modulos rezagados | Tests unitarios/integracion + evidencia CI | Estabilidad total y nueva medicion por archivo de ramas | Completado |
| Paso 17E | Cierre de brecha en Beneficiarios | Atacar ramas faltantes de `beneficiary.service` (errores por metodo, null-data, fallbacks y mapeo de evaluacion) | Tests unitarios + evidencia CI | Superar >=80% branches en `beneficiary.service` y mantener suite estable | Completado |
| Paso 18 | Bloque Evaluaciones y Sedes | Cubrir `evaluation.service`, `useSedeEvaluations`, `headquarter.service`, `useHeadquarters` | Tests + evidencia CI | RT-E*/RT-H* cerrados | Completado |
| Paso 18B | Hardening adicional Evaluaciones/Sedes | Agregar ramas de error/fallback/guard y refresh en servicios y hooks de sede | Tests focales + CI completo + medicion de cobertura | Subir ramas en modulos Paso 18 sin romper CI | Completado |
| Paso 19 | Bloque Contenidos y Comunidad | Cubrir contenido, galeria y testimonios | Tests + evidencia CI | RT-C*/RT-G* cerrados | Pendiente |
| Paso 20 | Bloque Usuarios y Storage | Cubrir `user.service`, vistas de gestion y `storage.service` | Tests + evidencia CI | RT-U*/RT-S01 cerrados | Pendiente |

---

## 6. Bitacora de Ejecucion (Evidencia Resumida)

| Corte | Suites | Tests | Fallos | Cobertura global | Comentario |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Paso 7 | 5 | 9 | 0 | 33.68% | Cobertura unitaria base |
| Paso 8 | 7 | 13 | 0 | 43.30% | Integracion base Supabase/Bold |
| Paso 9 | 8 | 18 | 0 | 48.48% | Seguridad funcional |
| Paso 10 | 9 | 25 | 0 | 51.53% | Resiliencia y errores |
| Paso 11 | 9 | 35 | 0 | 58.58% | Cierre inicial de brechas |
| Paso 12 | 10 | 39 | 0 | 60.73% | Refuerzo flujo Bold |
| Paso 13 | 11 | 44 | 0 | 68.71% | Hooks y errores avanzados |
| Paso 14 | 11 | 44 | 0 | 82.88% | Cobertura normalizada de codigo productivo |
| Paso 15 | 15 | 55 | 0 | 86.48% | Donaciones cubiertas |
| Paso 16 | 19 | 66 | 0 | 68.57% | Beneficiarios cubiertos; se sumaron archivos de soporte con baja cobertura |
| Paso 17 | 23 | 79 | 0 | 68.59% | Proyectos cubiertos en unitarias e integracion |
| Paso 17A | 25 | 91 | 0 | 79.45% | `storage.service` y `beneficiaryUtils` cubiertos; recuperacion de cobertura global |
| Paso 17B | 25 | 122 | 0 | 84.24% | Hardening de ramas en auth/storage/toast/boldCheckout y mejora parcial en proyectos |
| Paso 17C | 25 | 154 | 0 | 94.93% | Se completaron los 3 frentes priorizados; mejora integral en hooks y servicios |
| Paso 17D | 25 | 177 | 0 | 94.93% | Se agregaron casos de fallback/validacion/error en hooks y servicios; sin variacion porcentual en branch coverage de los 6 modulos mas complejos |
| Paso 17E | 25 | 196 | 0 | 97.43% | Cierre de deuda en `beneficiary.service`: 93.33% branches; cobertura global de ramas en 91.62% |
| Paso 18A | 29 | 243 | 0 | 87.19% | Inicio de Paso 18 con nuevas suites en Evaluaciones y Sedes; `project.service` en 100% branches |
| Paso 18B | 29 | 279 | 0 | 94.67% | Segunda ronda de hardening en Paso 18: servicios de evaluaciones/sedes por encima de 94% ramas; hooks de sede mejorados y CI completo estable |
| Paso 18C | 29 | 287 | 0 | 96.28% | Cierre formal de Paso 18: hooks de sede sobre umbral de ramas (`useSedeEvaluations` 84.00%, `useHeadquarters` 80.39%) y CI completo en verde |
| Paso 19A | 30 | 311 | 0 | 96.44% | Inicio de Contenidos: nueva suite unitaria para `content.service` con cobertura de ramas en 83.87% y validacion en CI completo |
| Paso 19B | 32 | 343 | 0 | 96.75% | Hardening de `useSiteContentManagement`: salto de ramas 57.14% -> 77.14% con casos de validacion y manejo de errores |
| Paso 19C | 33 | 359 | 0 | 98.07% | Cierre de deuda de soporte con suite dedicada de `beneficiaryCalculations` (100% ramas) y mejoras de `useSiteContentManagement` a 94.28% ramas |

---

## 7. Hallazgos y Acciones Correctivas

### 7.1 Hallazgos tecnicos
- `src/api/services/bold.service.ts` mantiene limitacion de test directo por `import.meta` bajo configuracion actual de Jest CJS.
- La brecha principal de soporte (`storage.service`, `beneficiaryUtils`) ya fue mitigada con suites unitarias dedicadas.

### 7.2 Acciones correctivas propuestas
1. Completar RT-C* cerrando estado de Contenidos a Cubierto con barrido final de ramas residuales en `content.service`.
2. Iniciar RT-G* (galeria/testimonios) para sostener la velocidad de cierre del Paso 19.
3. Mantener seguimiento de ramas no cubiertas en `useAuth` (89.18), `useBeneficiaries` (84.61) y `use-toast` (81.25) para reducir deuda residual por fallback.
4. Evaluar migracion controlada de runner o configuracion ESM para habilitar pruebas directas de `bold.service`.

---

## 8. Proximo Paso Operativo

Siguiente bloque comprometido: **Paso 19 - Contenidos y Comunidad**
- `src/api/services/content.service.ts`
- `src/hooks/useSiteContent.ts`
- `src/hooks/useSiteContentManagement.ts`
- `src/api/services/gallery.service.ts`
- `src/api/services/testimonial.services.ts`
- `src/hooks/useTestimonial.ts`

Criterio de aceptacion del siguiente bloque:
- Unitarias + integracion en verde para los archivos RT-C* y RT-G*.
- Actualizacion de trazabilidad de Contenidos/Galeria/Testimonios hacia estado Cubierto.
- Nuevo corte de CI documentado en este informe (ultimo corte: 33 suites, 359 tests, 0 fallos).

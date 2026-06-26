# Guía de Pruebas — EventOut

Documentación técnica de la estrategia y el conjunto de pruebas automatizadas del
proyecto **EventOut** (backend Spring Boot + frontend React). Describe **qué se
prueba**, **dónde está cada prueba** y **cómo ejecutarlas**.

> Última verificación: **26 pruebas en verde** (16 backend + 10 frontend),
> `BUILD SUCCESS` y `lint` sin errores.

---

## 1. Resumen ejecutivo

| Capa | Framework | Archivos | Casos | Tipo principal | Estado |
|------|-----------|:-------:|:-----:|----------------|:------:|
| Backend | JUnit 5 + Mockito + AssertJ + Spring Boot Test | 7 | **16** | Unitarias (servicios/validación) + 1 de integración | ✅ |
| Frontend | Vitest + Testing Library + jsdom | 4 | **10** | Unitarias de UI (render + interacción) + funciones puras | ✅ |
| **Total** | — | **11** | **26** | — | ✅ |

**Filosofía:** pruebas rápidas y deterministas que aíslan la **lógica de negocio**
(servicios) y los **contratos de la interfaz** (componentes), sin depender de
servicios externos. Las dependencias (repositorios, API, autenticación) se
sustituyen por *mocks*, salvo en la prueba de integración que sí levanta el
contexto completo de Spring.

---

## 2. Stack de pruebas

### Backend
| Herramienta | Rol |
|-------------|-----|
| **JUnit 5 (Jupiter)** | Motor de ejecución de pruebas. |
| **Mockito** | Crea *mocks* de repositorios/servicios para aislar la unidad bajo prueba. |
| **AssertJ** | Aserciones fluidas y legibles (`assertThat(...)`, `assertThatThrownBy(...)`). |
| **Spring Boot Test** | Levanta el contexto de Spring en la prueba de integración (`@SpringBootTest`). |
| **Hibernate Validator** | Valida las anotaciones de Bean Validation del DTO `EventoRequest`. |

Todas vienen incluidas en `spring-boot-starter-test` (ver [pom.xml](backend/eventout-backend/pom.xml)). Java **21**.

### Frontend
| Herramienta | Rol |
|-------------|-----|
| **Vitest** | Motor de ejecución (equivalente a Jest, nativo de Vite). |
| **@testing-library/react** | Renderiza componentes y consulta el DOM como lo haría un usuario (`getByRole`, `getByText`). |
| **@testing-library/user-event** | Simula interacciones reales (clicks, escritura). |
| **@testing-library/jest-dom** | *Matchers* de DOM (`toBeInTheDocument`, `toHaveAttribute`). |
| **jsdom** | Implementación de un DOM en Node (no requiere navegador real). |

Configuración en [vitest.config.js](frontend/vitest.config.js) y setup en
[src/test/setup.js](frontend/src/test/setup.js).

---

## 3. Ubicación de las pruebas

```
Producto/
├── backend/eventout-backend/
│   └── src/test/java/com/proyectoPortafolio/eventout_backend/
│       ├── EventoutBackendApplicationTests.java   ← integración (contexto Spring)
│       ├── AuthServiceTest.java                    ← autenticación
│       ├── EventoServiceTest.java                  ← eventos
│       ├── EventoRequestValidationTest.java        ← validación de fechas/longitud
│       ├── ResenaServiceTest.java                  ← reseñas
│       ├── VotoServiceTest.java                    ← votos
│       └── FavoritoServiceTest.java                ← favoritos
│
└── frontend/
    ├── vitest.config.js                            ← config de Vitest
    └── src/test/
        ├── setup.js                                ← setup global (jest-dom + cleanup)
        ├── utils.test.js                           ← funciones puras
        ├── Button.test.jsx                         ← componente UI
        ├── Estrellas.test.jsx                      ← componente UI interactivo
        └── LugarCard.test.jsx                      ← componente con datos
```

---

## 4. Pruebas del Backend

### 4.1 Requisitos previos

- **JDK 21** instalado (`java -version`).
- **MySQL en ejecución** en `localhost:3306` — **solo necesario para la prueba de
  integración** `EventoutBackendApplicationTests`, que levanta el contexto real y
  abre conexión a la BD `eventout_db`. Las demás 16 pruebas son unitarias puras
  (usan Mockito) y **no necesitan base de datos**.
- No hace falta instalar Maven: el proyecto incluye el *wrapper* (`mvnw` / `mvnw.cmd`).

### 4.2 Cómo ejecutarlas

Desde la carpeta `backend/eventout-backend/`:

```powershell
# Windows (PowerShell)
.\mvnw.cmd test
```

```bash
# Linux / macOS / Git Bash
./mvnw test
```

**Comandos útiles:**

```powershell
# Ejecutar una sola clase de prueba
.\mvnw.cmd test -Dtest=AuthServiceTest

# Ejecutar un solo método
.\mvnw.cmd test -Dtest=AuthServiceTest#login_usuarioBloqueado_lanzaUnauthorized

# Saltar solo la prueba de integración (no levantar Spring/MySQL)
.\mvnw.cmd test -Dtest=!EventoutBackendApplicationTests

# Compilar + pruebas + empaquetar
.\mvnw.cmd verify
```

El reporte de resultados queda en `target/surefire-reports/`.

### 4.3 Catálogo de casos

#### `EventoutBackendApplicationTests` — Integración (1 caso)
| ID | Método | Qué valida | Resultado esperado |
|----|--------|------------|--------------------|
| INT-01 | `contextLoads` | Que toda la configuración de Spring (beans, JPA, seguridad, *datasource*) arranca sin errores. | El contexto carga correctamente. |

#### `AuthServiceTest` — Autenticación (4 casos)
| ID | Método | Qué valida | Resultado esperado |
|----|--------|------------|--------------------|
| AUTH-01 | `register_emailDuplicado_lanzaConflict` | No se permite registrar un email ya existente (insensible a mayúsculas). | Lanza `ConflictException`; **no** se guarda el usuario. |
| AUTH-02 | `login_passwordIncorrecta_lanzaUnauthorized` | Contraseña incorrecta en login. | Lanza `UnauthorizedException`. |
| AUTH-03 | `login_usuarioBloqueado_lanzaUnauthorized` | Cuenta `BLOQUEADO` no puede iniciar sesión aunque la contraseña sea correcta. | Lanza `UnauthorizedException`. |
| AUTH-04 | `me_usuarioBloqueado_lanzaUnauthorized` | Una cuenta bloqueada mientras hay sesión es rechazada al revalidar (`/auth/me`). | Lanza `UnauthorizedException`. |

#### `EventoServiceTest` — Eventos (2 casos)
| ID | Método | Qué valida | Resultado esperado |
|----|--------|------------|--------------------|
| EVT-01 | `listar_desdeInvalido_lanzaBadRequest` | Parámetro de fecha `desde` con formato inválido. | Lanza `BadRequestException`. |
| EVT-02 | `proponer_dejaEstadoPendiente` | Un evento propuesto por un usuario queda pendiente de aprobación. | El evento se crea con estado `PENDIENTE`. |

#### `EventoRequestValidationTest` — Validación de DTO (4 casos)
| ID | Método | Qué valida | Resultado esperado |
|----|--------|------------|--------------------|
| VAL-01 | `fechaInicioEnPasado_esInvalida` | La fecha de inicio no puede estar en el pasado. | La validación falla (hay violaciones). |
| VAL-02 | `fechaFinAntesDeInicio_esInvalida` | La fecha de fin no puede ser anterior a la de inicio. | La validación falla. |
| VAL-03 | `fechasCoherentes_sonValidas` | Fechas coherentes (futuro, fin > inicio). | La validación pasa (sin violaciones). |
| VAL-04 | `nombreDemasiadoLargo_esInvalido` | El nombre excede el máximo (150 caracteres). | La validación falla. |

#### `ResenaServiceTest` — Reseñas (2 casos)
| ID | Método | Qué valida | Resultado esperado |
|----|--------|------------|--------------------|
| RES-01 | `publicar_lugar_creaResenaVisible` | Publicar una reseña de un lugar. | Se crea con estado `VISIBLE` y los datos correctos (lugar, usuario, puntuación). |
| RES-02 | `listarPublicas_ordenaPorScoreDescendente` | Las reseñas se ordenan por *score* (positivos − negativos) de mayor a menor. | Devuelve primero la de mayor score. |

#### `VotoServiceTest` — Votos (2 casos)
| ID | Método | Qué valida | Resultado esperado |
|----|--------|------------|--------------------|
| VOT-01 | `votar_mismoVotoExistente_eliminaYDevuelveNull` | Votar igual que el voto existente (toggle). | Elimina el voto y devuelve `null`; no guarda. |
| VOT-02 | `votar_votoContrario_actualizaEsPositivo` | Cambiar el sentido de un voto existente. | Actualiza `esPositivo`; no elimina. |

#### `FavoritoServiceTest` — Favoritos (1 caso)
| ID | Método | Qué valida | Resultado esperado |
|----|--------|------------|--------------------|
| FAV-01 | `toggle_xorInvalido_lanzaBadRequest` | Debe enviarse exactamente uno: lugar **o** evento (XOR). | Lanza `BadRequestException` si faltan ambos o vienen ambos. |

---

## 5. Pruebas del Frontend

### 5.1 Requisitos previos

- **Node.js 20+** y **npm** (requerido por Vite 8).
- Dependencias instaladas: `npm install` (una vez) desde la carpeta `frontend/`.
- **No requiere** navegador, backend ni base de datos: el DOM se simula con jsdom y
  las llamadas a la API/autenticación se *mockean*.

### 5.2 Cómo ejecutarlas

Desde la carpeta `frontend/`:

```bash
npm test              # ejecuta toda la suite una vez (modo CI)
npm run test:watch    # modo interactivo: re-ejecuta al guardar cambios
npm run test:coverage # genera reporte de cobertura (carpeta coverage/)
```

```bash
# Ejecutar un solo archivo
npm test -- Button

# Filtrar por nombre de caso
npm test -- -t "ejecuta onClick"
```

El reporte de cobertura HTML queda en `coverage/index.html`.

### 5.3 Catálogo de casos

#### `utils.test.js` — Funciones puras (3 casos)
| ID | Caso | Qué valida | Resultado esperado |
|----|------|------------|--------------------|
| UTIL-01 | `formatPrecio` → "Gratis" | Formato de precio cuando es gratuito. | Devuelve `"Gratis"`. |
| UTIL-02 | `formatPrecio` → CLP | Formato como moneda chilena. | Contiene `$` y `12.500`. |
| UTIL-03 | `imgPlaceholder` | URL de imagen determinística por semilla. | Devuelve la URL esperada de `picsum.photos`. |

#### `Button.test.jsx` — Componente UI (2 casos)
| ID | Caso | Qué valida | Resultado esperado |
|----|------|------------|--------------------|
| BTN-01 | renderiza su contenido | El botón muestra su texto. | El elemento con rol `button` y nombre "Guardar" está en el DOM. |
| BTN-02 | ejecuta `onClick` | El callback se dispara al pulsar. | `onClick` se llama exactamente 1 vez. |

#### `Estrellas.test.jsx` — Componente interactivo (2 casos)
| ID | Caso | Qué valida | Resultado esperado |
|----|------|------------|--------------------|
| STAR-01 | renderiza 5 estrellas | El control de puntuación siempre muestra 5 estrellas. | Hay 5 elementos "star". |
| STAR-02 | `onChange` con índice | Al pulsar una estrella reporta su valor. | `onChange` se llama con `4`. |

#### `LugarCard.test.jsx` — Componente con datos (3 casos) — *"PU-04" del informe*
| ID | Caso | Qué valida | Resultado esperado |
|----|------|------------|--------------------|
| CARD-01 | muestra el nombre | Render de la tarjeta con props válidas. | El encabezado con el nombre del lugar está presente. |
| CARD-02 | muestra la categoría | La categoría se renderiza. | El texto de la categoría está presente. |
| CARD-03 | muestra la imagen + alt | La imagen usa el nombre como texto alternativo. | El `img` tiene el `src` correcto y `alt` accesible. |

> `LugarCard` contiene `BotonFavorito` (que usa sesión/API). Se *mockea*
> `useFavoritoViewModel` para probar la tarjeta de forma aislada, y se envuelve en
> `MemoryRouter` porque usa `<Link>`.

---

## 6. Convenciones y técnicas aplicadas

- **Patrón AAA (Arrange–Act–Assert):** cada prueba prepara datos, ejecuta la acción
  y verifica el resultado.
- **Aislamiento por *mocks*:** los servicios backend se prueban sin BD real; los
  componentes frontend, sin backend real. Esto hace las pruebas **rápidas y
  deterministas**.
- **Pruebas de comportamiento, no de implementación:** en el frontend se consulta el
  DOM por rol/texto (como un usuario), no por clases CSS o estructura interna.
- **Casos felices y de error:** se cubren tanto los flujos válidos (p. ej.
  `fechasCoherentes_sonValidas`) como los de error (`...lanzaBadRequest`,
  `...lanzaUnauthorized`).
- **Nomenclatura descriptiva:** el nombre del método describe escenario y resultado
  esperado (`accion_condicion_resultado`).

---

## 7. Solución de problemas frecuentes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `contextLoads` falla con error de conexión | MySQL no está corriendo. | Inicia MySQL, o salta la integración: `.\mvnw.cmd test -Dtest=!EventoutBackendApplicationTests`. |
| Las 16 pruebas unitarias backend fallan al compilar | Lombok no procesado / JDK ≠ 21. | Verifica `java -version` = 21 y reimporta el proyecto Maven. |
| `npm test` falla con "Cannot find module '@/...'" | Alias `@` no resuelto. | Vitest hereda el alias de `vite.config.js`; ejecuta desde la carpeta `frontend/`. |
| Pruebas frontend "cuelgan" o no terminan | Se usó `npm run test:watch` en CI. | Usa `npm test` (modo `vitest run`, una sola pasada). |

---

## 8. Tabla maestra (para el informe)

| # | ID | Capa | Componente / Unidad | Tipo |
|---|----|----|---------------------|------|
| 1 | INT-01 | Backend | Contexto Spring | Integración |
| 2 | AUTH-01 | Backend | AuthService | Unitaria |
| 3 | AUTH-02 | Backend | AuthService | Unitaria |
| 4 | AUTH-03 | Backend | AuthService | Unitaria |
| 5 | AUTH-04 | Backend | AuthService | Unitaria |
| 6 | EVT-01 | Backend | EventoService | Unitaria |
| 7 | EVT-02 | Backend | EventoService | Unitaria |
| 8 | VAL-01 | Backend | EventoRequest (validación) | Unitaria |
| 9 | VAL-02 | Backend | EventoRequest (validación) | Unitaria |
| 10 | VAL-03 | Backend | EventoRequest (validación) | Unitaria |
| 11 | VAL-04 | Backend | EventoRequest (validación) | Unitaria |
| 12 | RES-01 | Backend | ResenaService | Unitaria |
| 13 | RES-02 | Backend | ResenaService | Unitaria |
| 14 | VOT-01 | Backend | VotoService | Unitaria |
| 15 | VOT-02 | Backend | VotoService | Unitaria |
| 16 | FAV-01 | Backend | FavoritoService | Unitaria |
| 17 | UTIL-01 | Frontend | utils.formatPrecio | Unitaria |
| 18 | UTIL-02 | Frontend | utils.formatPrecio | Unitaria |
| 19 | UTIL-03 | Frontend | utils.imgPlaceholder | Unitaria |
| 20 | BTN-01 | Frontend | Button | Unitaria UI |
| 21 | BTN-02 | Frontend | Button | Unitaria UI |
| 22 | STAR-01 | Frontend | Estrellas | Unitaria UI |
| 23 | STAR-02 | Frontend | Estrellas | Unitaria UI |
| 24 | CARD-01 | Frontend | LugarCard | Unitaria UI |
| 25 | CARD-02 | Frontend | LugarCard | Unitaria UI |
| 26 | CARD-03 | Frontend | LugarCard | Unitaria UI |

---

## 9. Resumen de comandos

| Acción | Comando | Carpeta |
|--------|---------|---------|
| Todas las pruebas backend | `.\mvnw.cmd test` | `backend/eventout-backend/` |
| Una clase backend | `.\mvnw.cmd test -Dtest=AuthServiceTest` | `backend/eventout-backend/` |
| Backend sin integración | `.\mvnw.cmd test -Dtest=!EventoutBackendApplicationTests` | `backend/eventout-backend/` |
| Todas las pruebas frontend | `npm test` | `frontend/` |
| Frontend en modo *watch* | `npm run test:watch` | `frontend/` |
| Cobertura frontend | `npm run test:coverage` | `frontend/` |

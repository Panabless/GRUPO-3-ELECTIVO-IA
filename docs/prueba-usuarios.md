# Diseño de prueba de usuarios · Monitoreo de combustible de flota autónoma

## 1. Objetivo, hipótesis y alcance

Pregunta: ¿se entiende y se logra el flujo principal: identificar un camión que requiere atención, asignarle un carro y confirmar el cierre del abastecimiento?

Hipótesis: Creemos que un controlador de flota que no conoce el prototipo puede completar el flujo principal sin ayuda. Lo sabremos cuando observemos que todos los controladores que participen (uno o dos) completan T1, T2 y T3 sin ayuda dentro del tiempo umbral y que ninguno toma un camión «sin señal» como si estuviera normal. Si una persona no completa una tarea sin ayuda, la hipótesis queda refutada para esa tarea.

Fuera del alcance: esta prueba no comprueba si el sistema funciona técnicamente (lectura real de sensores, envío real de la orden, conexión a base de datos), ni si la regla de priorización es la correcta para la operación, ni el desempeño en condiciones reales de mina.

## 2. Tareas, métricas y umbral

| Tarea | HU | Escenario | Objetivo | Éxito | No revelar | Umbral |
|---|---|---|---|---|---|---|
| T1 | HU-01, HU-03 | «Empieza su turno. Quiere saber qué camiones podrían quedarse sin combustible pronto y cuál revisaría primero.» | Identificar los camiones que requieren atención y cuál verificar primero | Nombra CAM-07 y CAM-12 como críticos y reconoce que el dato de CAM-21 no es confiable, sin tratarlo como normal | La lista «Requieren atención», el estado «Sin señal», que se toca el camión | Todos los controladores sin ayuda en menos de 2 min, máximo 1 desvío |
| T2 | HU-02, HU-04 | «Le preocupa el CAM-12. Quiere comprobar si el dato tiene sentido y, si corresponde, hacer que lo abastezcan.» | Revisar los antecedentes y registrar una orden de reabastecimiento | Orden registrada para CAM-12 con un carro disponible y un sector, sin ayuda | Nombres de pantallas y campos, qué carro está disponible | Todos los controladores sin ayuda en menos de 3 min, máximo 1 desvío |
| T3 | HU-05 | «Le avisan que ya terminaron de abastecer el CAM-12. Quiere que el sistema quede al día para el siguiente turno.» | Dejar registrado que el abastecimiento terminó | Orden cerrada y CAM-12 fuera de pendientes | Dónde está la confirmación | Todos los controladores sin ayuda en menos de 90 seg, máximo 1 desvío |


Métricas por tarea:
- **Eficacia:** completa sin ayuda (sí o no).
- **Eficiencia:** tiempo, ayudas pedidas y desvíos. *Ayuda* es cualquier pista del facilitador o consulta sobre cómo continuar; *desvío* es entrar a una pantalla que no corresponde a la tarea.
- **Satisfacción:** cuestionario SUS al final de la sesión.

## 3. Perfiles y reclutamiento

| Perfil | Usuario o stakeholder | N.º | Cómo se contacta | Por qué |
|---|---|---|---|---|
| Controlador de flota | Usuario (ejecuta las tareas T1 a T3) | 2 o 3 | Contacto directo con los controladores que ya participaron en la conversación del 15 de octubre (ver `docs/historias.md`). La sesión es en la sala de control de la operacion, en una ventana de su jornada en que puedan realizar la prueba. | Es quien hoy revisa camión por camión y quien usaría la aplicación en cada turno, así que es quien debe poder recorrer el flujo. |
| Jefe de turno | Stakeholder (no ejecuta tareas; se le consulta por restricciones y adopción) | 1 | Mediante el mismo contacto en la organización, en la faena, en un momento de menor carga. | Revisa órdenes y cierres del turno y define si el registro encaja con su forma de supervisar. |
| Operador de camión de combustible | Stakeholder y perfil del excluido según el mapa de impacto del Avance 5 | 1 o 2 | Mediante jefatura de la operación, o con operadores de la misma función en otra faena si la organización no autoriza. | Recibe las órdenes sin usar la aplicación y su versión solo queda si el controlador la anota. Como el prototipo no tiene pantalla para él, se lo entrevista (contexto y cierre), no se le piden tareas. |

Sobre la cantidad: la referencia es cinco por perfil, pero la prueba se hará en una sala de control con acceso controlado y confidencial, con personas que solo pueden participar cuando tienen una ventana libre en sus labores. Por eso el mínimo es un controlador, un jefe de turno y un operador, y se llega a dos controladores si es posible.

No se reclutará solo entre compañeros de curso. Si la organización exige una autorización formal, se solicitará al profesor el certificado de respaldo por correo, indicando la organización y la persona a quien se dirige. Si aun así no se obtiene el permiso, se invitará a personas con la misma función en otra empresa o faena, justificando por qué representan a quien usará la solución.

En este repositorio no se escribirán nombres, teléfonos ni correos de participantes.

## 4. Pauta de validación

Ver [docs/pauta-validacion.md](pauta-validacion.md).

## 5. Plan de levantamiento

Sesiones: 4 (2 con controladores, 1 entrevista con el jefe de turno y 1 entrevista con el operador de camión de combustible); 3 si solo se logra un controlador· Duración por sesión: máximo 20 min para controladores (consentimiento, contexto, tareas y SUS) y máximo 15 min para los stakeholders.

Roles en cada sesión (se rotan entre el equipo):
- **Facilita:** es la única persona que habla con el participante. [por definir]
- **Registra:** anota en la planilla, sin intervenir. [por definir]
- **Resguarda la evidencia:** sube la grabación a la carpeta y verifica que quedó protegida. [por definir]

Ninguna persona cumple dos roles en la misma sesión.

Cómo se registra: en las sesiones solo se graba **solo la pantalla del computador del facilitador**, sin voz ni rostro, con el consentimiento leído al inicio. Las entrevistas con el jefe de turno y con el operador no se graban: solo se toman notas. Se descarta la voz porque la sala de control es ruidosa y la información que allí circula es confidencial por políticas de la organización; lo que la persona dice lo anota quien registra. Las grabaciones se guardan en una carpeta del curso en Drive con acceso restringido al equipo y al profesor, **fuera de este repositorio**, y se eliminan al terminar el curso. En el repositorio solo se conserva la planilla, con códigos como P1, P2 y nunca nombres.

Preparación del prototipo: en cada sesión se parte desde cero con el botón «Reiniciar» y se ignora la barra inferior de revisión («Vacío», «Cargando», «Sin conexión»), que existe solo para mostrar estados y no forma parte de la aplicación.

Planilla de registro (una fila por observación):

| Participante | Tarea | Minuto | Observado | Interpretado | Severidad |
|---|---|---|---|---|---|
| | | | | | |

Regla de decisión:
- **Bloquea** (la persona no completa la tarea sin ayuda): se corrige antes de construir.
- **Entorpece** (completa con dudas o errores): se prioriza según cuántas personas lo vivieron.
- **Estético** (completa y solo le incomoda): se registra y espera.

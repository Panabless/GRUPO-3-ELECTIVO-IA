# Diseño de prueba de usuarios · Monitoreo de combustible de flota autónoma

## 1. Objetivo, hipótesis y alcance

Pregunta: ¿se entiende y se logra el flujo principal: identificar un camión que requiere atención, asignarle un carro y confirmar el cierre del abastecimiento?

Hipótesis: Creemos que un controlador de flota que no conoce el prototipo puede completar el flujo principal sin ayuda. Lo sabremos cuando observemos que al menos 4 de 5 personas completan cada tarea sin ayuda dentro del tiempo umbral y que ninguna toma un camión «sin señal» como si estuviera normal. Si 2 o más personas no completan una tarea sin ayuda, la hipótesis queda refutada para esa tarea.

Fuera del alcance: esta prueba no comprueba si el sistema funciona técnicamente (lectura real de sensores, envío real de la orden, conexión a base de datos), ni si la regla de priorización es la correcta para la operación, ni el desempeño en condiciones reales de mina.

## 2. Tareas, métricas y umbral

| Tarea | HU | Escenario | Objetivo | Éxito | No revelar | Umbral |
|---|---|---|---|---|---|---|
| T1 | HU-01, HU-03 | «Empieza su turno. Quiere saber qué camiones podrían quedarse sin combustible pronto y de cuáles no puede fiarse del dato.» | Identificar los camiones que requieren atención y el que tiene información no confiable | Nombra CAM-07 y CAM-12 como críticos y CAM-21 como dato no confiable, sin tratarlo como normal | La lista «Requieren atención», el estado «Sin señal», que se toca el camión | 4 de 5 sin ayuda en menos de 2 min |
| T2 | HU-02, HU-04 | «Le preocupa el CAM-12. Quiere comprobar si el dato tiene sentido y, si corresponde, hacer que lo abastezcan.» | Revisar los antecedentes y registrar una orden de reabastecimiento | Orden registrada para CAM-12 con un carro disponible y un sector, sin ayuda | Nombres de pantallas y campos, qué carro está disponible | 4 de 5 sin ayuda en menos de 3 min y con máximo 1 desvío |
| T3 | HU-05 | «Le avisan que ya terminaron de abastecer el CAM-12. Quiere que el sistema quede al día para el siguiente turno.» | Dejar registrado que el abastecimiento terminó | Orden cerrada y CAM-12 fuera de pendientes | Dónde está la confirmación | 4 de 5 sin ayuda en menos de 90 s |

Métricas por tarea:
- **Eficacia:** completa sin ayuda (sí o no).
- **Eficiencia:** tiempo, ayudas pedidas y desvíos.
- **Satisfacción:** cuestionario SUS al final de la sesión.

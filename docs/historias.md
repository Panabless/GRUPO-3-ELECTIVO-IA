# Historias de usuario · Monitoreo de combustible de flota autónoma

Conversación: tres controladores de flota, 15 de octubre de 2026. Los controladores explicaron que deben revisar individualmente cada camión para conocer su nivel estimado de combustible y solicitar apoyo al especialista cuando la información no parece coherente. También señalaron que los abastecimientos se registran manualmente en papel o en una planilla Excel compartida, lo que dificulta mantener la continuidad de la información entre turnos. Ante una lectura dudosa, deben revisar el historial del equipo y confirmar su último abastecimiento antes de decidir si puede continuar operando o debe ser enviado a reabastecimiento.

Flujo principal: revisar el estado de combustible de la flota, identificar un camión que requiere atención, consultar sus antecedentes y coordinar su reabastecimiento con el operador del camión de combustible hasta confirmar el cierre.

Historia principal: HU-01

## HU-01 · Identificar camiones que requieren atención

Como controlador de flota, quiero identificar en una sola vista los camiones con posibles niveles críticos de combustible, para priorizar su revisión antes de coordinar el reabastecimiento.

- Escenario principal. Dado que existen lecturas recientes de combustible para los camiones de la flota, cuando el controlador abre la vista de monitoreo, entonces ve los camiones bajo el umbral crítico de 15 % identificados con el código del equipo, el último nivel disponible y su estado de combustible.
- Escenario alternativo. Dado que el sensor de uno o más camiones no reporta datos o entrega una lectura anómala, cuando el controlador abre la vista de monitoreo, entonces ve esos equipos con el estado «sin señal» y una advertencia de información no confiable o insuficiente, sin que sean mostrados como equipos en condición normal.

## HU-02 · Revisar el historial del camión

Como controlador de flota, quiero consultar el último abastecimiento y las alertas recientes de un camión, para evaluar si la lectura es coherente antes de tomar una decisión operacional.

## HU-03 · Reconocer información inconsistente

Como controlador de flota, quiero reconocer cuándo la información de combustible de un camión es anómala o insuficiente, para evitar decidir su reabastecimiento basándome en una lectura posiblemente incorrecta.

## HU-04 · Asignar la orden de reabastecimiento

Como controlador de flota, quiero asignar la orden de reabastecimiento al operador del camión de combustible indicando el camión y el sector de encuentro, para que el camión se abastezca antes de detenerse sin tener que anotar la orden en papel ni en la planilla Excel compartida.

## HU-05 · Confirmar el cierre del abastecimiento

Como controlador de flota, quiero confirmar el cierre del abastecimiento cuando el operador del camión de combustible me informa que terminó, para que el camión salga de la lista de pendientes y el turno siguiente vea que ya fue abastecido.

Wireframes: ver [docs/wireframes/](wireframes/)

# Gráfico interactivo "Crecimiento" en el panel de docente

## Objetivo

El usuario pidió agregar un gráfico interactivo al panel de docente
("dashboard tipo gráfica, agrégale una, bien interactiva").

## Decisión de datos

No existe ningún endpoint de agregados/series de tiempo en el backend
(confirmado antes de construir nada). Se optó por calcular la serie
100% en el cliente a partir de las mismas listas paginadas que ya usa el
resto del dashboard: `useUsers({ role: "STUDENT" })` y
`useProtectedAreas({})`, pidiendo el máximo permitido por la API
(`limit: 100`, ver `PaginationQueryDto` en el backend) ordenadas por
`createdAt` ascendente, agrupando por mes en el cliente con `date-fns`
(`startOfMonth`/`subMonths`/`format`, mismo patrón de locale `es`/`enUS`
ya usado en `protected-area-card.tsx`).

Se eligió `recharts` porque ya estaba en `package.json` (`^3.9.2`) sin
usarse en ningún lado todavía — no se agregó una dependencia nueva.

## Componente nuevo

`features/dashboard/components/growth-chart.tsx` (nuevo directorio
`features/dashboard/`, no existía): gráfico de barras "Estudiantes
nuevos" vs "Áreas creadas" por mes.

Interactividad:
- **Selector de rango** (6/12 meses) como segmented control clicable.
- **Tooltip** al pasar el mouse por una barra (componente custom,
  estilizado con los tokens de superficie/borde del proyecto — no los
  estilos default de recharts).
- **Leyenda clicable**: click en "Estudiantes nuevos" o "Áreas creadas"
  oculta/muestra esa serie (`hide` en `<Bar>` + estado local `visible`),
  con feedback visual (opacidad reducida en la leyenda de la serie
  oculta).
- Colores de marca vía variables CSS directamente en los props de
  recharts (`fill="var(--accent)"` / `fill="var(--info)"`,
  `stroke="var(--border)"`, etc.) para que el gráfico responda
  automáticamente a tema claro/oscuro sin lógica adicional — mismo
  mecanismo confirmado en la ronda anterior de hover de botones.

Se colocó como primer elemento después de las 4 tarjetas de estadísticas
y antes de "Estudiantes recientes"/"Borradores por publicar", con su
propio `motion.div` de entrada (delay 0.22, antes que las filas de abajo
para mantener el orden de aparición coherente con su posición visual).

## Notas de compatibilidad con recharts v3

recharts v3 tipa el prop `content` de `<Tooltip>` como
`ContentType<ValueType, NameType>` (genéricos amplios, no
`<number, string>`); un componente custom debe tipar sus props con
`TooltipContentProps` (sin especializar los genéricos) y recibirse como
`content={(props) => <CustomTooltip {...props} .../>}` (función), no
como `content={<CustomTooltip .../>}` (elemento) — pasarlo como elemento
falla el type-check porque TS exige que el elemento ya declare todas las
props que recharts inyecta en runtime.

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library`, sin cambios).
- `npm run build`: compila, type-checkea (tras resolver el matiz de tipos
  de `recharts` v3 arriba) y genera todas las páginas sin errores.

# Fix de triggers de modal/diálogo + toggle de estado con confirmación

## Objetivo

En la tabla de Proveedores de IA (y por consistencia también en Usuarios):

1. Quitar el botón "Ver" de la columna de acciones — toda la fila debe ser
   clickeable y llevar al detalle del proveedor.
2. Arreglar el bug reportado: el botón "Editar" no abría el modal de edición
   (click sin ningún efecto).
3. Reemplazar el botón "Desactivar" (de una sola vía) por un switch
   bidireccional (activar/desactivar) que siempre pida confirmación
   (Cancelar/Confirmar) antes de aplicar el cambio.

## Diagnóstico del bug de "Editar"

Se rastreó la cadena `EditProviderModal` → `FormModal` → HeroUI `ModalRoot`
→ React Aria Components `DialogTrigger` → `PressResponder`. El hallazgo
clave: `DialogTrigger` conecta el gesto de click al estado del modal
envolviendo a **todos** sus hijos en un único `PressResponder`, que expone
las props de press (`onPress`, etc.) únicamente vía React Context
(`PressResponderContext`). Ese contexto solo lo consume un elemento
envuelto en `Pressable` (de `react-aria-components`) o un componente propio
de React Aria — nunca un `<button>` nativo pasado directo como hijo.

`FormModal` y `ConfirmDialog` recibían el `trigger` (el `<Button>` de
shadcn, que es un `<button>` nativo sin ninguna integración con React
Aria) y lo pasaban tal cual como hijo crudo de `ModalRoot`/`AlertDialogRoot`
— por eso el click no abría nada. Esto no era exclusivo de "Editar": el
mismo patrón (`trigger` crudo + `FormModal`/`ConfirmDialog`) se usa en
`CreateProviderModal`, `EditUserModal`, `DeactivateProviderButton`,
`DeactivateUserButton`, `RemoveModelButton`, `RemoveBadgeButton`,
`RemoveFlashCardButton`, `UnpublishAreaButton`, etc. Lo que probablemente
enmascaró el problema en `CreateProviderModal` es que ya existían
proveedores de prueba creados antes de que su botón se migrara de HeroUI a
shadcn en una ronda anterior del rediseño — no que ese modal siguiera
funcionando.

## Cambios realizados

- `components/ui/form-modal.tsx` y `components/ui/confirm-dialog.tsx`:
  el `trigger` ahora se envuelve en `<Pressable>` (de `react-aria-components`)
  antes de pasarlo como hijo de `ModalRoot`/`AlertDialogRoot`. `Pressable`
  sí consume `PressResponderContext` y clona esas props sobre el elemento
  real, sin agregar ningún `<div>` extra (a diferencia de `ModalTrigger`/
  `AlertDialogTrigger` de HeroUI). El tipo de `trigger` pasa de `ReactNode`
  a `ReactElement` (un solo elemento, requerido por `Pressable`), con un
  cast documentado porque el tipo de `Pressable` en TS exige un elemento
  DOM nativo aunque en runtime clona cualquier elemento.
- `ConfirmDialog` ahora también acepta `open`/`onOpenChange` para
  controlarse desde afuera sin depender de un `trigger` — necesario para el
  toggle de estado (ver abajo).
- Se propagó el cambio de tipo `ReactNode → ReactElement` en los 4
  componentes que exponían su propio prop `trigger` hacia `FormModal`:
  `CreateProviderModal`, `EditProviderModal`, `EditUserModal`,
  `ModelFormModal`.
- Nuevo `components/ui/status-toggle.tsx`: un `Switch` (shadcn, instalado
  con `npx shadcn add switch`) cuyo `checked` siempre refleja el estado real
  del servidor — nunca cambia de forma optimista. Al accionarlo solo abre
  un `ConfirmDialog` controlado (`open`/`onOpenChange`); el valor visual
  solo se mueve cuando la mutación confirma y la query se invalida.
- `features/ai-providers/components/deactivate-provider-button.tsx` →
  renombrado a `provider-status-toggle.tsx` (`ProviderStatusToggle`):
  reactiva con `useUpdateAIProvider(id).mutate({isActive: true})` (payload
  parcial) y desactiva con el `useDeactivateAIProvider` existente.
- `features/users/components/deactivate-user-button.tsx` → renombrado a
  `user-status-toggle.tsx` (`UserStatusToggle`): el endpoint de Users no
  admite payload parcial, así que reactivar reenvía el objeto completo
  (`name`, `lastName`, `email`, `role`, `isActive: true`) vía
  `useUpdateUser`; desactivar usa el `useDeactivateUser` existente.
- `components/ui/data-table.tsx`: nuevo prop opcional `onRowClick`. La fila
  se vuelve clickeable (`cursor-pointer` + hover) y la celda de la columna
  `id: "actions"` detiene la propagación del click para no disparar también
  la navegación de fila.
- `app/teacher/ai-providers/page.tsx`: se quitó el botón "Ver" (y el
  import de `Eye`), la celda de "Proveedor" ya no es un `<Link>` individual
  (la fila completa navega), y se pasa `onRowClick` a `DataTable` para ir a
  `/teacher/ai-providers/[id]`. La celda de acciones ahora solo tiene
  "Editar" + `ProviderStatusToggle`.
- `app/teacher/users/page.tsx`: la celda de acciones cambia
  `DeactivateUserButton` por `UserStatusToggle` (Users no tiene página de
  detalle propia, así que no se agregó click de fila aquí).
- `app/teacher/ai-providers/[id]/page.tsx`: mismo reemplazo de
  `DeactivateProviderButton` → `ProviderStatusToggle` en la barra de
  acciones del detalle.

## Resultado final

`npm run lint` y `npm run build` pasan sin errores nuevos (los 5 warnings
de `react-hooks/incompatible-library` en formularios con `watch()` de
React Hook Form son preexistentes y no relacionados con este cambio).
Pendiente de confirmación visual con capturas del usuario: que "Editar"
abra el modal correctamente, que el click en cualquier parte de la fila de
Proveedores navegue al detalle, y que el switch de estado pida confirmación
antes de aplicar el cambio en ambas tablas.

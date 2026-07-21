# Avatares por categoría de FlashCard

Coloca aquí los 6 gestos del mascota EcoGuide, **con estos nombres de
archivo exactos** (minúsculas, guiones), en formato PNG:

| Categoría | Archivo |
|---|---|
| WELCOME (saludando) | `welcome.png` |
| GASTRONOMY (señalando hacia arriba) | `gastronomy.png` |
| FLORA_FAUNA (con binoculares) | `flora-fauna.png` |
| ENVIRONMENTAL (pensando, con ? y !) | `environmental.png` |
| CURIOUS_FACT (foco de idea) | `curious-fact.png` |
| VOCABULARY (con el letrero "VOCABULARY") | `vocabulary.png` |

En cuanto un archivo exista con ese nombre, aparece automáticamente en:

- El formulario de crear/editar flashcard (`FlashCardForm`), junto al
  selector de categoría.
- La tabla de listado de flashcards del maestro, junto a cada categoría.

No se necesita ningún cambio de código adicional — `FlashCardAvatar`
(`features/flash-cards/components/flash-card-avatar.tsx`) ya apunta a estas
rutas y se oculta sin romper nada mientras el archivo no exista.

Este archivo README puede borrarse una vez que las 6 imágenes estén aquí.

# HTML → Divi mapping

## Objetivo

Convertir HTML en una estructura editable dentro de Divi, evitando meter todo dentro de un único módulo Code.

## Reglas actuales

| Entrada HTML | Salida Divi |
|---|---|
| `section` | `et_pb_section` |
| bloque contenedor | `et_pb_row` |
| `h1`, `h2`, `h3`, `p`, `ul`, `ol`, `blockquote` | `et_pb_text` |
| `a.btn`, `.button`, `.cta`, `role=button` | `et_pb_button` |
| `img` | `et_pb_image` |
| `.card`, `.feature`, `.service`, `.benefit` | `et_pb_blurb` |
| estructura compleja no reconocida | `et_pb_code` |

## Principio de calidad

Priorizar módulos nativos de Divi cuando el HTML sea claro. Usar `Code Module` solo cuando intentar convertir pueda romper el diseño.

## Limitaciones actuales

- No interpreta CSS avanzado como grid complejo, animaciones o estados hover con precisión total.
- No descarga assets externos.
- No genera aún schema oficial Divi 5 final.
- No sustituye revisión visual después de importar.

## Siguiente mejora

Añadir presets:

- `hero`
- `features`
- `pricing`
- `faq`
- `testimonials`
- `contact`

Y mapear cada preset a módulos Divi nativos con estilos base.

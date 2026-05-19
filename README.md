# Divi Manager

Pipeline para convertir diseños HTML en estructuras reutilizables para Divi.

No es un conversor mágico HTML → Divi perfecto. Convierte HTML real en una base editable: estructura, contenido y estilos separados.

## Qué hace

- Lee archivos `.html` desde una carpeta.
- Detecta secciones, textos, botones, imágenes, columnas y cards.
- Genera shortcodes compatibles con Divi Builder clásico / Divi 4.
- Genera un JSON intermedio preparado para mapear después a Divi 5.
- Extrae CSS básico.
- Mantiene bloques complejos como módulo `Code` para no romper diseño.

## Uso

```bash
npm install
npm run convert
```

Convertir carpeta propia:

```bash
node src/cli.js convert ./input-html ./dist
```

## Salidas

Por cada HTML genera:

- `*.divi-shortcodes.txt`
- `*.layout.json`
- `*.css`

## Mapeo inicial

| HTML | Divi |
|---|---|
| `<section>` | Section |
| contenedor | Row |
| `h1/h2/h3/p` | Text Module |
| enlace tipo botón | Button Module |
| `<img>` | Image Module |
| cards | Blurb / Text group |
| bloque no reconocido | Code Module |

## Repos base investigados

- `oaris-dev/diviops`: automatización Divi 5 desde WordPress.
- `Elathi/Divi-5-Manager`: layouts JSON Divi 5.
- `Automattic/divi-migration-tools`: referencia de shortcodes Divi.
- `chubes4/html-to-blocks-converter`: referencia de parsing HTML → bloques.
- `cjsimon2/Divi5-ToolKit`: CSS, responsive y compatibilidad Divi 5.

## Estado

Versión inicial operativa. La salida Divi 4 por shortcodes es estable. El JSON es intermedio, no schema oficial definitivo de Divi 5.

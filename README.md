# Divi Manager

Herramienta local y estática para Divi 4 con dos únicas funciones:

1. **HTML → JSON Divi 4 nativo editable**: reconstruye el HTML como `et_pb_section > et_pb_row > et_pb_column > módulos nativos`, con estilos responsive de desktop, tablet y móvil. El flujo HTML no usa `et_pb_code`.
2. **Reparar JSON Divi 4**: conserva el layout existente y corrige responsive, anchos problemáticos, imágenes y fallos CSS comunes.

## Uso

Abrir `index.html` en un servidor estático o desplegar el repositorio en GitHub Pages/hosting estático.

Todo el procesamiento se realiza en el navegador. No existe backend ni dependencia de Convex.

## Base Divi 4

La lógica se ha construido a partir del conocimiento operativo y patrones reales del pack de referencia del proyecto: 1.320 secciones Divi, layouts reales y documentación de Divi 4. La regla de salida para páginas es `context: et_builder` y se priorizan módulos nativos editables.

## Validación

```bash
npm run check
```

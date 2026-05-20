/* Mantiene intacta la conversión, pero la vista previa generada usa el HTML original exacto. */
(function(){
  const previousConvertHtml = window.convertHtml;
  if (typeof previousConvertHtml !== 'function') return;
  window.convertHtml = function(html, mode){
    const result = previousConvertHtml(html, mode);
    result.previewHtml = html;
    result.original = result.original || {};
    result.original.previewHtml = html;
    result.original.html = html;
    return result;
  };
})();

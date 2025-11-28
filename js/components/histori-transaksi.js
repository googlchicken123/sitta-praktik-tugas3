(function(global) {
  function createHistoriComponent(template) {
    return {
      template: template,
      mounted() {
        // optional future logic
      }
    };
  }

  global.createHistoriComponent = createHistoriComponent;

})(window);

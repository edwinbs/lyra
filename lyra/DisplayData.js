define([
  "dojo/_base/declare"
], function(declare) {

  return declare(null, {
    // Slide template and contents
    foreground: null,

    // Background video/image
    background: null,

    constructor: function(args) {
      declare.safeMixin(this, args);
    }
    
  });

});

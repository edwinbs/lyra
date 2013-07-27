define([
  "dojo/_base/declare"
], function(declare) {

  return declare(null, {

    // HTML string with placeholders
    template: null,

    // Map of placeholder name to text/image content
    contents: null,

    // Background video/image
    background: null,

    constructor: function(args) {
      declare.safeMixin(this, args);
    }
    
  });

});

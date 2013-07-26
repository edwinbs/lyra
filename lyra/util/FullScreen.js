define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/on"
], function(
  declare,
  lang,
  on
) {

  var FullScreenUtil = declare(null, {

    onFullScreenStart: null,

    onFullScreenEnd: null,

    enter: function() {
      docElm = document.documentElement;
      requestFullScreen = docElm.requestFullScreen || 
                          docElm.mozRequestFullScreen ||
                          docElm.webkitRequestFullScreen;
      requestFullScreen.call(docElm);
    },

    onFullScreenChange: function() {
      console.log("full screen change");

      if ( document.fullscreenElement || 
           document.webkitFullscreenElement ||
           document.mozFullScreenElement ) {
        this.onFullScreenStart();
      } else {
        this.onFullScreenEnd();
      }
    },

    constructor: function(args) {
      declare.safeMixin(this, args);

      on(document, 
        "webkitfullscreenchange, mozfullscreenchange, fullscreenchange", 
        lang.hitch(this, this.onFullScreenChange));
    }

  });

  return new FullScreenUtil();

});

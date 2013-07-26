define([
    "dojo/parser",
    "dijit/registry",
    "dojo/on"
], function(parser, registry, on) {

    var startup = function() {
        parser.parse().then(function() {
            // Set the global variable that will be queried by parent window.
            g_screen_widget = registry.byId("screen");

            var event = document.createEvent("HTMLEvents");
            event.initEvent("parsed", false, true);
            window.dispatchEvent(event);
        });
    };

    return {
      init: function() {
        startup();
      }
    };
});

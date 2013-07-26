define(["dojo/dom",
		    "dojo/dom-style"],
  function(dom,
        domStyle)
{
  var domUtil = {

    hide: function(domId) {
      domStyle.set(dom.byId(domId), "display", "none"); 
    },

    show: function(domId) {
      domStyle.set(dom.byId(domId), "display", "");
    }

  };

  return domUtil;
});
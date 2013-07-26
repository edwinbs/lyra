define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/window",
  "dojo/dom-style",
  "dojo/on",
  "dojo/window",
  "dojo/number"
], function(
  declare,
  lang,
  baseWin,
  domStyle,
  on,
  win,
  number
) {

  return declare(null, {

    baseWidthPx: 1024,

    isActive: false,

    activate: function() {
      isActive = true;
      this.rescaleEm();
    },

    deactivate: function() {
      isActive = false;
      domStyle.set(baseWin.body(), "font-size", '100%');
    },

    rescaleEm: function() {
      console.log("rescale");

      if (isActive) {
        //Firefox cannot take arbitrary precision number in CSS, round to 2 decimal places.
        ratio = number.round(win.getBox().w * 100 / 1024, 2);
        console.log('[rescale] ratio: ' + ratio + '%');
        domStyle.set(baseWin.body(), "fontSize", ratio + '%');
      }
    },

    constructor: function(args) {
      on(window, "resize", lang.hitch(this, this.rescaleEm));
    }

  });

});
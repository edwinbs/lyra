define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/on",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dojo/text!lyra/widget/templates/ScreenControl.html"
], function(
  declare,
  lang,
  on,
  _WidgetBase,
  _TemplatedMixin,
  template
) {

  return declare("lyra.widget.ScreenControl", [_WidgetBase, _TemplatedMixin], {

    templateString: template,

    displayData: null,

    createScreen: function(event) {
      var screenWindow = window.open("screen/",
        "screen_window",
        "toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=400,height=300");

      var myOnScreenWindowParsed = lang.hitch(this, this.onScreenWindowParsed);

      on(screenWindow, "parsed", function(event) {
        myOnScreenWindowParsed(screenWindow);
      });
    },

    clearText: function(event) {
      this.displayData.set("foreground", null);
    },

    clearBackground: function(event) {
      this.displayData.set("background", null);
    },

    clearAll: function(event) {
      this.clearText(event);
      this.clearBackground(event);
    },

    onScreenWindowParsed: function(screenWindow) {
      screenWindow.get_screen_widget().setDisplayData(this.displayData);
    },

    setDisplayDataRef: function(displayData) {
      this.displayData = displayData;
    },

    startup: function() {
    }

  });

});

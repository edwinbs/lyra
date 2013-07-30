define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/dom",
  "dojo/on",
  "dojo/parser",
  "dojo/Stateful",
  "dijit/registry",
  "lyra/DisplayData"
], function(
  declare,
  lang,
  dom,
  on,
  parser,
  Stateful,
  registry,
  DisplayData)
{
  return {
    displayData: null,

    activeSong: null,

    startup: function() {
      this.activeSong = new Stateful();
      this.displayData = new Stateful(new DisplayData());

      var myInitUi = lang.hitch(this, this.initUi);
      parser.parse().then(function() { myInitUi(); });
    },

    initLibrary: function() {
      var songLibraryWidget = registry.byId("library");
      songLibraryWidget.setActiveSongRef(this.activeSong);
    },

    initPreviewWindow: function() {
      var previewWindow = dom.byId("preview").contentWindow;
      var myOnScreenParsed = lang.hitch(this, this.onScreenParsed);
      on(previewWindow, "parsed", function(event) { myOnScreenParsed(previewWindow, true); });
    },

    initSlideControl: function() {
      var slideControlWidget = registry.byId("slide-control");
      slideControlWidget.watchSongModel(this.activeSong);
      slideControlWidget.setDisplayDataRef(this.displayData);
    },

    initBackgroundLibrary: function() {
      var backgroundLibraryWidget = registry.byId("page-right"); //TODO
      backgroundLibraryWidget.setDisplayDataRef(this.displayData);
    },

    initScreenControl: function() {
      var screenControlWidget = registry.byId("screen-control");
      screenControlWidget.setDisplayDataRef(this.displayData);
    },

    initLanguageControl: function() {
      var languageControlWidget = registry.byId("language-control");
      languageControlWidget.setActiveSongRef(this.activeSong);
    },

    initUi: function() {
      this.initLibrary();
      this.initSlideControl();
      this.initBackgroundLibrary();
      this.initPreviewWindow();
      this.initScreenControl();
      this.initLanguageControl();
    },

    onScreenParsed: function(screenWindow, shouldActivate) {
      console.log("screen parsed");

      var screenWidget = screenWindow.get_screen_widget();
      screenWidget.setDisplayData(this.displayData);

      if (shouldActivate) {
        screenWidget.activate();
      }
    },

    init: function() {
      this.startup();
    }
  };
 
});
define([
  "dojo/_base/declare",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/on",
  "dojo/parser",
  "dojo/request",
  "dojo/Stateful",
  "dijit/registry",
  "dijit/form/ToggleButton",
  "put-selector/put",
  "lyra/DisplayData"
], function(
  declare,
  arrayUtil,
  lang,
  dom,
  domConstruct,
  on,
  parser,
  request,
  Stateful,
  registry,
  ToggleButton,
  put,
  DisplayData)
{
  return {
    displayData: null,

    activeSong: null,

    startup: function() {
      this.activeSong = new Stateful();
      this.displayData = new Stateful(new DisplayData());

      var myUpdateLayoutControls = lang.hitch(this, this.updateLayoutControls);
      this.activeSong.watch("songData", function(name, oldValue, newValue) {
        myUpdateLayoutControls(newValue.languages);
      });

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

    initUi: function() {
      this.initLibrary();
      this.initSlideControl();
      this.initBackgroundLibrary();
      this.initPreviewWindow();
      this.initScreenControl();
    },

    onScreenParsed: function(screenWindow, shouldActivate) {
      console.log("screen parsed");

      var screenWidget = screenWindow.get_screen_widget();
      screenWidget.setDisplayData(this.displayData);

      if (shouldActivate) {
        screenWidget.activate();
      }
    },

    onActiveLangChange: function(lang, val) {
      console.log("active lang change: " + lang + " active: " + val);
      var selectedLangs = this.activeSong.get("selectedLangs");
      if (val) {
        selectedLangs.push(lang);
      } else {
        selectedLangs = arrayUtil.filter(selectedLangs, function(item) { return item != lang; });
      }
      this.activeSong.set("selectedLangs", selectedLangs);
    },

    updateLayoutControls: function(languages) {
      var layoutControlsNode = dom.byId("layout-controls");
      domConstruct.empty(layoutControlsNode);
      var selectedLangs = [];

      var _onActiveLangChange = lang.hitch(this, this.onActiveLangChange);

      arrayUtil.forEach(languages, function(lang) {
        langToggle = new ToggleButton({
          checked: true,
          iconClass: "dijitCheckBoxIcon",
          label: lang,
          onChange: function(val) { _onActiveLangChange(this.label, val); }
        });
        langToggle.placeAt(layoutControlsNode);
        selectedLangs.push(lang);
      });

      this.activeSong.set("selectedLangs", selectedLangs);
    },

    init: function() {
      this.startup();
    }
  };
 
});
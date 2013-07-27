define([
  "dojo/_base/declare",
  "dojo/parser",
  "dojo/on",
  "dojo/store/JsonRest",
  "dojo/store/Memory",
  "dojo/store/Cache",
  "dijit/registry",
  "dojo/request",
  "dojo/_base/array",
  "dojo/dom",
  "dgrid/OnDemandList",
  "dgrid/Selection",
  "put-selector/put",
  "dojo/dom-construct",
  "dijit/form/ToggleButton",
  "dojo/_base/lang",
  "lyra/DisplayData",
  "lyra/BackgroundData",
  "lyra/VideoSourceData",
  "dojo/Stateful"
], function(
  declare,
  parser,
  on,
  JsonRest,
  Memory,
  Cache,
  registry,
  request,
  arrayUtil,
  dom,
  OnDemandList,
  Selection,
  put,
  domConstruct,
  ToggleButton,
  lang,
  DisplayData,
  BackgroundData,
  VideoSourceData,
  Stateful)
{
  var songsStore = null,
  libraryList = null,
  backgroundsStore = null,
  backgroundList = null,
  screenWidgets = [],
  displayData = null,
  activeSong = null,

  startup = function() {
    songsStore = new Cache(new JsonRest({ target: "songs/" }), new Memory({ }));
    backgroundsStore = new Cache(new JsonRest({ target: "backgrounds/" }), new Memory({ }));
    slidesStore = new Memory({ });

    this.activeSong = new Stateful();
    this.displayData = new Stateful(new DisplayData());

    initUi();
  },

  initBackgroundList = function() {
    backgroundList = new (declare([OnDemandList, Selection]))({
      selectionMode: 'single',
      renderRow: function(object, options) {
          return put("div", object.title);
      },
      store: backgroundsStore
    }, "backgrounds-items");

    on(backgroundList, "dgrid-select", function(event) {
      onSetBackgroundVideo(event.rows[0].data);
    });

    backgroundList.startup();
  },

  initLibrary = function() {
    libraryList = new (declare([OnDemandList, Selection]))({
      selectionMode: 'single',
      renderRow: function(object, options) {
        return put("div", object.title);
      },
      store: songsStore
    }, "library-items");

    on(libraryList, "dgrid-select", function(event) {
      loadSong(event.rows[0].data.id);
    });

    libraryList.startup();
  },

  initPreviewWindow = function() {
    previewWindow = dom.byId("preview").contentWindow;
    on(previewWindow, "parsed", function(event) { onScreenParsed(previewWindow, true); });
  },

  initSlideControl = function() {
    var slideControlWidget = registry.byId("slide-control");
    slideControlWidget.watchSongModel(this.activeSong);
    slideControlWidget.setDisplayDataRef(this.displayData);
  },

  initUi = function() {
    parser.parse().then(function() {
      initPreviewWindow();
      initLibrary();
      initBackgroundList();
      initSlideControl();

      on(dom.byId("create-screen"), "click", function(event) { onCreateScreenClick(); });
      on(dom.byId("clear-text"), "click", function(event) { onClearTextClick(); });
      on(dom.byId("clear-background"), "click", function(event) { onClearBackgroundClick(); });
      on(dom.byId("clear-all"), "click", function(event) { onClearAllClick(); });
    });
  };

  onCreateScreenClick = function() {
    screenWindow = window.open("screen/", "screen_window", "toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=400,height=300");
    on(screenWindow, "parsed", function(event) { onScreenParsed(screenWindow, false); });
  };

  onScreenParsed = function(screenWindow, shouldActivate) {
    var screenWidget = screenWindow.get_screen_widget();
    screenWidget.setDisplayData(this.displayData);
    screenWidgets.push(screenWidget);

    if (shouldActivate) {
      screenWidget.activate();
    }
  };

  onSetBackgroundVideo = function(videoInfo) {
    mp4VideoSource = new VideoSourceData({
      mimeType: "video/mp4",
      src: videoInfo.mp4Filename
    });

    webmVideoSource = new VideoSourceData({
      mimeType: "video/webm",
      src: videoInfo.webmFilename
    });

    backgroundData = new BackgroundData({
      type: "video",
      videoSources: [mp4VideoSource, webmVideoSource]
    });

    this.displayData.set("background", backgroundData);
  };

  onActiveLangChange = function(lang, val) {
    console.log("active lang change: " + lang + " active: " + val);
    var selectedLangs = this.activeSong.get("selectedLangs");
    if (val) {
      selectedLangs.push(lang);
    } else {
      selectedLangs = arrayUtil.filter(selectedLangs, function(item) { return item != lang; });
    }
    this.activeSong.set("selectedLangs", selectedLangs);
  };

  updateLayoutControls = function(languages) {
    layoutControlsNode = dom.byId("layout-controls");
    domConstruct.empty(layoutControlsNode);
    selectedLangs = [];

    _onActiveLangChange = lang.hitch(this, this.onActiveLangChange);

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
  };

  onClearBackgroundClick = function(event) {
    this.displayData.set("background", null);
  };

  onClearTextClick = function(event) {
    this.displayData.set("contents", null);
  };

  onClearAllClick = function(event) {
    this.displayData.set("background", null);
    this.displayData.set("contents", null);
  };

  loadSong = function(songId) {
    request.get("songs/" + songId + "/", {
      handleAs: "json"
    }).then(function(songData) {
      updateLayoutControls(songData.languages);
      this.activeSong.set("songData", songData);
    });
  };

  return {
    init: function() {
      startup();
    }
  };
 
});
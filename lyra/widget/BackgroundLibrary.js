define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/store/JsonRest",
  "dojo/store/Memory",
  "dojo/store/Cache",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dgrid/OnDemandList",
  "dgrid/Selection",
  "put-selector/put",
  "lyra/BackgroundData",
  "lyra/VideoSourceData",
  "dojo/text!lyra/widget/templates/BackgroundLibrary.html"
], function(
  declare,
  lang,
  on,
  JsonRest,
  Memory,
  Cache,
  _WidgetBase,
  _TemplatedMixin,
  OnDemandList,
  Selection,
  put,
  BackgroundData,
  VideoSourceData,
  template
) {

  return declare("lyra.widget.BackgroundLibrary", [_WidgetBase, _TemplatedMixin], {

    templateString: template,

    backgroundStore: null,

    backgroundList: null,

    displayData: null,

    initUI: function() {
      this.backgroundList = new (declare([OnDemandList, Selection]))({
        selectionMode: 'single',
        renderRow: function(object, options) {
            return put("div.collection-item", object.title);
        },
        store: this.backgroundsStore
      }, "backgrounds-items");

      var myOnSetBackgroundVideo = lang.hitch(this, this.onSetBackgroundVideo);

      on(this.backgroundList, "dgrid-select", function(event) {
        myOnSetBackgroundVideo(event.rows[0].data);
      });

      this.backgroundList.startup();
    },

    onSetBackgroundVideo: function(videoInfo) {
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
    },

    setDisplayDataRef: function(displayData) {
      this.displayData = displayData;

      var myOnBackgroundChange = lang.hitch(this, this.onBackgroundChange);
      this.displayData.watch("background", function(name, oldValue, newValue) {
        myOnBackgroundChange(newValue);
      });
    },

    onBackgroundChange: function(newBackground) {
      if (!newBackground) {
        this.backgroundList.clearSelection();
      }
    },

    startup: function() {
      this.backgroundsStore = new Cache(new JsonRest({ target: "backgrounds/" }), new Memory({ }));
      this.initUI();
    }

  });

});
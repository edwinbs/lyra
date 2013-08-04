define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/request",
  "dojo/store/JsonRest",
  "dojo/store/Memory",
  "dojo/store/Cache",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dgrid/OnDemandList",
  "dgrid/Selection",
  "put-selector/put",
  "dojo/text!lyra/widget/templates/SongLibrary.html"
], function(
  declare,
  lang,
  on,
  request,
  JsonRest,
  Memory,
  Cache,
  _WidgetBase,
  _TemplatedMixin,
  OnDemandList,
  Selection,
  put,
  template
) {

  return declare("lyra.widget.SongLibrary", [_WidgetBase, _TemplatedMixin], {

    templateString: template,

    songsStore: null,

    libraryList: null,

    activeSong: null,

    initUI: function() {
      this.libraryList = new (declare([OnDemandList, Selection]))({
        selectionMode: 'single',
        renderRow: function(object, options) {
          return put("div.collection-item", object.title);
        },
        store: this.songsStore
      }, "library-items");

      var myLoadSong = lang.hitch(this, this.loadSong);

      on(this.libraryList, "dgrid-select", function(event) {
        console.log("dgrid select");
        myLoadSong(event.rows[0].data.id);
      });

      this.libraryList.startup();
    },

    loadSong: function(songId) {
      var mySetSongData = lang.hitch(this, this.setSongData);

      request.get("songs/" + songId + "/", {
        handleAs: "json"
      }).then(function(songData) {
        mySetSongData(songData);
      });
    },

    setSongData: function(songData) {
      console.log("setSongData");
      this.activeSong.set("songData", songData);
    },

    setActiveSongRef: function(activeSong) {
      this.activeSong = activeSong;
    },

    startup: function() {
      this.songsStore = new Cache(new JsonRest({ target: "songs/" }), new Memory({ }));
      this.initUI();
    }

  });
});

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
    "dojo/_base/lang"
], function(declare, parser, on, JsonRest, Memory, Cache, registry, request, arrayUtil, dom, OnDemandList, Selection, put, domConstruct, ToggleButton, lang) {
    var songsStore = null,
    libraryList = null,
    slidesStore = null,
    slidesList = null,
    backgroundsStore = null,
    backgroundList = null,
    screenWidgets = [],
    selectedLangs = [],
    activeSong = null,
    maxLinesPerSlide = 4;

    startup = function() {
      songsStore = new Cache(new JsonRest({ target: "songs/" }), new Memory({ }));
      backgroundsStore = new Cache(new JsonRest({ target: "backgrounds/" }), new Memory({ }));
      slidesStore = new Memory({ });

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
        console.log("background: " + event.rows[0].data.id);
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

    initSlideControls = function() {
      slidesList = new (declare([OnDemandList, Selection]))({
        selectionMode: 'single',
        renderRow: function(object, options) {
          var div = put("div.slide");
          if (object.type == "content") {
            arrayUtil.forEach(object.content, function(line) {
              div.innerHTML += '<p class="slide-line">' + line + '</p>';
            });
          } else if (object.type == "separator") {
            div.innerHTML = '<p class="slide-separator">' + object.content + '</p>';
          }
          return div;
        },
        allowSelect: function(row) { return row.data.type !== "separator"; },
        store: slidesStore
      }, "slides");

      on(slidesList, "dgrid-select", function(event) {
        console.log(event.rows[0].data.content);

        arrayUtil.forEach(screenWidgets, function(s) {
          s.setForegroundText(event.rows[0].data.content);
        });
      });

      slidesList.startup();
    },

    initPreviewWindow = function() {
      previewWindow = dom.byId("preview").contentWindow;
      on(previewWindow, "parsed", function(event) {
        previewWindowScreenWidget = previewWindow.get_screen_widget();
        screenWidgets.push(previewWindowScreenWidget);
        previewWindowScreenWidget.activate();
      });
    },

    initUi = function() {
      parser.parse().then(function() {
        initPreviewWindow();
        initLibrary();
        initBackgroundList();
        initSlideControls();

        on(dom.byId("create-screen"), "click", function(event) {
          screenWindow = window.open("screen/", "screen_window", "toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=400,height=300");
          on (screenWindow, "parsed", function(event) {
            screenWidgets.push(screenWindow.get_screen_widget());
          });
        });

        on(dom.byId("clear-text"), "click", function(event) { onClearTextClick(); });
        on(dom.byId("clear-background"), "click", function(event) { onClearBackgroundClick(); });
        on(dom.byId("clear-all"), "click", function(event) { onClearAllClick(); });
      });
    };

    loadSong = function(songId) {
      console.log("Load song: " + songId);
      request.get("songs/" + songId + "/", {
        handleAs: "json"
      }).then(function(songData) {
        this.activeSong = songData;
        updateLayoutControls(this.activeSong.languages);
        reconstructSlides(4);
      });
    };

    reconstructSlides = function(maxLinesPerLang) {
      slidesStore = new Memory({ });
      constructSlides(maxLinesPerLang);
      slidesList.setStore(slidesStore);
    };

    constructSlides = function(maxLinesPerLang) {
      nextSlide = { };
      count = 0;
      nextSlideId = 1;

      activeLangs = selectedLangs;
      activeLangs.filter(function(lang) {
        if (this.activeSong.languages.indexOf(lang) == -1)
          return false;
        return true;
      });

      arrayUtil.forEach(activeLangs, function(lang) {
        nextSlide[lang] = [];
      });

      arrayUtil.forEach(this.activeSong.verses, function (verse) {
        sepSlide = { };
        sepSlide.id = nextSlideId++;
        sepSlide.type = "separator";
        sepSlide.content = verse.label;
        slidesStore.add(sepSlide);

        arrayUtil.forEach(verse.lyrics, function (lyric) {
          arrayUtil.forEach(activeLangs, function (lang) {
            nextSlide[lang].push(lyric[lang]);
            ++count;
          });

          if (count >= maxLinesPerSlide)
            flushToSlide(activeLangs, nextSlide, nextSlideId++);
        });

        if (count > 0)
          flushToSlide(activeLangs, nextSlide, nextSlideId++);
      });      
    };

    flushToSlide = function(activeLangs, nextSlide, id) {
      content = [];
      arrayUtil.forEach(activeLangs, function(lang, i) {
        arrayUtil.forEach(nextSlide[lang], function( line ) {
          content.push(line);
        });
        nextSlide[lang] = [];
      });
      count = 0;

      newSlide = { };
      newSlide.id = id;
      newSlide.type = "content";
      newSlide.content = content;
      slidesStore.add(newSlide);

      console.log(content);
    };

    onSetBackgroundVideo = function(videoInfo) {
      arrayUtil.forEach(screenWidgets, function(s) {
        s.setBackgroundVideo(videoInfo.mp4Filename, videoInfo.webmFilename);
      });
    };

    onActiveLangChange = function(lang, val) {
      console.log("active lang change: " + lang + " active: " + val);
      if (val) {
        selectedLangs.push(lang);
      } else {
        selectedLangs = arrayUtil.filter(selectedLangs, function(item) { return item != lang; });
      }
      reconstructSlides();
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
    };

    onClearBackgroundClick = function(event) {
      arrayUtil.forEach(screenWidgets, function(sw) {
        sw.clearBackground();
      });
    };

    onClearTextClick = function(event) {
      arrayUtil.forEach(screenWidgets, function(sw) {
        sw.clearText();
      });
    };

    onClearAllClick = function(event) {
      arrayUtil.forEach(screenWidgets, function(sw) {
        sw.clearAll();
      });
    };

    return {
      init: function() {
        startup();
      }
    };
 
});
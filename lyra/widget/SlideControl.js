define([
  "dojo/_base/declare",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/request",
  "dojo/store/Memory",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dgrid/OnDemandList",
  "dgrid/Selection",
  "put-selector/put",
  "dojo/text!lyra/widget/templates/SlideControl.html"
], function(
  declare,
  arrayUtil,
  lang,
  on,
  request,
  Memory,
  _WidgetBase,
  _TemplatedMixin,
  OnDemandList,
  Selection,
  put,
  template
) {

  return declare("lyra.widget.SlideControlController", [_WidgetBase, _TemplatedMixin], {

    templateString: template,

    slidesStore: null,

    slidesList: null,

    displayData: null,

    activeSong: null,

    selectedLangs: null,

    initUI: function() {
      this.slidesList = new (declare([OnDemandList, Selection]))({
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
        store: this.slidesStore
      }, "slides");

      var myOnSlideSelectionChange = lang.hitch(this, this.onSlideSelectionChange);

      on(this.slidesList, "dgrid-select", function(event) {
        myOnSlideSelectionChange(event.rows[0].data.content);
      });

      this.slidesList.startup();
    },

    watchSongModel: function(songModel) {
      var myUpdateSlideList = lang.hitch(this, this.updateSlideList);
      songModel.watch(myUpdateSlideList);
    },

    updateSlideList: function(name, oldValue, newValue) {
      if (name == "songData") {
        this.activeSong = newValue;
      } else if (name == "selectedLangs") {
        this.selectedLangs = newValue;
      }
      
      if (this.activeSong && this.selectedLangs)
        this.reconstructSlides();
    },

    reconstructSlides: function() {
      console.log(this.selectedLangs);

      this.slidesStore = new Memory({ });
      this.constructSlides(this.activeSong, this.selectedLangs, this.slidesStore);
      this.slidesList.setStore(this.slidesStore);
    },

    constructSlides: function(activeSong, selectedLangs, slidesStore) {
      nextSlide = { };
      count = 0;
      nextSlideId = 1;

      activeLangs = selectedLangs;
      activeLangs.filter(function(lang) {
        if (activeSong.languages.indexOf(lang) == -1)
          return false;
        return true;
      });

      arrayUtil.forEach(activeLangs, function(lang) {
        nextSlide[lang] = [];
      });

      arrayUtil.forEach(activeSong.verses, function (verse) {
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

          if (count >= 4) //TODO: maxLinesPerSlide
            flushToSlide(slidesStore, activeLangs, nextSlide, nextSlideId++);
        });

        if (count > 0)
          flushToSlide(slidesStore, activeLangs, nextSlide, nextSlideId++);
      });

      function flushToSlide(slidesStore, activeLangs, nextSlide, id) {
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
    },

    setDisplayDataRef: function(displayData) {
      this.displayData = displayData;
    },

    onSlideSelectionChange: function(slideContents) {
      this.displayData.set("contents", slideContents);
    },

    startup: function() {
      this.inherited(arguments);
      this.initUI();
    }
  
  });

});
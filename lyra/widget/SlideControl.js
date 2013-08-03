define([
  "dojo/_base/declare",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/request",
  "dojo/string",
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
  stringUtil,
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

    templateStore: null,

    initUI: function() {
      this.slidesList = new (declare([OnDemandList, Selection]))({
        selectionMode: 'single',
        renderRow: function(object, options) {
          var div = put("div.slide");
          if (object.type == "song" || object.type == "section") {
            for (var lang in object.content) {
              arrayUtil.forEach(object.content[lang], function(line) {
                div.innerHTML += '<p class="slide-line">' + line + '</p>';
              });
            }
          }
          else if (object.type == "separator") {
            div.innerHTML = '<p class="slide-separator">' + object.content + '</p>';
          }
          return div;
        },
        allowSelect: function(row) { return row.data.type !== "separator"; },
        store: this.slidesStore
      }, "slides");

      var myOnSlideSelectionChange = lang.hitch(this, this.onSlideSelectionChange);

      on(this.slidesList, "dgrid-select", function(event) {
        myOnSlideSelectionChange(event.rows[0].data);
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

      //Create title slide
      titleSlideContent = { };
      arrayUtil.forEach(activeLangs, function(lang) {
        titleSlideContent[lang] = [activeSong.title[lang]];
      });
      titleSlide = { };
      titleSlide.id = nextSlideId++;
      titleSlide.type = "section";
      titleSlide.content = titleSlideContent;
      slidesStore.add(titleSlide);

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
        content = { };
        arrayUtil.forEach(activeLangs, function(lang, i) {
          content[lang] = [];
          arrayUtil.forEach(nextSlide[lang], function( line ) {
            content[lang].push(line);
          });
          nextSlide[lang] = [];
        });
        count = 0;

        newSlide = { };
        newSlide.id = id;
        newSlide.type = "song";
        newSlide.content = content;
        slidesStore.add(newSlide);
      };
    },

    setDisplayDataRef: function(displayData) {
      this.displayData = displayData;

      var myOnDisplayDataChange = lang.hitch(this, this.onDisplayDataChange);
      this.displayData.watch("foreground", function(name, oldValue, newValue) {
        myOnDisplayDataChange(newValue);
      })
    },

    onDisplayDataChange: function(newContents) {
      if (!newContents) {
        this.slidesList.clearSelection();
      }
    },

    onSlideSelectionChange: function(slide) {
      if (!slide) return;
      
      //Pick a template for display
      var slideTemplate = this._templateForSlide(slide);

      var contentMap = { };
      var usedPlaceholders = [];

      for (language in slide.content) {
        //Construct the text for this language
        var placeholderContent = "";
        arrayUtil.forEach(slide.content[language], function(line) {
          placeholderContent += '<p>' + line + '</p>';
        });

        //Find a placeholder
        arrayUtil.some(slideTemplate.placeholders, function(placeholder) {
          if (placeholder.accept_language.indexOf(language) != -1 &&
                usedPlaceholders.indexOf(placeholder) == -1) {
            contentMap[placeholder.label] = placeholderContent;
            usedPlaceholders.push(placeholder);
            return true;
          }
          return false;
        });
      }

      var mySetDisplayDataForeground = lang.hitch(this, this._setDisplayDataForeground);

      request.get(slideTemplate.templateUrl, {
        handleAs: "text"
      }).then(function(templateHtml) {
        var foregroundData = { };
        foregroundData["templateHtml"] = templateHtml;
        foregroundData["contentMap"] = contentMap;
        console.log(foregroundData);

        mySetDisplayDataForeground(foregroundData);
      });
    },

    _setDisplayDataForeground: function(newForegroundData) {
      this.displayData.set("foreground", newForegroundData);
    },

    _templateForSlide: function(slide) {
      var matchingTemplates = this.templateStore.query(function(slideTemplate) {
        //Check the template type (song/section/...)
        if (slideTemplate.type != slide.type)
          return false;

        //Check if the required placeholder count matches
        if (slideTemplate.placeholders.length != Object.keys(slide.content).length)
          return false;

        //Check if the contents can be assigned to the placeholders
        var usedPlaceholders = [];
        for (language in slide.content) {
          
          if (!arrayUtil.some(slideTemplate.placeholders, function(placeholder) {
                if (placeholder.accept_language.indexOf(language) != -1 && 
                    usedPlaceholders.indexOf(placeholder) == -1) {
                  usedPlaceholders.push(placeholder);
                  return true;
                }
                return false;
              })
            ) {
            return false;
          }
        }

        return true;
      });

      if (matchingTemplates.length == 0) {
        console.log("No matching template.");
        return null;
      }
      else if (matchingTemplates.length > 1) {
        console.log("Warning: there are " + matchingTemplates.length + " matching templates.");
        console.log(matchingTemplates);
      }

      return matchingTemplates[0];
    },

    startup: function() {
      this.inherited(arguments);
      this.initUI();
      this.loadSlideTemplates();
    },

    loadSlideTemplates: function() {
      //TODO: when there is a back end, use JsonRest store with cache.
      //It can't be done now because JsonRest cannot be queried without a proper back end.

      var myInitTemplateStore = lang.hitch(this, this.initTemplateStore);

      request.get("templates/", {
        handleAs: "json"
      }).then(function(templateList) {
        myInitTemplateStore(templateList);
      });
    },

    initTemplateStore: function(templateList) {
      this.templateStore = new Memory({data: templateList});
    }
  
  });

});
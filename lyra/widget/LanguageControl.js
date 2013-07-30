define([
  "dojo/_base/declare",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/on",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/form/ToggleButton",
  "dojo/text!lyra/widget/templates/LanguageControl.html"
], function(
  declare,
  arrayUtil,
  lang,
  dom,
  domConstruct,
  on,
  _WidgetBase,
  _TemplatedMixin,
  ToggleButton,
  template
) {

  return declare("lyra.widget.LanguageControl", [_WidgetBase, _TemplatedMixin], {

    templateString: template,

    activeSong: null,

    setActiveSongRef: function(activeSong) {
      this.activeSong = activeSong;

      var myOnSongDataChange = lang.hitch(this, this.onSongDataChange);
      this.activeSong.watch("songData", function(name, oldValue, newValue) {
        myOnSongDataChange(newValue);
      });
    },

    onSongDataChange: function(newSongData) {
      var languageSelectionNode = dom.byId("language-selection");
      domConstruct.empty(languageSelectionNode);
      var selectedLangs = [];

      var myOnLanguageSelectionChange = lang.hitch(this, this.onLanguageSelectionChange);

      arrayUtil.forEach(newSongData.languages, function(languageCode) {
        var languageToggle = new ToggleButton({
          checked: true,
          iconClass: "dijitCheckBoxIcon",
          label: languageCode,
          onChange: function(isActive) { myOnLanguageSelectionChange(this.label, isActive); }
        });
        languageToggle.placeAt(languageSelectionNode);
        selectedLangs.push(languageCode);
      });

      this.activeSong.set("selectedLangs", selectedLangs);
    },

    onLanguageSelectionChange: function(languageCode, isActive) {
      console.log("active lang change: " + languageCode + " active: " + isActive);
      var selectedLangs = this.activeSong.get("selectedLangs");
      if (isActive) {
        selectedLangs.push(languageCode);
      } else {
        selectedLangs = arrayUtil.filter(selectedLangs, function(item) { return item != languageCode; });
      }
      this.activeSong.set("selectedLangs", selectedLangs);
    },

    init: function() {

    }

  });

});

define([
  "dojo/_base/declare",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/dom",
  "dojo/dom-style",
  "dojo/dom-construct",
  "dojo/dom-geometry",
  "dojo/query",
  "dojo/on",
  "dojo/_base/window",
  "dojo/window",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dojo/_base/fx",
  "dojo/fx/toggler",
  "lyra/util/DOMUtil",
  "lyra/util/FullScreen",
  "lyra/util/Scaler",
  "dojo/text!lyra/widget/templates/Screen.html"
], function(
  declare,
  arrayUtil,
  lang,
  dom,
  domStyle,
  domConstruct,
  domGeometry,
  query,
  on,
  win,
  wind,
  _WidgetBase,
  _TemplatedMixin,
  fx,
  Toggler,
  domUtil,
  fullScreen,
  Scaler,
  template)
{
  return declare("lyra.widget.ScreenController", [_WidgetBase, _TemplatedMixin],
  {
    templateString: template,

    isActive: false,

    scaler: null,

    activate: function() {
      isActive = true;

      this.scaler.activate();

      domUtil.show("container");
      domUtil.show("solid_background");
      domUtil.hide("instructions");

      this.setRatio(16, 9);

      console.log("Screen activated.");
    },

    deactivate: function() {
      isActive = false;

      this.scaler.deactivate();

      domUtil.hide("container");
      domUtil.hide("solid_background");
      domUtil.show("instructions");

      console.log("Screen deactivated.");
    },

    launchFullScreen: function() {
      console.log('launch full screen');
      this.activate();
      fullScreen.enter();
    },

    onFullScreenStart: function() {
      console.log("full screen start");
    },

    onFullScreenEnd: function() {
      console.log("full screen end");
      this.deactivate();
    },

    onWindowResize: function() {
      if (isActive) {
        this.setRatio(16, 9);    
      }
    },

    setRatio: function(hor, ver) {
      domStyle.set("container", "height", (domStyle.get("container", "width") * ver / hor) + "px");
    },

    setDisplayData: function(displayData) {
      displayData.watch(this.updateDisplay);

      //Doesn't seem right
      this.updateDisplay("background", null, displayData.background);
      this.updateDisplay("contents", null, displayData.contents);
    },

    updateDisplay: function(name, oldValue, newValue) {
      console.log("[screen] Display updated name=" + name + " old=" + oldValue + " new=" + newValue);
      
      if (name == "background") {
        setBackgroundVideo(newValue);
      } else if (name == "contents") {
        crossFadeText(newValue);
      }

      function setBackgroundVideo(backgroundData) {
        fx.fadeOut({
          node: "video_background",
          duration: 500,
          onEnd: function() {
            videoBackground = dom.byId("video_background");

            domConstruct.empty("video_background");

            if (!backgroundData) return;

            arrayUtil.forEach(backgroundData.videoSources, function(vs) {
              domConstruct.place('<source src="../backgrounds/' + vs.src + '" type="' + vs.mimeType + '">', "video_background", "last");
            });

            if (backgroundData.videoSources.length == 0) return;

            infoText = win.doc.createTextNode("video not supported");
            videoBackground.appendChild(infoText);
            videoBackground.load();

            fx.fadeIn({
              node: "video_background",
              duration: 500
            }).play();
          }
        }).play();
      };

      function crossFadeText(lines) {
        var element = dom.byId("placeholder");
        var elementSpan = query("#placeholder span")[0];

        var elmPos = domGeometry.position(elementSpan, true);
        var elmClone = lang.clone(element);
        var elmToggler = new Toggler({
          node: element,
          hideDuration: 0,
          showDuration: 500
        });

        domStyle.set(elmClone, 'position', 'absolute');
        domStyle.set(elmClone, 'left', elmPos.x + 'px');
        domStyle.set(elmClone, 'top', elmPos.y + 'px');
        domStyle.set(elmClone, 'width', '100%');
        domConstruct.place(elmClone, dom.byId("container"), "last");

        elmToggler.hide();

        domConstruct.empty(elementSpan);

        if (lines) {
          for (var language in lines) {
            arrayUtil.forEach(lines[language], function(line) {
              domConstruct.place('<p>' + line + '</p>', elementSpan, "last");
            });
          }
        }

        fx.fadeOut({
          node: elmClone,
          duration: 500,
          onEnd: function() {
            domConstruct.destroy(elmClone);
          }
        }).play();

        elmToggler.show();
      };
    },

    startup: function() {
      this.scaler = new Scaler();

      this.inherited(arguments);
      this.deactivate();

      fullScreen.onFullScreenStart = lang.hitch(this, this.onFullScreenStart);
      fullScreen.onFullScreenEnd = lang.hitch(this, this.onFullScreenEnd);

      on(window, "resize", lang.hitch(this, this.onWindowResize));
    }
  });
});
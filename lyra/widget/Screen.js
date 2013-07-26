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

    setBackgroundVideo: function(mp4File, webmFile) {
      console.log("set background video, mp4: " + mp4File + " webm: " + webmFile);

      fx.fadeOut({
        node: "video_background",
        duration: 500,
        onEnd: function() {
          videoBackground = dom.byId("video_background");

          domConstruct.empty("video_background");
          domConstruct.place('<source src="../backgrounds/' + mp4File + '" type="video/mp4">', "video_background", "last");
          domConstruct.place('<source src="../backgrounds/' + webmFile + '" type="video/webm">', "video_background", "last");

          infoText = win.doc.createTextNode("video not supported");
          videoBackground.appendChild(infoText);
          videoBackground.load();

          fx.fadeIn({
            node: "video_background",
            duration: 500
          }).play();
        }
      }).play();
    },

    setRatio: function(hor, ver) {
      domStyle.set("container", "height", (domStyle.get("container", "width") * ver / hor) + "px");
    },

    setForegroundText: function(lines) {
      console.log("setForegroundText");
      this.crossFadeText(lines);
    },

    crossFadeText: function(lines) {
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
      domConstruct.place(elmClone, win.body(), "last");

      elmToggler.hide();

      domConstruct.empty(elementSpan);

      arrayUtil.forEach(lines, function(line) {
        domConstruct.place('<p>' + line + '</p>', elementSpan, "last");
      });

      fx.fadeOut({
        node: elmClone,
        duration: 500,
        onEnd: function() {
          domConstruct.destroy(elmClone);
        }
      }).play();

      elmToggler.show();
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
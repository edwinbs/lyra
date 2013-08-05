Lyra - Web Based Presenter
==========================

In a Nutshell
-------------
Lyra embraces the power of HTML5 to bring a desktop-class worship presenter into the cloud for the very first time. By this, we hope to deliver a much more affordable and no-deployment-required solution to churches all over the world. Even more, we may be able to facilitate collaboration and sharing of contents across organizations.

Wait, what is a worship presenter?

It's what people turn to when they realize that PowerPoint is not really good enough for displaying lyrics in Sunday Services. It's not known to many, but there are a lot of such apps. Here's some good ones:

- [EasyWorship](http://www.easyworship.com/) - Probably most popular, Windows only
- [ProPresenter](http://www.renewedvision.com/) - Cross platform, cloud sync
- [Proclaim](http://proclaimonline.com) - Cross platform, cloud sync
- [EasySlides](http://www.easyslides.com/) - Free

A worship presenter is generally expected to differ from PowerPoint in some of these ways:

- Background and text are controlled separately, which allows for video backgrounds
- Supports live video
- Lyrics text is decoupled from the slide layout (some don't follow this)

It was previously impossible to build this as a web app (without Flash). HTML5 finally allows us to:

- Go [full screen](https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Using_full_screen_mode) for real
- Play mp4, webm, ogg [videos](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_HTML5_audio_and_video) (varies across browsers)
- Access user media devices (camera)
- Use local storage, necessary because media must be cached before the service for smooth usage

Lyra */ˈlīrə/* is the plural form of *lyre*, a string-based musical instrument most widely known to be [played by King David](http://www.biblegateway.com/passage/?search=1%20Samuel%2016:23&version=NIV). And it shares 3 letters with "lyrics". The singular form is pronounced the same way as "liar", which is not nice.

Lyra is hoped to become a self-sustaining non-profit software house.

Dev Boot
--------

We are using [Dojo](http://dojotoolkit.org/) for front end. There is no back end development yet, but it's expected to use either [Node.js](http://nodejs.org/) or [PHP](http://php.net/). Flash, Air, Java Applet and such are taboo.

Some prerequisites:

- [Git](http://git-scm.com/downloads)
- GitHub account (bet you already have)
- HTTP server: [Apache](http://httpd.apache.org/) (preferred) or [IIS](http://www.iis.net/learn/install/installing-iis-7/installing-iis-on-windows-vista-and-windows-7)
- [CPM](https://github.com/kriszyp/cpm) for managing Dojo libraries
- Text editor, this is good: [Sublime Text](http://www.sublimetext.com/)

Then get the code:

1. Clone this repository
2. Install dojo, dijit, and dgrid using CPM in the top-level `lyra/` directory.
3. Get test data and video files from [https://impresscourse.com/lyra/lyra-samples-2.zip](https://impresscourse.com/lyra/lyra-samples-2.zip). User: `hope22` Pass: `*,&1,b~6Dpm}` **IMPORTANT:** the videos should be used for development only. We'll find more-flexibly licensed videos.
4. Configure your HTTP server (see next section)

After performing steps 1-3, your folder structure should look like:

	lyra/
		backgrounds/	-- from samples
		dgrid/			-- CPM
		dijit/			-- CPM
		dojo/			-- CPM
		lyra/
		put-selector/	-- CPM
		screen/
		songs/			-- from samples
		templates/		-- from samples
		xstyle/			-- CPM
		index.html
		presenter.css
		README.md
		(and some other files that CPM creates)

The current code works on **Safari** on Mac (latest) and **Firefox** on Windows (tested on [ESR 17](http://www.mozilla.org/en-US/firefox/organizations/all.html)). Support for Chrome and Firefox on Mac probably won't be there until we have the [full screen fix of OS X Mavericks](http://www.apple.com/osx/preview/#multiple-displays).

Configuring HTTP Server
-----------------------

### Apache

Add `index.json` to `DirectoryIndex` inside `httpd.conf`.

### IIS

1. Open **Internet Information Services (IIS) Manager** in **Administrative Services**
2. In **Default Document** add `index.json` and place it *under* `index.html`
3. In **MIME Types** add `mp4` as `video/mp4`, `webm` as `video/webm` and `json` as `application/json`
4. Restart IIS

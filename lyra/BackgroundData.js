define([
  "dojo/_base/declare"
], function(declare) {

	return declare(null, {

		//Video/image - determines which fields are relevant
		type: null,

		videoSources: [],

		videoPoster: null,

		imageSource: null,

		imageThumbnail: null,

		effect: null,

		constructor: function(args) {
			declare.safeMixin(this, args);
		}

	});

});
define([
  "dojo/_base/declare"
], function(declare) {

	return declare(null, {

		mimeType: "",

		src: "",

		constructor: function(args) {
			declare.safeMixin(this, args);
		}

	});

});
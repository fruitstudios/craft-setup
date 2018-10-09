app.plugins.PluginNameHere = (function () {

	'use strict';

	// Shared Variables
	// =========================================================================

	var defaults = {
		default: 'variables'
	};

	// Constructor
	// =========================================================================

	var Constructor = function (options) {

		// Private Variables
		// =========================================================================

		var settings;

		// Public Variables
		// =========================================================================

		var api = {};

		api.type = 'Toast';

		// Private Methods
		// =========================================================================

		var somePrivateMethod = function () {


		};

		// Api Methods
		// =========================================================================

		api.doSomething = function () {


		};

		api.init = function (options) {

			settings = extend(defaults, options || {});


		};

		// Initilise & Api
		// =========================================================================

		api.init(options);
		return api;
	};

	return Constructor;

})();

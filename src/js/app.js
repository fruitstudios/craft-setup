var app = {
	site: {}
};
app.api = (function () {

	'use strict';

	var api = {};

    // Defaults
    // =========================================================================

	var defaults = {
		csrfTokenName: null,
		csrfToken: null,
		user: null,
		site: null,
		stripe: null,
		onInit: function () {},
	};

	// Private
	// =========================================================================

	var _settings;

	// Public Methods
	// =========================================================================

	api.init = function (options) {

		// Settings
		_settings = _.defaults((options || {}), defaults);
		app.settings = _settings;

		// Plugins
		app.toggle.init();
		app.toasts.init();
		app.fields.init();
		app.forms.init();

		// Site Modules
		app.site.init.init();
		app.site.forms.init();

        // After init callback
        _settings.onInit();
	};

	// Public Api
	// =========================================================================

	return api;

})();

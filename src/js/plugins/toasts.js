app.toasts = (function () {

    'use strict';

    // Private Variables
    // =========================================================================

	var _api = {};
	var _settings;

	var defaults = {
		selector: '[data-toast]',
		type: 'info',
		message: '',
		duration: 3500,
		dismissable: true,
		store: false,
		storageKey: '__toast',
		template: function (toast) {

			var close = toast.dismissable ? [
				'<div class="toast-dismiss" data-toast-dismiss>',
					'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64"><path d="M32.202 27.36L58.62.944c1.226-1.225 3.212-1.225 4.437 0s1.225 3.21 0 4.437L36.64 31.8l26.417 26.418c1.225 1.225 1.225 3.212 0 4.437s-3.21 1.225-4.437 0l-26.418-26.42L5.784 62.653c-1.225 1.225-3.212 1.225-4.437 0s-1.225-3.212 0-4.437l26.418-26.418L1.347 5.38C.122 4.154.122 2.168 1.347.943s3.212-1.225 4.437 0L32.202 27.36z"/></svg>',
				'</div>'
			].join('') : '';

			return [
				'<div class="toast toast-'+toast.type+'" data-toast>',
					close,
					'<p>'+toast.message+'</p>',
				'</div>'
			].join('');
		}
	};


	// Private Methods
    // =========================================================================

	var clickHandler = function (event) {

		// // Don't run if right-click or command/control + click
		if ( event.button !== 0 || event.metaKey || event.ctrlKey ) return;

		// Dismiss
		var dismiss = event.target.closest("[data-toast-dismiss]");
		if( !dismiss ) return;

		// Toast
		var toast = event.target.closest("[data-toast]");
		if( !toast ) return;

		event.preventDefault();
		_api.dismiss(toast);
	};


	// Api Methods
    // =========================================================================

	_api.create = function ( options ) {

		var localSettings = _.defaults((options || {}), (_settings || defaults));

		if(localSettings.store) {
			localSettings.store = false;
			store.set(defaults.storageKey, localSettings);
			return;
		}

		var toast = app.utils.renderAsElement(localSettings.template, localSettings);

		document.body.appendChild(toast);

		if(localSettings.duration) {
			setTimeout(function () {
				_api.dismiss(toast);
			}, localSettings.duration );
		}

	};

	_api.dismiss = function ( toast ) {
		if(!toast) return;
		toast.remove();
	}


	_api.dismissAll = function ( options ) {

		var localSettings = _.defaults((options || {}), (_settings || defaults));

		var toasts = document.querySelectorAll(localSettings.selector);
		if(toasts.length) {
			toasts.forEach(function(toast, i) {
				_api.dismiss(toast);
			});
		}
	};

	// Api Methods
    // =========================================================================

	_api.destroy = function () {
		if ( !_settings ) return;
		_api.dismissAll();
		document.removeEventListener('click', clickHandler, false);
		_settings = null;
	};

	_api.init = function ( options ) {

		_api.destroy();

		// Merge user options with defaults
		_settings = _.defaults((options || {}), defaults);

		// Listen for all click events
		document.addEventListener('click', clickHandler, false);

		// Look for any stored toasts
		var toast = store.get(defaults.storageKey) || false;
        if(toast) {
            _api.create(toast);
            store.remove(defaults.storageKey);
        }
	};

    // Public Api
    // =========================================================================

    return _api;

})();

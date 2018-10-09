app.toggle = (function () {

    'use strict';

    // Variables
    // =========================================================================

    var _api = {};
    var _overlay;
    var _toggle;
    var _targets;

    // Event Handlers
    // =========================================================================

    var clickHandler = function (event) {

        // If _toggle is set we need to check for an outside click and close any toggles first
        if(_toggle) {

            if(!_toggle.contains(event.target) && _targets) {
                var clickInsideTargets = false;
                for (var key in _targets) {
                    if (_targets.hasOwnProperty(key)) {
                        clickInsideTargets = _targets[key].contains(event.target) ? true : false;
                        if (clickInsideTargets) break;
                    }
                }
                if (!clickInsideTargets) {
                    toggleElement(_toggle);
                }
            }
        }

        // Check if this is a toggle request
        var toggle = event.target.closest('[data-toggle-classes]');
        if (!toggle) return;

        // Prevent default link behaviour
        event.preventDefault();

        // Toggle element
        toggleElement(toggle);

        return;
    };

    var changeHandler = function (event) {

        // Check if this is a toggle change
        var toggle = event.target.closest('[data-toggle]');
        if (!toggle) return;

        // If there are target(s) toggle classes on them, otherwise just toggle classes on the toggle
        var targetsSelector = toggle.getAttribute('data-toggle');
        var targets = targetsSelector ? document.querySelectorAll(targetsSelector) : false;

        if(targets) {

            var selectedOption = toggle.options[toggle.selectedIndex] || false;
            var toggleElement = app.utils.parseDataAttr(selectedOption, 'data-toggle-value', toggle.value);

            for (var key in targets) {
                if (targets.hasOwnProperty(key)) {
                    if(toggleElement) {
                        targets[key].classList.remove('hidden');
                    } else {
                        targets[key].classList.add('hidden');
                    }
                }
            }
        }

        return;
    };

    // Private Methods
    // =========================================================================

    var toggleElement = function(toggle) {

        toggle = toggle || false;
        if (!toggle) return;

        // Reset outside click variables
        var isAnAutoClose = _toggle ? true : false;
        _toggle = null;
        _targets = null;

        // Get classes to toggle
        var classes = toggle.getAttribute('data-toggle-classes') || '';

        // If there are target(s) toggle classes on them, otherwise just toggle classes on the toggle
        var targetsSelector = toggle.getAttribute('data-toggle-target');
        var targets = targetsSelector ? document.querySelectorAll(targetsSelector) : false;

        if(targets) {
            for (var key in targets) {
                if (targets.hasOwnProperty(key)) {
                    app.utils.toggleClasses(targets[key], classes);
                }
            }
        } else {
            app.utils.toggleClasses(toggle, classes);
        }

        // Overlay
        if (_overlay && toggle.hasAttribute('data-toggle-overlay')) {
            _overlay.classList.toggle('is-open');
        }

        // Enable autoclose
        if (!isAnAutoClose && toggle.hasAttribute('data-toggle-autoclose')) {
            _toggle = toggle;
            _targets = targets;
        }
    }


    // Public Methods
    // =========================================================================

    _api.init = function () {

        _overlay = document.querySelector('[data-body-overlay]');

        window.addEventListener('click', clickHandler, false);
        window.addEventListener('change', changeHandler, false);

    };

    // Public Api
    // =========================================================================

    return _api;

})();

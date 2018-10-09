/**
 * Prevent body scroll and overscroll.
 * Tested on mac, iOS chrome / Safari, Android Chrome.
 *
 * Based on: https://benfrain.com/preventing-body-scroll-for-modals-in-ios/
 *           https://stackoverflow.com/a/41601290
 *
 * Use in combination with:
 * html, body {overflow: hidden;}
 *
 * and: -webkit-overflow-scrolling: touch; for the element that should scroll.
 *
 * disableBodyScroll(true, '.i-can-scroll');
 */
var disableBodyScroll = (function () {

    /**
     * Private variables
     */
    var _selector = false,
        _element = false,
        _clientY;

    /**
     * Polyfills for Element.matches and Element.closest
     */
    if (!Element.prototype.matches)
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

    if (!Element.prototype.closest)
        Element.prototype.closest = function (s) {
            var ancestor = this;
            if (!document.documentElement.contains(el)) return null;
            do {
                if (ancestor.matches(s)) return ancestor;
                ancestor = ancestor.parentElement;
            } while (ancestor !== null);
            return el;
        };

    /**
     * Prevent default unless within _selector
     *
     * @param  event object event
     * @return void
     */
    var preventBodyScroll = function (event) {
        if (false === _element || !event.target.closest(_selector)) {
            event.preventDefault();
        }
    };

    /**
     * Cache the clientY co-ordinates for
     * comparison
     *
     * @param  event object event
     * @return void
     */
    var captureClientY = function (event) {
        // only respond to a single touch
        if (event.targetTouches.length === 1) {
            _clientY = event.targetTouches[0].clientY;
        }
    };

    /**
     * Detect whether the element is at the top
     * or the bottom of their scroll and prevent
     * the user from scrolling beyond
     *
     * @param  event object event
     * @return void
     */
    var preventOverscroll = function (event) {
        // only respond to a single touch
	    if (event.targetTouches.length !== 1) {
	    	return;
	    }

	    var clientY = event.targetTouches[0].clientY - _clientY;

	    // The element at the top of its scroll,
	    // and the user scrolls down
	    if (_element.scrollTop === 0 && clientY > 0) {
	        event.preventDefault();
	    }

	    // The element at the bottom of its scroll,
	    // and the user scrolls up
		// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
		if ((_element.scrollHeight - _element.scrollTop <= _element.clientHeight) && clientY < 0) {
	        event.preventDefault();
	    }

    };

    /**
     * Disable body scroll. Scrolling with the selector is
     * allowed if a selector is porvided.
     *
     * @param  boolean allow
     * @param  string selector Selector to element to change scroll permission
     * @return void
     */
    return function (allow, selector) {
    	if (typeof selector !== "undefined") {
	        _selector = selector;
	        _element = document.querySelector(selector);
    	}

        if (true === allow) {
        	if (false !== _element) {
	            _element.addEventListener('touchstart', captureClientY, false);
	            _element.addEventListener('touchmove', preventOverscroll, false);
        	}
            document.body.addEventListener("touchmove", preventBodyScroll, { passive: false });
        } else {
        	if (false !== _element) {
	            _element.removeEventListener('touchstart', captureClientY, false);
	            _element.removeEventListener('touchmove', preventOverscroll, false);
	        }
            document.body.removeEventListener("touchmove", preventBodyScroll, false);
        }
    };
}());

app.utils = (function () {

    'use strict';

    var _api = {};

    // Navigation
    // =========================================================================

    _api.reload = function(options) {

        var defaults = {
            top: true,
            url: null,
            disableCache: false,
            toast: false,
        };
        var settings = _.defaults(options, defaults);

        if (settings.toast) {
            var toast = settings.toast;
            toast.store = true;

            app.toasts.create(toast);
        }

        if (settings.url) {
            window.location.href = settings.url;
        } else {
            if (settings.top) {
                window.scrollTo({
                    top: 0,
                    behavior: "instant"
                });
            }
            location.reload(settings.disableCache);
        }
    };


    // Data Attributes
    // =========================================================================

    // Grab the value for a data-attr and parse if JSON
    _api.parseDataAttr = function(elem, name, def) {
        var value = elem ? elem.getAttribute(name) : null;
        return value ? _api.parseIfJson(value) : (def || false);
    };

    // Grab any options set on
    _api.getOptionsFromElement = function(elem) {

        if (!_.isElement(elem)) {
            return {};
        }

        // Check for json encoded data-options attribute
        var options = _api.parseDataAttr(elem, 'data-options', {});
        if(!_.isObject(options)) {
            options = {};
        }

        // Check for any individual data-option attributes
        var attributes = Array.from(elem.attributes);
        if(attributes.length) {

            attributes.forEach(function (attribute) {

                if(_.startsWith(attribute.nodeName, 'data-option-')) {
                    var optionName = _.camelCase(_.replace(attribute.nodeName, 'data-option-', ''));
                    options[optionName] = _api.parseIfJson(attribute.nodeValue);
                }

            });
        }

        return options;
    };



    // JSON
    // =========================================================================

    _api.parseIfJson = function (value) {
        try {
            return JSON.parse(value);
        }
        catch (error){
            return value;
        }
    }


    // Forms
    // =========================================================================

    // Ensure ajax data has the required CSRF property where available
    _api.prepAjaxRequestData = function(data) {
        data = data || {};
        if (!_.has(data, app.settings.csrfTokenName)) {
            data[app.settings.csrfTokenName] = app.settings.csrfToken;
        }
        return data;
    };

    // Convert an object into a new FormData()
    _api.objToFormData = function (data) {
        var formData = new FormData();
        for ( var key in data ) {
            formData.append(key, data[key]);
        }
        return formData;
    };


    // Note: This is simplified/dumb version of https://github.com/friday/query-string-encode
    _api.serializeObject = function (object) {

        // Array of path/value tuples
        var flattened = [];

        (function flatten(object, path) {
            // Add path and value to flat array
            if ([Boolean, Number, String].indexOf(object.constructor) !== -1) {
                var serializedPath = path.map(function (key, index) {
                    return index ? "[" + key + "]" : key;
                }).join("");
                flattened.push([serializedPath, object]);
            }

            // Iterate over next level of array/object
            else if ([Array, Object].indexOf(object.constructor) !== -1) {
                for (var key in object) {
                    flatten(object[key], path.concat([key]));
                }
            }
        })(object, []);

        // Convert array to query string
        return flattened.map(function (pair) {
            return pair.map(encodeURIComponent).join("=");
        }).join("&");
    }

    /*jslint continue:true*/
    /**
     * Adapted from {@link http://www.bulgaria-web-developers.com/projects/javascript/serialize/}
     * Changes:
     *     Ensures proper URL encoding of name as well as value
     *     Preserves element order
     *     XHTML and JSLint-friendly
     *     Disallows disabled form elements and reset buttons as per HTML4 [successful controls]{@link http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2}
     *         (as used in jQuery). Note: This does not serialize <object>
     *         elements (even those without a declare attribute) or
     *         <input type="file" />, as per jQuery, though it does serialize
     *         the <button>'s (which are potential HTML4 successful controls) unlike jQuery
     * @license MIT/GPL
    */
    _api.serialize = function (form) {
        'use strict';
        var i, j, len, jLen, formElement, q = [];
        function urlencode (str) {
            // http://kevin.vanzonneveld.net
            // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
            // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
            return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
                replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
        }
        function addNameValue(name, value) {
            q.push(urlencode(name) + '=' + urlencode(value));
        }
        if (!form || !form.nodeName || form.nodeName.toLowerCase() !== 'form') {
            throw 'You must supply a form element';
        }
        for (i = 0, len = form.elements.length; i < len; i++) {
            formElement = form.elements[i];
            if (formElement.name === '' || formElement.disabled) {
                continue;
            }
            switch (formElement.nodeName.toLowerCase()) {
            case 'input':
                switch (formElement.type) {
                case 'text':
                case 'hidden':
                case 'password':
                case 'search':
                case 'email':
                case 'url':
                case 'tel':
                case 'number':
                case 'range':
                case 'date':
                case 'month':
                case 'week':
                case 'time':
                case 'datetime':
                case 'datetime-local':
                case 'color':
                case 'button': // Not submitted when submitting form manually, though jQuery does serialize this and it can be an HTML4 successful control
                case 'submit':
                    addNameValue(formElement.name, formElement.value);
                    break;
                case 'checkbox':
                case 'radio':
                    if (formElement.checked) {
                        addNameValue(formElement.name, formElement.value);
                    }
                    break;
                case 'file':
                    // addNameValue(formElement.name, formElement.value); // Will work and part of HTML4 "successful controls", but not used in jQuery
                    break;
                case 'reset':
                    break;
                }
                break;
            case 'textarea':
                addNameValue(formElement.name, formElement.value);
                break;
            case 'select':
                switch (formElement.type) {
                case 'select-one':
                    addNameValue(formElement.name, formElement.value);
                    break;
                case 'select-multiple':
                    for (j = 0, jLen = formElement.options.length; j < jLen; j++) {
                        if (formElement.options[j].selected) {
                            addNameValue(formElement.name, formElement.options[j].value);
                        }
                    }
                    break;
                }
                break;
            case 'button': // jQuery does not submit these, though it is an HTML4 successful control
                switch (formElement.type) {
                case 'reset':
                case 'submit':
                case 'button':
                    addNameValue(formElement.name, formElement.value);
                    break;
                }
                break;
            }
        }
        return q.join('&');
    }


    /**
     * Serialize the form data into a query string
     * https://stackoverflow.com/a/30153391/1293256
     * @param  {Node}   form The form to serialize
     * @return {String}      The serialized form data
     */
    // _api.serialize = function (form) {
    //     // Setup our serialized data
    //     var serialized = '';
    //     // Loop through each field in the form
    //     for (var i = 0; i < form.elements.length; i++) {
    //         var field = form.elements[i];
    //         // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
    //         if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;
    //         // Convert field data to a query string
    //         if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
    //             serialized += '&' + encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value);
    //         }
    //     }
    //     return serialized;
    // };

    // _api.serializeToQueryString = function (form) {
    //     return serialize(form, 'queryString');
    // }

    // _api.serializeToArray = function (form) {
    //
    // }

    // Event
    // =========================================================================

    _api.simulateClick = function (elem) {
        // Create our event (with options)
        var evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        // If cancelled, don't dispatch our event
        var cancelled = !elem.dispatchEvent(evt);
    };

    // Variable
    // =========================================================================

    _api.isString = function(variable) {
        return typeof (variable || null) === 'string';
    }

    _api.isFunction = function(variable) {
        return typeof (variable || null) === 'function';
    };

    _api.isObject = function(variable) {
        return typeof (variable || null) === 'object';
    };

    _api.isElement = function(variable) {
        return _.isElement(variable);
    };

    // Dom, Element & HTML
    // =========================================================================

    // Ensure querySelector returns an element if none found
    _api.getElem = function(selector) {
        return document.querySelector(selector) || document.createElement("_");
    };

    _api.htmlToElement = function(html) {
        var span = document.createElement("span");
        span.innerHTML = html.trim();
        return span.firstChild;
    };

    _api.clonedNodeToElement = function(clonedNode) {
        var span = document.createElement("span");
        span.appendChild(clonedNode);
        return span.firstChild;
    };

    _api.renderAsHtml = function (template, data) {
        return typeof template === 'function' ? template(data) : template;
    };

    _api.renderAsElement = function (template, data) {
        var html = _api.renderAsHtml(template, data);
        return _api.htmlToElement(html);
    }

    _api.getPosition = function (element) {
        var rect = element.getBoundingClientRect();
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft
        };
    }

    /*!
     * Get all siblings of an element
     * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
     * @param  {Node}  elem The element
     * @return {Array}      The siblings
     */
    _api.getSiblings = function (elem) {
        var siblings = [];
        var sibling = elem.parentNode.firstChild;
        for (; sibling; sibling = sibling.nextSibling) {
            if (sibling.nodeType === 1 && sibling !== elem) {
                siblings.push(sibling);
            }
        }
        return siblings;
    };

    /*!
     * Determine if an element is in the viewport
     * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
     * @param  {Node}    elem The element
     * @return {Boolean}      Returns true if element is in the viewport
     */
    _api.isInViewport = function (elem) {
        var distance = elem.getBoundingClientRect();
        return (
            distance.top >= 0 &&
            distance.left >= 0 &&
            distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            distance.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    /*!
     * Check if an element is out of the viewport
     * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
     * @param  {Node}  elem The element to check
     * @return {Object}     A set of booleans for each side of the element
     */
    _api.isOutOfViewport = function (elem) {
        var bounding = elem.getBoundingClientRect();
        var out = {};
        out.top = bounding.top < 0;
        out.left = bounding.left < 0;
        out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
        out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
        out.any = out.top || out.left || out.bottom || out.right;
        out.all = out.top && out.left && out.bottom && out.right;
        return out;
    };

    _api.toggleClasses = function (elem, classes) {
        classes = (classes || '').split(' ');
        if(_api.isElement(elem)) {
            classes.forEach(function (classString, index) {
                elem.classList.toggle(classString);
            });
        }
    };

    /*!
     * Auto scroll to a certain value on an element
     * bottom, top (default) or value
     */
    _api.autoScrollTo = function (context) {

        var containers = (context ? context : document).querySelectorAll('[data-auto-scroll]');
        if (containers) {
            containers.forEach(function(container, index) {
                var action = container.getAttribute('data-auto-scroll');
                switch(action) {
                    case 'bottom':
                        container.scrollTop = container.scrollHeight;
                        break;
                    case 'top':
                        container.scrollTop = 0;
                        break;
                    default:
                        if(isNaN(action)) {
                            container.scrollTop = 0;
                        } else {
                            container.scrollTop = parseFloat(action);
                        }
                }

            });
        }
    };

    // Other
    // =========================================================================

    // Get a unique id
    _api.getUid = function(length, prefix) {
        length = length || 10;
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var text = '';
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return (prefix || '') + text;
    };

    // Public Api
    // =========================================================================

    return _api;

})();

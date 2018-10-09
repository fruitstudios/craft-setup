app.site.init = (function () {

    'use strict';

    // Variables
    // =========================================================================

    var _api = {};

    // Event Handlers
    // =========================================================================

    // Public Methods
    // =========================================================================

    _api.init = function () {

        // SVG
        svg4everybody();

        // Lightbox
        mediumZoom('[data-action="zoom"]', {
            margin: 24,
            background: 'rgba(29, 36, 46, 0.9)',
        });

        // Accordian
        houdini.init({
            selectorToggle: '[data-collapse]',
            selectorContent: '.collapse',
            toggleActiveClass: 'active',
            contentActiveClass: 'active',
            initClass: 'js-houdini',
            stopVideo: true,
            callbackOpen: function ( content, toggle ) {},
            callbackClose: function ( content, toggle ) {}
        });

        // Smooth scrolling
        var scroll = new SmoothScroll('[data-scroll]');


        // Scroll to bottom of containter
        app.utils.autoScrollTo();


        // Editor
        new MediumEditor('[data-editor]', {
            toolbar: {
                buttons: [
                    'bold',
                    'italic',
                    {
                        name: 'unorderedlist',
                        action: 'insertunorderedlist',
                        aria: 'unordered list',
                        tagNames: ['ul'],
                        useQueryState: true,
                        contentDefault: '<b>List</b>'
                    },
                    {
                        name: 'anchor',
                        action: 'createLink',
                        contentDefault: '<b>Link</b>',
                        linkValidation: true,
                        placeholderText: 'Paste or type a link here',
                    }
                ]
            },
            delay: 1000,
            placeholder: false
        });

    };

    // Private Methods
    // =========================================================================


    // Public Api
    // =========================================================================

    return _api;

})();

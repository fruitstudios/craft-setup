/*! ready.js | (c) 2017 Chris Ferdinandi | MIT License | http://github.com/cferdinandi/ready */
var ready = function (fn) {

    // Sanity check
    if ( typeof fn !== 'function' ) return;

    // If document is already loaded, run method
    if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
        return fn();
    }

    // Otherwise, wait until document is loaded
    document.addEventListener( 'DOMContentLoaded', fn, false );

};

var EXPORTED_SYMBOLS = ["EventEmitter"];

function EventEmitter() {
  var callbacks = [];

  this.addListener = function( listener ){

    callbacks.push( listener );

  };

  this.removeListener = function( listener ){

    var index = callbacks.indexOf( listener );

    if( index != -1 ){
      callbacks.splice( index, 1 );
    }

  };

  this.callListeners = function() {
    var args = arguments;
    var toRemove = [];
    callbacks.forEach(function( callback ){
      try {
        callback.apply(null, args);
      }
      catch(ex) {
        dump("Listener call failed: " + ex + " " + ex.stack + "\n");
        toRemove.push(callback);
      }
    });
    toRemove.forEach(function( callback ){
      var index = callbacks.indexOf( callback );
      if( index > -1 ){
        callbacks.splice( index, 1 );
      }
    });
  };
}
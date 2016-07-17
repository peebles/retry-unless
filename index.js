var async = require( 'async' );

var _debug = false;

module.exports = function( options, func, condition, final ) {
  var times = options.times || 5;
  var _retryCount = 0;

  if ( options.debug ) _debug = true;
  
  function interval( retryCount ) {
    debug( 'doing a retry:', retryCount );
    if ( options.interval instanceof Function ) {
      return options.interval( retryCount );
    }
    else {
      return options.interval;
    }
  }

  function debug() {
    if ( ! _debug ) return;
    console.log.apply( null, arguments );
  }
  
  var lastError;
  var lastData;
  
  async.doUntil(
    function( cb ) {
      if ( _retryCount == 0 ) {
	debug( 'Calling func() for the first time' );
	func( function( err, data ) {
	  lastError = err;
	  lastData = data;
	  _retryCount += 1;
	  cb();
	});
      }
      else {
	setTimeout( function() {
	  func( function( err, data ) {
	    lastError = err;
	    lastData = data;
	    _retryCount += 1;
	    cb();
	  });
	}, interval( _retryCount ) );
      }
    },
    function() {
      debug( 'in the check: lastError:', (lastError?true:false), 'retryCount:', _retryCount );
      if ( ! lastError ) return true; // we're done
      if ( _retryCount > times ) return true; // we're done
      return condition( lastError, _retryCount );  // let the caller decide.  Return true if done, false if we should continue.
    },
    function() {
      debug( 'finally: err:', (lastError?true:false), 'data:', (lastData?true:false) );
      final( lastError, lastData );
    }
  );
}

var retry = require( './index' );

retry({
  times: 6,
  interval: function( retryCount ) {
    var delay = 50 * Math.pow(2, retryCount);
    console.log( "  => backing off for:", delay );
    return delay;
  }
}, function( cb ) {

  console.log( 'Calling function...' );
  setTimeout( function() {
    cb( new Error( 'should not stop' ) );
  }, 500 );
  
}, function( err, count ) {
  // return true if we should stop, false if we should continue
  if ( err.message == 'should stop' ) return true;
  else return false;
}, function( err, data ) {
  if ( err ) console.log( 'FINAL ERROR:', err );
  if ( data ) console.log( 'FINAL DATA:', data );
  process.exit( 1 );
});

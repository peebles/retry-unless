# Retry Unless

A cross between [async](https://github.com/caolan/async) `retry` which does not have a early breakout function, and
other back off libraries like [exp-backoff](https://www.npmjs.com/package/exp-backoff) which have no documentation
or are difficult to understand how to make work.

## Install

```bash
npm install --save retry-unless
```

## Usage

```javascript
var retry = require( 'retry-unless' );

retry( options, yourFunction, yourBreakoutCheck, finallFunction );
```

The `options` are the same as `async.retry`.  For example:

```javascript
{
  times: 5,
  interval: 200
}
```

Where `times` is the maximum number of tries that will be made and `interval` is either the number of milliseconds to wait between
tries, or is a function that takes the current retry count as an argument and must return a number of milliseconds to wait for the
next try.

`yourFunction` is, well your function!  It must be function using the standard callback (err, data) node pattern.

`yourBreakoutCheck` is a function that takes the last error returned from `yourFunction` and the current retry count, and should
return true if we should stop trying, or false if we should continue trying.

`finalFunction` is called when we're done, and takes ( err, data ), where `err` is the last error returned from `yourFunction` (if any)
and `data` is the last data returned from `yourFunction`.

## Practical Example

In this example, we're going to keep trying to call a troublesome cloud service until the
serivce finally accepts our request, or we give up trying.

```javascript
var retry = require( 'retry-unless' );
var request = require( 'request' );

retry({
  times: 6,
  interval: function( retryCount ) {
    // exponential back off
    var delay = 50 * Math.pow( 2, retryCount );
    return delay;
  }
}, function( cb ) {
   // give it a shot...
   request.post( 'http://free-tier.com/submit_payment', info, cb );
}, function( err, count ) {
  // return true if we should stop, false if we should continue
  // ie. keep trying as long as we keep getting "your credit card is expired"
  // back from free-tier.  Any other error should stop retrying.
  if ( err.message.match( /your credit card is expired/ ) ) return false;
  else return true;
}, function( err, data ) {
  if ( err ) console.log( 'FINAL ERROR:', err );
  if ( data ) console.log( 'FINAL DATA:', data );
  process.exit( 1 );
});
```

var murmurhash = require('./index');

module.exports = function(promise) {
  if (!promise) {
    promise = global.Promise;
  }

  if ('function' !== typeof promise) {
    throw new Error("Promise constructor required");
  }

  var hash = {};

  for(var name in murmurhash) {
    if (murmurhash.hasOwnProperty(name) && ('function' === typeof murmurhash[name])) {
      hash[name + 'Async'] = wrap(promise, murmurhash[name]);
    }
  }
  return hash;
};

function wrap(promise, fn) {
  return new Function('Promise', 'slice', 'fn', 
    'return function ' + fn.name + 'Async() {               \
      var cb, args = slice.call(arguments);                 \
      var promise = new Promise(function(resolve, reject) { \
        cb = function(err, res) {                           \
          if (err) reject(err); else {                      \
            resolve(res);                                   \
          }                                                 \
        };                                                  \
      });                                                   \
      args.push(cb);                                        \
      fn.apply(this, args);                                 \
      return promise;                                       \
    }')(promise, Array.prototype.slice, fn);
}

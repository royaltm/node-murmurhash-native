// jshint multistr:true, evil:true
"use strict";

var murmurhash = require('./index');

module.exports = function(promise) {
  if (!promise) {
    promise = global.Promise;
  }

  if ('function' !== typeof promise) {
    throw new Error("Promise constructor required");
  }

  var promisify = function(object) {
    var value, hash = {};

    for(var name in object) {
      if (object.hasOwnProperty(name)) {
        if (!!(value = object[name])) {
          switch(typeof value) {
            case 'function':
              hash[name + 'Async'] = wrap(promise, value);
              break;
            case 'object':
              hash[name] = promisify(value);
              break;
          }
        }
      }
    }
    return hash;
  };

  return promisify(murmurhash);
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

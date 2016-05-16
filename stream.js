var util = require('util');
var binding = require('./incremental');
var algorithms = {};

exports.getHashes = function() {
  return Object.keys(binding)
        .filter(function(name) {
          return 'function' === typeof binding[name];
        })
        .map(function(name) { return name.toLowerCase(); });
};

Object.keys(binding).forEach(function(name) {
  if (binding.hasOwnProperty(name) && 'function' === typeof binding[name]) {
    algorithms[name.toLowerCase()] = binding[name];
  }
});

algorithms['murmurhash3A'] = algorithms['murmurhash32'] = algorithms['murmurhash32x86']

/* from nodejs lib/crypto.js */

var LazyTransform = require('./lazy_transform');

/**
 * Creates and returns a MurmurHash object that can be used to generate murmurhash digests.
 * 
 * Except murmur's `seed` option, the rest of the options are passed to
 * stream.Transform constructor.
 *
 * @param {string} algorithm - one of available algorithms
 * @param {number|object} seed|options - hasher options
 **/
exports.createHash = exports.MurmurHash = MurmurHash;
function MurmurHash(algorithm, options) {
  var seed;

  if (!(this instanceof MurmurHash))
    return new MurmurHash(algorithm, options);

  if ('number' === typeof options)
    seed = options, options = undefined;
  else if (options)
    seed = options.seed;
  this._handle = new algorithms[algorithm.toLowerCase()](seed);
  LazyTransform.call(this, options);
}

util.inherits(MurmurHash, LazyTransform);

MurmurHash.prototype._transform = function(chunk, encoding, callback) {
  this._handle.update(chunk, encoding);
  callback();
};

MurmurHash.prototype._flush = function(callback) {
  this.push(this._handle.digest());
  callback();
};

MurmurHash.prototype.update = function(data, encoding) {
  return this._handle.update(data, encoding);
};

MurmurHash.prototype.digest = function(outputEncoding) {
  return this._handle.digest(outputEncoding);
};

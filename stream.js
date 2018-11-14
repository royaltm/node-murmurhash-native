"use strict";

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

algorithms.murmurhash3a = algorithms.murmurhash32 = algorithms.murmurhash32x86 = algorithms.murmurhash;

/* from nodejs lib/crypto.js */

var LazyTransform = require('./lazy_transform');

/**
 * Creates and returns a MurmurHash object that can be used to generate murmurhash digests.
 * 
 * Except murmur's `seed` and `endianness` options, the rest of the options are passed to
 * stream.Transform constructor.
 *
 * @param {string|MurmurHash} algorithm|hasher - one of available algorithms
 *                            or a murmur hasher instance
 * @param {number|object} seed|options - hasher options
 **/
exports.createHash = exports.MurmurHash = MurmurHash;
function MurmurHash(algorithm, options) {
  var seed, endianness;

  if (!(this instanceof MurmurHash))
    return new MurmurHash(algorithm, options);

  if (options && 'object' === typeof options) {
    seed = options.seed;
    endianness = options.endianness;
  } else {
    seed = options; options = undefined;
  }

  if (algorithm instanceof MurmurHash) {
    this._handle = new algorithm._handle.constructor(algorithm._handle, endianness);
  } else if (algorithm) {
    // handle object from json
    if ('object' === typeof algorithm) {
      seed = algorithm.seed;
      algorithm = algorithm.type;
    }
    var Handle = algorithms[algorithm.toLowerCase()];
    if (Handle) {
      this._handle = new Handle(seed, endianness);
    } else {
      throw new Error("Algorithm not supported");
    }
  } else {
    throw new TypeError("Must give algorithm string, a serialized state or a MurmurHash instance");
  }

  LazyTransform.call(this, options);
}

util.inherits(MurmurHash, LazyTransform);

MurmurHash.prototype._transform = function(chunk, encoding, callback) {
  if (chunk.length < 8192) { // this constant was chosen experimentally
    this._handle.update(chunk, encoding);
    callback();
  } else {
    this._handle.update(chunk, encoding, callback);
  }
};

MurmurHash.prototype._flush = function(callback) {
  this.push(this._handle.digest());
  callback();
};

MurmurHash.prototype.update = function() {
  var handle = this._handle;
  return handle.update.apply(handle, arguments) && this;
};

MurmurHash.prototype.digest = function() {
  var handle = this._handle;
  return handle.digest.apply(handle, arguments);
};

MurmurHash.prototype.serialize = function(type, offset) {
  return this._handle.serialize(type, offset);
};

MurmurHash.prototype.copy = function(target) {
  this._handle.copy(target && target._handle);
  return target;
};

MurmurHash.prototype.toJSON = function() {
  var handle = this._handle;
  return {
    type: handle.constructor.name,
    seed: handle.toJSON()
  };
};

Object.defineProperty(MurmurHash.prototype, 'isBusy', {
  get: function() {
    return this._handle.isBusy;
  },
  enumerable: false,
  configurable: false
});

Object.defineProperty(MurmurHash.prototype, 'total', {
  get: function() {
    return this._handle.total;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(MurmurHash.prototype, 'endianness', {
  get: function() {
    return this._handle.endianness;
  },
  set: function(value) {
    this._handle.endianness = value;
  },
  enumerable: true,
  configurable: false
});

Object.defineProperty(MurmurHash.prototype, 'SERIAL_BYTE_LENGTH', {
  get: function() {
    Object.defineProperty(this, 'SERIAL_BYTE_LENGTH', {
      enumerable: true,
      writable: true,
      configurable: true,
      value: this._handle.SERIAL_BYTE_LENGTH
    });
    return this.SERIAL_BYTE_LENGTH;
  },
  enumerable: true,
  configurable: true,
});

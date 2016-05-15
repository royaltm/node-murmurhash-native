MurmurHash bindings for node
============================

This library provides Austin Appleby's non-cryptographic "MurmurHash" hashing algorithm functions in a few different flavours.

[![NPM][NPM img]][NPM Status]

[![Build Status][BS img]][Build Status]

Installation:
-------------

```
npm install murmurhash-native
```

Tested on Linux (x64), OS X and MS Windows (x64 and x86).


Usage:
------

```js
var murmurHash = require('murmurhash-native').murmurHash

murmurHash( 'hash me!' ) // 2061152078
murmurHash( new Buffer('hash me!') ) // 2061152078
murmurHash( 'hash me!', 0x12345789 ) // 1908692277
murmurHash( 'hash me!', 0x12345789, 'buffer' ) // <Buffer 71 c4 55 35>
murmurHash( 'hash me!', 0x12345789, 'hex' ) // '71c45535'
var buf = new Buffer('hash me!____')
murmurHash( buf.slice(0,8), 0x12345789, buf, 8 )
// <Buffer 68 61 73 68 20 6d 65 21 71 c4 55 35>

var murmurHash128x64 = require('murmurhash-native').murmurHash128x64
murmurHash128x64( 'hash me!' ) // 'c43668294e89db0ba5772846e5804467'

var murmurHash128x86 = require('murmurhash-native').murmurHash128x86
murmurHash128x86( 'hash me!' ) // 'c7009299985a5627a9280372a9280372'

// asynchronous:
murmurHash( 'hash me!', function(err, hash) { assert.equal(hash, 2061152078) });
```

The following functions are available:

* `murmurHash`       - MurmurHash v3 32bit
* `murmurHash32`     - (an alias of murmurHash)
* `murmurHash128`    - MurmurHash v3 128bit platform (x64 or x86) optimized 
* `murmurHash128x64` - MurmurHash v3 128bit x64 optimized
* `murmurHash128x86` - MurmurHash v3 128bit x86 optimized
* `murmurHash64`     - MurmurHash v2 64bit platform (x64 or x86) optimized
* `murmurHash64x64`  - MurmurHash v2 64bit x64 optimized
* `murmurHash64x86`  - MurmurHash v2 64bit x86 optimized

Provided functions share the following signature:

```js
murmurHash(data[, callback])
murmurHash(data, output[, offset[, length]][, callback])
murmurHash(data{String}, encoding|output_type[, callback])
murmurHash(data, output_type[, callback])
murmurHash(data, seed[, output[, offset[, length]]][, callback])
murmurHash(data, seed[, output_type][, callback])
murmurHash(data, output_type, seed[, callback])
murmurHash(data{String}, encoding, output[, offset[, length]][, callback])
murmurHash(data{String}, encoding, output_type[, callback])
murmurHash(data{String}, encoding, seed[, output[, offset[, length]]][, callback])
murmurHash(data{String}, encoding, seed[, output_type][, callback])

@param {string|Buffer} data - a byte-string to calculate hash from
@param {string} encoding - data string encoding, should be:
      'utf8', 'ucs2', 'ascii', 'hex', 'base64' or 'binary';
      'binary' by default
@param {Uint32} seed - murmur hash seed, 0 by default
@param {Buffer} output - a Buffer object to write hash bytes to;
      the same object will be returned
      the order of output bytes is platform dependent
@param {number} offset - start writing into output at offset byte;
      negative offset starts from the end of the output buffer
@param {number} length - a number of bytes to write from calculated hash;
      negative length starts from the end of the hash;
      if absolute value of length is greater than the size of a calculated
      hash, bytes are written only up to the hash size
@param {string} output_type - a string indicating return type:
      'number' - for murmurHash32 an unsigned 32-bit integer,
                 other hashes - hexadecimal string
      'hex'    - hexadecimal string
      'base64' - base64 string
      'binary' - binary string
      'buffer' - a new Buffer object;
      'number' by default
@param {Function} callback - optional callback(err, result)
      if provided the hash will be calculated asynchronously using libuv
      worker queue, the return value in this instance will be `undefined`
      and the result will be provided to the callback function;
      Be carefull as reading and writing by multiple threads to the same
      memory may render undetermined results

The order of bytes written to a Buffer is platform independent.

`data` and `output` arguments might reference the same Buffer object
or buffers referencing the same memory (views).

@return {number|Buffer|String|undefined}
```

Significant changes in 3.x
--------------------------

The most important change is full platform indifference of rendered output. In 2.x output hash as binary data provided via buffer was endian sensitive. Starting with 3.x the data written to output buffer is always MSB (byte) first.

The "hex", "base64" and "binary" output types has been (re)added, but this time with sane definition.

So in this version the following is true on all platforms:

```js
assert.strictEqual(murmurHash('foo', 'buffer').toString('hex'), murmurHash('foo', 0, 'hex'));
assert.strictEqual(murmurHash('foo', 'buffer').toString('base64'), murmurHash('foo', 0, 'base64'));
```

Significant changes in 2.x
--------------------------

The 1.x output types were very confusing. E.g. "hex" was just an equivalent of `murmurHash(data, "buffer").toString("hex")` which renders incorrect hexadecimal number. So all the string output type encodings: "utf8", "ucs2", "ascii", "hex", "base64" and "binary" were completely removed in 2.0 as being simply useless.

The "number" output type has been adapted to all variants in a way more compatible with other murmurhash [implementations][murmurhash3js]. For 32bit hash the return value is an unsigned 32-bit integer (it was signed integer in 1.x) and for other hashes it's a hexadecimal number.

The "buffer" output type wasn't modified except that the default output is now "number" for all of the hashes.

Additionally when passing unsupported value to `encoding` or `output_type` argument the function throws `TypeError`.

Another breaking change is for the BE platforms. Starting with 2.0 endian-ness is supported, so hashes should be consistent regardless of the cpu type.

Since v2.1 the callback argument was introduced.

Promises
--------

The native murmurHash functions run asynchronously if the last argument is a callback.
However if you wish to use promises there is a promisify wrapper available:

```js
var mm = require('murmurhash-native/promisify')();
mm.murmurHash32Async( 'hash me!', 0x12345789 )
      .then(hash => { assert.equal(hash, 1908692277) });
// Promise { <pending> }
```

You may provide your own promise constructor:

```js
var bluebird = require('bluebird');
var mm = require('murmurhash-native/promisify')(bluebird);
mm.murmurHash32Async( 'hash me!', 0x12345789 )
      .then(hash => { assert.equal(hash, 1908692277) });
// Promise {
//   _bitField: 0,
//   _fulfillmentHandler0: undefined,
//   _rejectionHandler0: undefined,
//   _promise0: undefined,
//   _receiver0: undefined }
```

Bugs, limitations, caveats
--------------------------
When working with Buffers, no data is being copied, however for strings this is unavoidable.
For strings with byte-length < 1kB the static buffer is provided to avoid mem-allocs.

The hash functions optimized for x64 and x86 produce different results.

Tested with nodejs: v0.10, v0.11, v0.12, iojs-3, v4, v5 and v6.

[Build Status]: https://travis-ci.org/royaltm/node-murmurhash-native
[BS img]: https://travis-ci.org/royaltm/node-murmurhash-native.svg
[NPM img]: https://nodei.co/npm/murmurhash-native.png?compact=true
[NPM Status]: https://nodei.co/npm/murmurhash-native/
[murmurhash3js]: https://www.npmjs.com/package/murmurhash3js

MurmurHash bindings for node
============================

This library provides Austin Appleby's non-cryptographic "MurmurHash" hashing algorithm functions in a few different flavours.

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
murmurHash( 'hash me!', 0x12345789, 'hex' ) // '3555c471'
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
murmurHash(data)
murmurHash(data<string>, input_encoding)
murmurHash(data<Buffer>, output_type)
murmurHash(data, seed[, output_type])
murmurHash(data, input_encoding, seed|output_type)
murmurHash(data, input_encoding, seed, output_type)

@param {string|Buffer} data - a byte-string to calculate hash from
@param {string} input_encoding - input data string encoding, can be:
      'utf8', 'ucs2', 'ascii', 'hex', 'base64' or 'binary',
      ignored if data is an instance of a Buffer,
      default is 'binary'
@param {Uint32} seed - murmur hash seed, default is 0
@param {string} output_type - how to encode output, can be:
      'number' (murmurHash32 only) - 32-bit integer,
      'buffer' - Buffer output,
      'utf8', 'ucs2', 'ascii', 'hex', 'base64' or 'binary' - string output,
      default is 'number' or 'buffer'

@return {number|Buffer|String}
```

Bugs, limitations, caveats
--------------------------
When working with Buffers, no data is being copied, however for strings this is unavoidable.
For strings with byte-length < 1kB the static buffer is provided to avoid mem-allocs.

The hash functions optimized for x64 and x86 produce different results. The same applies to LSB/MSB.

Tested on nodejs: v0.8, v0.10 and v0.11.

FIXME: Trying to use 'hex', 'base64' or 'ucs2' encoding on node v0.8 crashes node::DecodeWrite().

[Build Status]: https://travis-ci.org/royaltm/node-murmurhash-native
[BS img]: https://travis-ci.org/royaltm/node-murmurhash-native.svg

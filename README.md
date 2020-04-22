MurmurHash bindings for node
============================

This library provides Austin Appleby's non-cryptographic "MurmurHash" hashing algorithm functions in a few different flavours.

[![NPM][NPM img]][NPM Status]
[![Node][Node img]][NPM Status]
[![Travis][Travis img]][Travis Status]
[![AppVeyor][AppVeyor img]][AppVeyor Status]
[![License][License img]][License Link]

Key features:

* blocking and asynchronous api interfaces
* additional MurmurHash3 32 and 128 bit progressive implementations based on [PMurHash][PMurHash]
* stream wrapper for progressive hasher with [crypto.Hash-like][crypto.Hash] bi-api interface
* serializable state of the progressive hasher
* BE or LE byte order variants of hashes
* promise wrapper
* prebuilt binaries for most standard system configurations
* TypeScript declarations ([docs][typescript-docs])

Install:
--------

There are prebuilt [binaries][releases] available for painless installation on
some Linuxes (x64), OS-X (x64) and Windows (x64 and x86) thanks to [node-pre-gyp][node-pre-gyp] and [node-pre-gyp-github][node-pre-gyp-github].

```
npm install murmurhash-native
```

If the prebuilt release is not available for your system or nodejs version,
the compilation from source will kick-in. For more information on building from
source please consult [this page][node-gyp-install].

If for some reason (e.g. an incompatible GLIBC) you might want to force building from source, type:

```
npm i murmurhash-native --build-from-source
```

To reinstall prebuilt binary (e.g. after switching between major nodejs versions):

```
npm rebuild --update-binary
```

TypeScript
----------

`murmurhash-native` is [ready][typescript-docs] for the TypeScript without any external declarations. However this module is node-specific package, if you're going to use it in TypeScript, do not forget to include `@types/node` and enable `es2015` language features in your `tsconfig.json`.

Make a hash:
------------

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

// asynchronous

murmurHash( 'hash me!', function(err, hash) { assert.equal(hash, 2061152078) });

// output byte order (default is BE)

var murmurHashLE = require('murmurhash-native').LE.murmurHash;
murmurHashLE( 'hash me!', 0x12345789, 'buffer' ) // <Buffer 35 55 c4 71>
murmurHashLE( 'hash me!', 0x12345789, 'hex' ) // '3555c471'
```

These functions are awaiting your command:

* `murmurHash`       - MurmurHash v3 32bit
* `murmurHash32`     - (an alias of murmurHash)
* `murmurHash128`    - MurmurHash v3 128bit platform (x64 or x86) optimized 
* `murmurHash128x64` - MurmurHash v3 128bit x64 optimized
* `murmurHash128x86` - MurmurHash v3 128bit x86 optimized
* `murmurHash64`     - MurmurHash v2 64bit platform (x64 or x86) optimized
* `murmurHash64x64`  - MurmurHash v2 64bit x64 optimized
* `murmurHash64x86`  - MurmurHash v2 64bit x86 optimized

and they share the following signature:

```js
murmurHash(data[, callback])
murmurHash(data, output[, offset[, length]][, callback])
murmurHash(data{string}, encoding|output_type[, seed][, callback])
murmurHash(data{Buffer}, output_type[, seed][, callback])
murmurHash(data, seed[, callback])
murmurHash(data, seed, output[, offset[, length]][, callback])
murmurHash(data, seed, output_type[, callback])
murmurHash(data, encoding, output_type[, callback])
murmurHash(data{string}, encoding, output[, offset[, length]][, callback])
murmurHash(data{string}, encoding, seed[, callback])
murmurHash(data{string}, encoding, seed, output[, offset[, length]][, callback])
murmurHash(data{string}, encoding, seed, output_type[, callback])
```

* `@param` `{string|Buffer}` `data` - a byte-string to calculate hash from
* `@param` `{string}` `encoding` - data string encoding, should be:
    "utf8", "ucs2", "ascii", "hex", "base64" or "binary";
    "binary" by default
* `@param` `{Uint32}` `seed` - murmur hash seed, 0 by default
* `@param` `{Buffer}` `output` - a Buffer object to write hash bytes to;
    the same object will be returned
* `@param` `{number}` `offset` - start writing into output at offset byte;
    negative offset starts from the end of the output buffer
* `@param` `{number}` `length` - a number of bytes to write from calculated hash;
    negative length starts from the end of the hash;
    if absolute value of length is larger than the size of calculated
    hash, bytes are written only up to the hash size
* `@param` `{string}` `output_type` - a string indicating return type:
    - "number" - (default) for murmurHash32 an unsigned 32-bit integer,
               other hashes - hexadecimal string
    - "hex"    - hexadecimal string
    - "base64" - base64 string
    - "binary" - binary string
    - "buffer" - a new Buffer object;
* `@param` `{string}` `encoding|output_type` - data string encoding
   or a return type; because some valid return types are also valid
   encodings, the only values recognized here for `output_type` are:
    - "number"
    - "buffer"
* `@param` `{Function}` `callback` - optional callback(err, result)
    if provided the hash will be calculated asynchronously using libuv
    worker queue, the return value in this instance will be `undefined`
    and the result will be provided to the callback function;
    Be carefull as reading and writing by multiple threads to the same
    memory may render undetermined results

* `@return` `{number|Buffer|String|undefined}`

The order of bytes written to a Buffer or encoded string depends on
function's endianness.

`data` and `output` arguments might reference the same Buffer object
or buffers referencing the same memory (views).


There are additional namespaces, each for different variant of function endianness:

* `BE` - big-endian (most significant byte first or network byte order)
* `LE` - little-endian (least significant byte first)
* `platform` - compatible with `os.endianness()`

Functions in the root namespace are big-endian.


Streaming and incremental api
-----------------------------

The dual-api interface for progressive MurmurHash3 is available as a submodule:

```js
var murmur = require('murmurhash-native/stream');
````

Incremental (a.k.a. progressive) api

```js
var hash = murmur.createHash('murmurhash128x86');
hash.update('hash').digest('hex'); // '0d872bbf2cd001722cd001722cd00172'
hash.update(' me!').digest('hex'); // 'c7009299985a5627a9280372a9280372'

var hash = murmur.createHash('murmurhash128x86', {endianness: 'LE'});
hash.update('hash').digest('hex'); // 'bf2b870d7201d02c7201d02c7201d02c'
hash.update(' me!').digest('hex'); // '999200c727565a98720328a9720328a9'
```

Streaming api

```js
var hash = murmur.createHash('murmurhash32', {seed: 123, encoding: 'hex', endianness: 'platform'});
fs.createReadStream('README.md').pipe(hash).pipe(process.stdout);
```

### Serializable state

The incremental MurmurHash utilities may be serialized and later deserialized.
One may also copy a hasher's internal state onto another.
This way the hasher utility can be re-used to calculate a hash of some data
with already known prefix.

```js
var hash = murmur.createHash('murmurhash128x64').update('hash');
hash.digest('hex');                   // '4ab2e1e022f63e2e9add75dfcea2dede'

var backup = murmur.createHash(hash); // create a copy of a hash with the same internal state
backup.update(' me!').digest('hex');  // 'c43668294e89db0ba5772846e5804467'

hash.copy(backup)                     // copy hash's state onto the backup
    .update(' me!').digest('hex');    // 'c43668294e89db0ba5772846e5804467'

var serial = hash.serialize();        // serialize hash's state
serial == 'AAAAAAAAAAAAAAAAAAAAAGhzYWgAAAAAAAAAAAAAAFQAAAAEtd3X';
                                      // restore backup from serialized state
var backup = murmur.createHash('murmurhash128x64', {seed: serial});
backup.update(' me!').digest('hex');  // 'c43668294e89db0ba5772846e5804467'
                                      // finally
hash.update(' me!').digest('hex');    // 'c43668294e89db0ba5772846e5804467'
```

The dual-api with streaming is a javascript wrapper over the native module.
The native incremental module is directly available at `murmurhash-native/incremental`.

See [hasher.cc](src/incremental/hasher.cc) for full api description
(and there's some crazy templating going on there...).


Promises
--------

The native murmurHash functions run asynchronously if the last argument is a callback.
There is however a promisify wrapper:

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


Significant changes in 3.x
--------------------------

The most important change is full platform indifference of rendered output.
In 2.x output hash as binary data provided via buffer was endian sensitive.
Starting with 3.x the data written to output buffer is always MSB (byte) first.

The "hex", "base64" and "binary" output types has been (re)added, but this time
with a sane definition.

So in this version the following is true on all platforms:

```js
assert.strictEqual(murmurHash('foo', 'buffer').toString('hex'), murmurHash('foo', 0, 'hex'));
assert.strictEqual(murmurHash('foo', 'buffer').toString('base64'), murmurHash('foo', 0, 'base64'));
```


Significant changes in 2.x
--------------------------

The 1.x output types were very confusing. E.g. "hex" was just an equivalent of
`murmurHash(data, "buffer").toString("hex")` which rendered incorrect hexadecimal
number. So all the string output type encodings: "utf8", "ucs2", "ascii", "hex",
"base64" and "binary" were completely removed in 2.0 as being simply useless.

The "number" output type has been adapted to all variants in a way more compatible
with other murmurhash [implementations][murmurhash3js]. For 32bit hash the return
value is an unsigned 32-bit integer (it was signed integer in 1.x) and for other
hashes it's a hexadecimal number.

The "buffer" output type wasn't modified except that the default output is now
"number" for all of the hashes.

Additionally when passing unsupported value to `encoding` or `output_type`
argument the function throws `TypeError`.

Another breaking change is for the BE platforms. Starting with 2.0 endian-ness
is recognized, so hashes should be consistent regardless of the cpu type.

Since v2.1 the callback argument was introduced.


Bugs, limitations, caveats
--------------------------
When working with Buffers, input data is not being copied, however for strings
this is unavoidable. For strings with byte-length < 1kB the static buffer is
provided to avoid mem-allocs.

The hash functions optimized for x64 and x86 produce different results.

Tested on Linux (x64), OS X (x64) and MS Windows (x64 and x86).

This version provides binaries for nodejs: v10, v11, v12, v13 and v14.

For binaries of murmurhash-native for previous versions of nodejs, use version
3.4.1 or 3.3.0 of this module.

[Travis Status]: https://travis-ci.org/royaltm/node-murmurhash-native
[Travis img]: https://img.shields.io/travis/royaltm/node-murmurhash-native.svg?maxAge=86400&style=flat-square&label=unix
[AppVeyor img]: https://img.shields.io/appveyor/ci/royaltm/node-murmurhash-native.svg?maxAge=86400&style=flat-square&label=windows
[AppVeyor Status]: https://ci.appveyor.com/project/royaltm/node-murmurhash-native
[NPM img]: https://img.shields.io/npm/v/murmurhash-native.svg?maxAge=86400&style=flat-square
[NPM Status]: https://www.npmjs.com/package/murmurhash-native
[Node img]: https://img.shields.io/node/v/murmurhash-native.svg?maxAge=2592000&style=flat-square
[License img]: https://img.shields.io/npm/l/murmurhash-native.svg?maxAge=2592000&style=flat-square
[License Link]: https://opensource.org/licenses/MIT
[bitHound img]: https://img.shields.io/bithound/dependencies/github/royaltm/node-murmurhash-native.svg?maxAge=86400&style=flat-square
[murmurhash3js]: https://www.npmjs.com/package/murmurhash3js
[PMurHash]: https://github.com/aappleby/smhasher/blob/master/src/PMurHash.c
[crypto.Hash]: https://nodejs.org/dist/latest-v6.x/docs/api/crypto.html#crypto_class_hash
[node-pre-gyp]: https://github.com/mapbox/node-pre-gyp
[node-pre-gyp-github]: https://github.com/bchr02/node-pre-gyp-github
[releases]: https://github.com/royaltm/node-murmurhash-native/releases
[node-gyp-install]: https://github.com/nodejs/node-gyp#installation
[typescript-docs]: http://royaltm.github.io/node-murmurhash-native/globals.html
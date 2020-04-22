v3.5.0
* bump nan to 2.14.1, node-pre-gyp to 0.14.0
* bump development dependencies
* added binaries for node v13 and v14
* dropped binaries for node pre v10

v3.4.1
* restrict node to v6 or later

v3.4.0
* bump nan to 2.13 and remove v8 deprecation warnings suppression introduced in v3.2.5
* bump node-pre-gyp to 0.13 and node-pre-gyp-github to 1.4.3
* bump development dependencies
* bump typescript and typedoc dependencies
* added tests and binaries for node v12
* dropped support for node pre v6

v3.3.0

* TypeScript declarations, documentation and tests
* bump bluebird to 3.5.3, commander to 2.19.0 and tap to 12.1.0
* added development dependencies: typescript, @types, typedoc and typedoc plugins

v3.2.5

* bump node-pre-gyp to 0.11.0, nan to 2.11.1 and tap to 12.0.1
* adapt async uncaughtException tests to tap 12
* test and release binaries for node v11
* suppress v8 deprecation warnings from nan

v3.2.4

* bump node-pre-gyp to 0.10.3, commander to 2.17
* test and release binaries for nodejs v10
* replaced deprecated Buffer factory api in tests and benches with the class methods

v3.2.3

* bump nan to 2.10, node-pre-gyp to 0.9.1, tap to 9, commander to 2.15
* replaced deprecated synchronous Nan::Callback::Call with Nan::Call
* removed redundant const Nan::NAN_METHOD_ARGS_TYPE
* updated arguments to asynchronous Nan::Callback::Call
* dropped support for node pre v4 (broken node-gyp 0.12.18 on XCode LLVM 8.1)
  on other systems it might still work though - not looking into it anymore

v3.2.2

* bump nan to 2.7.0, node-pre-gyp to 0.6.39
* bump development dependencies
* replace deprecated Nan::ForceSet with Nan::DefineOwnProperty
* test and release binaries for node v8 and v9
* appveyor: pin npm version 5.3 for node v9 to workaround npm's issue #16649
* npmrc: turn off package-lock

v3.2.1

* bump nan to 2.6.2, node-pre-gyp to 0.6.34
* bump development dependencies
* test and release binaries for node v7
* appveyor: pin npm versions

v3.2.0

* bump nan to 2.3.5
* removed strcasecmp dependency
* asynchronous: static byte array for small strings added to the worker
* incremental async: static byte array for small strings added to the hasher
* incremental: endianness configurable via property and argument to the constructor
* variants of murmur hash functions producing BE (MSB) or LE (LSB) results

v3.1.1

* fix incremental async: ensure hasher is not GC'ed before worker completes
* fix incremental async: prevent from copying state over busy target

v3.1.0

* replaced MurmurHash3 implementation with PMurHash and PMurHash128
* new ability to update incremental hashers asynchronously via libuv
* stream implementation chooses sync vs async update depending on chunk size
* test: ensure persistence under gc stress
* bench: streaming

v3.0.4

* test cases: incremental digest() method with buffer output
* fix stream.js wrapper: missing support for offset and length in digest()

v3.0.3

* improved node-pre-gyp configuration so only essential binaries are being packaged

v3.0.2

* removed bundled dependencies

v3.0.1

* facilitate installation with prebuilt native binaries
* use "bindings" gem for finding native modules
* backward compatibility testing of serialized data
* c++ code cleanup: most of the precompiler macros replaces with type-safe constants
* js code cleanup with jshint
* remove iojs-3 from ci tests

v3.0.0

* results always in network order MSB (byte)
* restored output types: "hex" "base64" and "binary"
* incremental MurmurHash 3: 32bit, 128bit x86 and x64
* copyable and serializable state of incremental MurmurHash
* stream wrapper for incremental MurmurHash

v2.1.0

* new ability to calculate hashes asynchronously via libuv
* ensure correct byte alignment while directly writing to a buffer
* bench: asynchronous version
* promisify wrapper

v2.0.0

* output string encoding types removed
* "number" output type is a hex number for 64 and 128bit hashes
* "number" output type is the default output type for all hashes
* consistent hash regardless of platform endian-ness
* throws TypeError on incorrect encoding or output_type
* second string argument interpreted as an output type or encoding
* remove legacy pre v0.10 code

v1.0.2

* bump nan to 2.3.3, fixes node v6 buld

v1.0.1

* use nan converters instead of soon deprecated ->XValue()

v1.0.0

* bump nan to 2.0.9, fixes build with iojs-3 and node v4

v0.3.1

* bump nan to 1.8, fixes build with newset io.js

v0.3.0

* output Buffer, offset and length arguments
* use NODE_SET_METHOD macro to export functions

v0.2.1

* bump nan to 1.6, remove polyfill
* bench: compare with all crypto hashes

v0.2.0

* default input encoding changed from "utf8" to "binary"
* ensure default output type is "number" (32bit) or "buffer" (>32bit)
* decode "utf8" string faster on node >= 0.10
* handle some cases of 3 arguments better
* bench: compare with md5/sha1
* bench: string encoding argument

v0.1.1

* fix handling of non-ascii encoding argument string

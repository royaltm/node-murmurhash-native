v3.0.2

* removed bunded dependencies, as it troubles older npm

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

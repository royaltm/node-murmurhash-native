/*
  Test byteswap on LE machines
  requires that NODE_MURMURHASH_TEST_BYTESWAP=1 in binding.gyp
*/
"use strict";

var test = require("tap").test
  , byteOrderSwap = require('./byteorderswap')
  , hash = require('../..')
  , incr = require('../../incremental')
;

test("should have murmurHash functions", function(t) {
  testHash(t, hash.murmurHash32, "My hovercraft is full of eels.", 25, 'afb33896');
  testHash(t, hash.murmurHash32, "I will not buy this record, it is scratched.", 0, '9a2bd0a8');
  testHash(t, hash.murmurHash64x86, "I will not buy this record, it is scratched.", 0, "56c3338e1b075c45");
  testHash(t, hash.murmurHash64x64, "I will not buy this record, it is scratched.", 0, "ead99837ed0bcc9b");
  testHash(t, hash.murmurHash128x86, "I will not buy this tobacconist's, it is scratched.", 0, "a27b5b9b66783fefafde9a888ef9f300");
  testHash(t, hash.murmurHash128x64, "I will not buy this tobacconist's, it is scratched.", 0, "e32782bdab5406d3739607f02335d767");
  testHash(t, hash.LE.murmurHash32, "My hovercraft is full of eels.", 25, 'afb33896');
  testHash(t, hash.LE.murmurHash32, "I will not buy this record, it is scratched.", 0, '9a2bd0a8');
  testHash(t, hash.LE.murmurHash64x86, "I will not buy this record, it is scratched.", 0, "56c3338e1b075c45");
  testHash(t, hash.LE.murmurHash64x64, "I will not buy this record, it is scratched.", 0, "ead99837ed0bcc9b");
  testHash(t, hash.LE.murmurHash128x86, "I will not buy this tobacconist's, it is scratched.", 0, "a27b5b9b66783fefafde9a888ef9f300");
  testHash(t, hash.LE.murmurHash128x64, "I will not buy this tobacconist's, it is scratched.", 0, "e32782bdab5406d3739607f02335d767");
  testHashIncr(t, void(0), incr.MurmurHash, "My hovercraft is full of eels.", 25, 'afb33896');
  testHashIncr(t, void(0), incr.MurmurHash, "I will not buy this record, it is scratched.", 0, '9a2bd0a8');
  testHashIncr(t, void(0), incr.MurmurHash128x86, "I will not buy this tobacconist's, it is scratched.", 0, "a27b5b9b66783fefafde9a888ef9f300");
  testHashIncr(t, void(0), incr.MurmurHash128x64, "I will not buy this tobacconist's, it is scratched.", 0, "e32782bdab5406d3739607f02335d767");
  testHashIncr(t, 'LE', incr.MurmurHash, "My hovercraft is full of eels.", 25, 'afb33896');
  testHashIncr(t, 'LE', incr.MurmurHash, "I will not buy this record, it is scratched.", 0, '9a2bd0a8');
  testHashIncr(t, 'LE', incr.MurmurHash128x86, "I will not buy this tobacconist's, it is scratched.", 0, "a27b5b9b66783fefafde9a888ef9f300");
  testHashIncr(t, 'LE', incr.MurmurHash128x64, "I will not buy this tobacconist's, it is scratched.", 0, "e32782bdab5406d3739607f02335d767");
  t.end();
});

function testHash(t, murmurHash, input, seed, expectation) {
  // console.log(input);
  input = swap(input, murmurHash);
  // console.log(input);
  t.strictEqual(murmurHash(input, seed, 'hex'), expectation);
}

function testHashIncr(t, endian, MurmurHash, input, seed, expectation) {
  // console.log(input);
  input = swap(input, MurmurHash);
  // console.log(input);
  t.strictEqual(MurmurHash(seed, endian).update(input).digest('hex'), expectation);
}

function swap(value, hasher) {
  var buf = Buffer.from(value, "binary");
  switch(hasher.name.toLowerCase()) {
    case "murmurhash":
    case "murmurhash32":
    case "murmurhash64x86":
    case "murmurhash128x86":
      return byteOrderSwap(buf, 32, 0, buf.length & 0x7ffffffc).toString("binary");
    case "murmurhash64x64":
    case "murmurhash128x64":
      return byteOrderSwap(buf, 64, 0, buf.length & 0x7ffffff8).toString("binary");
    default:
      throw new Error("unknown function");
  }
}

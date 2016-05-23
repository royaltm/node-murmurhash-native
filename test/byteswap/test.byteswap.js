/*
  Test byteswap on LE machines
  requires that NODE_MURMURHASH_TEST_BYTESWAP=1 in binding.gyp
*/
"use strict";

var test = require("tap").test
  , hash = require('../..')
  , incr = require('../../incremental')
;

test("should have murmurHash functions", function(t) {
  testHash(t, hash.murmurHash32, "My hovercraft is full of eels.", 25, 2520298415);
  testHash(t, hash.murmurHash32, "I will not buy this record, it is scratched.", 0, 2832214938);
  testHash(t, hash.murmurHash64x86, "I will not buy this record, it is scratched.", 0, "455c071b8e33c356");
  testHash(t, hash.murmurHash64x64, "I will not buy this record, it is scratched.", 0, "9bcc0bed3798d9ea");
  testHash(t, hash.murmurHash128x86, "I will not buy this tobacconist's, it is scratched.", 0, "9b5b7ba2ef3f7866889adeaf00f3f98e");
  testHash(t, hash.murmurHash128x64, "I will not buy this tobacconist's, it is scratched.", 0, "d30654abbd8227e367d73523f0079673");
  testHashIncr(t, incr.MurmurHash, "My hovercraft is full of eels.", 25, 2520298415);
  testHashIncr(t, incr.MurmurHash, "I will not buy this record, it is scratched.", 0, 2832214938);
  testHashIncr(t, incr.MurmurHash128x86, "I will not buy this tobacconist's, it is scratched.", 0, "9b5b7ba2ef3f7866889adeaf00f3f98e");
  testHashIncr(t, incr.MurmurHash128x64, "I will not buy this tobacconist's, it is scratched.", 0, "d30654abbd8227e367d73523f0079673");
  t.end();
});

function testHash(t, murmurHash, input, seed, expectation) {
  // console.log(input);
  input = swap(input, murmurHash);
  // console.log(input);
  t.strictEqual(murmurHash(input, seed), expectation);
}

function testHashIncr(t, MurmurHash, input, seed, expectation) {
  // console.log(input);
  input = swap(input, MurmurHash);
  // console.log(input);
  t.strictEqual(MurmurHash(seed).update(input).digest('number'), expectation);
}

function swap(value, hasher) {
  switch(hasher.name.toLowerCase()) {
    case "murmurhash":
    case "murmurhash32":
    case "murmurhash64x86":
    case "murmurhash128x86":
      return swap32(value);
    case "murmurhash64x64":
    case "murmurhash128x64":
      return swap64(value);
    default:
      throw new Error("unknown function");
  }
}

function swap32(value) {
  var buf = new Buffer(value, "binary");
  var size = (buf.length & 0x7ffffffc) / 4;
  while(size-- > 0) {
    var offset = size * 4;
    buf.writeUInt32LE(buf.readUInt32BE(offset), offset);
  }
  return buf.toString("binary");
}

function swap64(value) {
  var buf = new Buffer(value, "binary");
  var size = (buf.length & 0x7ffffff8) / 8;
  while(size-- > 0) {
    var offset = size * 8;
    var val = buf.readUInt32BE(offset + 4);
    buf.writeUInt32LE(buf.readUInt32BE(offset), offset + 4);
    buf.writeUInt32LE(val, offset);
  }
  return buf.toString("binary");
}

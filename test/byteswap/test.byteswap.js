"use strict";

var test = require("tap").test
  , hash = require('../..')
;

test("should have murmurHash functions", function(t) {
  testHash(t, hash.murmurHash32, "My hovercraft is full of eels.", 25, 2520298415);
  testHash(t, hash.murmurHash32, "I will not buy this record, it is scratched.", 0, 2832214938);
  testHash(t, hash.murmurHash64x86, "I will not buy this record, it is scratched.", 0, "455c071b8e33c356");
  testHash(t, hash.murmurHash64x64, "I will not buy this record, it is scratched.", 0, "9bcc0bed3798d9ea");
  testHash(t, hash.murmurHash128x86, "I will not buy this tobacconist's, it is scratched.", 0, "9b5b7ba2ef3f7866889adeaf00f3f98e");
  testHash(t, hash.murmurHash128x64, "I will not buy this tobacconist's, it is scratched.", 0, "d30654abbd8227e367d73523f0079673");
  t.end();
});

function testHash(t, hash, input, seed, expectation) {
  console.log(input)
  input = swap(input, hash);
  console.log(input)
  if (Buffer.isBuffer(expectation)) {
    t.deepEqual(hash(input, seed), expectation);
  } else {
    t.strictEqual(hash(input, seed), expectation);
  }
}

function swap(value, hash) {
  switch(hash.name) {
    case "murmurHash32":
    case "murmurHash64x86":
    case "murmurHash128x86":
      return swap32(value);
    case "murmurHash64x64":
    case "murmurHash128x64":
      return swap64(value);
    default:
      throw new Error("unknown function")
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

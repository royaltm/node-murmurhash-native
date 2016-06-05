"use strict";

var assert = require('assert');

module.exports = function(buffer, wordnbits, offset, bytesize) {
  offset = offset>>>0;
  if (bytesize === void(0)) bytesize = buffer.length - offset;

  assert.equal(bytesize * 8 % wordnbits, 0);
  assert(offset + bytesize <= buffer.length);

  switch(wordnbits) {
    case 32:
      swap32(buffer.slice(offset, offset + bytesize));
      break;
    case 64:
      swap64(buffer.slice(offset, offset + bytesize));
      break;
    default: assert.fail(wordnbits, [32,64], undefined, 'one of');
  }

  return buffer;
}

function swap32(buffer) {
  if ('function' === typeof buffer.swap32) {
    buffer.swap32();
  } else {
    for(var offset = 0; offset < buffer.length; offset += 4) {
      buffer.writeUInt32LE(buffer.readUInt32BE(offset), offset);
    }
  }
}

function swap64(buffer) {
  var hi, lo;
  for(var offset = 0; offset < buffer.length; offset += 8) {
    hi = buffer.readUInt32BE(offset);
    lo = buffer.readUInt32BE(offset + 4);
    buffer.writeUInt32LE(lo, offset);
    buffer.writeUInt32LE(hi, offset + 4);
  }
}

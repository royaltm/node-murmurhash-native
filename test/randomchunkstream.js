"use strict";

var test = require("tap").test
var stream = require('stream');

var Readable = stream.Readable;
require('util').inherits(RandomChunkStream, Readable);

module.exports = RandomChunkStream;

function RandomChunkStream(options) {
  this.maxchunksize = options.maxchunksize>>>0;
  this.size = options.size>>>0;
  this.buffer = new Buffer(this.size);
  this.cursor = 0;
  Readable.call(this, options);
}

RandomChunkStream.prototype._read = function() {
  var buffer = this.buffer;
  var slicelen = (Math.random()*this.maxchunksize|0) + 1;
  var n = this.cursor;
  while(n < this.size && slicelen--) {
    buffer[n++] = (Math.random()*0x100)|0;
  }
  this.push(buffer.slice(this.cursor, n));
  this.cursor = n;
  if (n >= this.size)
    this.push(null);
};

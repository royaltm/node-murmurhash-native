"use strict";

var test = require("tap").test;
var RandomChunkStream = require('./randomchunkstream');
var stream = require('stream');

test("RandomChunkStream", function(t) {
  var s = new RandomChunkStream({size: 10000, maxchunksize:10});
  t.equal(s.size, 10000);
  t.equal(s.maxchunksize, 10);
  t.type(s.buffer, 'Buffer');
  t.equal(s.cursor, 0);
  var p = new stream.PassThrough({encoding:'binary'});
  var counts = 0, countp = 0, sizes = 0, sizep = 0;
  var destbuf = new Buffer(10000);
  var deststr = '';
  p.on('data', function(data) {
    t.type(data, 'string');
    t.ok(data.length <= 10);
    deststr += data;
    sizep += data.length;
    countp++;
  });
  s.pipe(p);
  s.on('data', function(data) {
    t.type(data, 'Buffer');
    t.ok(data.length <= 10);
    data.copy(destbuf, sizes);
    sizes += data.length;
    counts++;
  });
  s.on('end', function() {
    t.equal(sizes, 10000);
    t.ok(counts >= 10000/10 );
    t.equal(s.cursor, 10000);
    t.deepEqual(s.buffer, destbuf);
    p.on('end', function() {
      t.equal(sizep, 10000);
      t.ok(countp >= 10000/10 );
      t.strictEqual(s.buffer.toString('binary'), deststr);
      t.end();
    });
  });
});

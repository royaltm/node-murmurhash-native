"use strict";

if (!global.gc)
  throw new Error("run with --expose-gc");

var gc = global.gc;

var kMaxLength = require('buffer').kMaxLength;

var test = require("tap").test
  , incr = require('../../incremental')
;

[
 incr.MurmurHash,
 incr.MurmurHash128x64,
 incr.MurmurHash128x86
].forEach(function(MurmurHash) {

  test(MurmurHash.name + " should not crash while under gc stress", function(t) {
    var bigone = new Buffer(kMaxLength);
    MurmurHash().update(bigone, function(err) {
      t.error(err);
      t.end();
    });
    bigone = undefined;
    gc(); gc(); gc(); gc();
    setImmediate(gc);
  });

});

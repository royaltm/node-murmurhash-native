"use strict";

if (!global.gc)
  throw new Error("run with --expose-gc");

var gc = global.gc;

var kMaxLength = require('buffer').kMaxLength || 0x3fffffff;

var test = require("tap").test
  , hash = require('../..')
;

[
 hash.murmurHash,
 hash.murmurHash64x64,
 hash.murmurHash64x86,
 hash.murmurHash128x64,
 hash.murmurHash128x86
].forEach(function(murmurHash) {

  test(murmurHash.name + " should not crash while under gc stress (input)", function(t) {
    var bigone = Buffer.allocUnsafeSlow(kMaxLength);
    murmurHash(bigone, function(err) {
      t.error(err);
      gc(); gc(); gc(); gc();
      setImmediate(gc);
      setImmediate(function(){ t.end(); });
    });
    bigone = undefined;
    gc(); gc(); gc(); gc();
    gc(); gc(); gc(); gc();
    gc(); gc(); gc(); gc();
    setImmediate(gc);
    setImmediate(gc);
    setImmediate(gc);
    setImmediate(gc);
    setImmediate(gc);
  });

  test(murmurHash.name + " should not crash while under gc stress (input/output)", function(t) {
    var bigone = Buffer.allocUnsafeSlow(kMaxLength);
    var bigtwo = Buffer.allocUnsafeSlow(kMaxLength);
    murmurHash(bigone, bigtwo, 0, function(err) {
      t.error(err);
      gc(); gc(); gc(); gc();
      setImmediate(gc);
      setImmediate(function(){ t.end(); });
    });
    bigtwo = bigone = undefined;
    gc(); gc(); gc(); gc();
    gc(); gc(); gc(); gc();
    gc(); gc(); gc(); gc();
    setImmediate(gc);
    setImmediate(gc);
    setImmediate(gc);
    setImmediate(gc);
    setImmediate(gc);
  });

});

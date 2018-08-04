"use strict";

var os            = require("os")
  , crypto        = require("crypto")
  , test          = require("tap").test
  , byteOrderSwap = require("./byteswap/byteorderswap")
  , hash          = require('..')
;

[
  [4, 32, 'murmurHash'],
  [4, 32, 'murmurHash32'],
  [8, 64, 'murmurHash64x86'],
  [8, 64, 'murmurHash64x64'],
  [16, 32, 'murmurHash128x86'],
  [16, 64, 'murmurHash128x64']
].forEach(function(args)  {

  var size                = args[ 0]
    , wordBits            = args[ 1]
    , name                = args[ 2]
    , murmurHash          = hash[name]
    , murmurHashBE        = hash.BE[name]
    , murmurHashLE        = hash.LE[name]
    , murmurHashCPU       = hash.platform[name]
    , murmurHashOS        = hash[os.endianness()][name]
;

  test(name, function(t) {

    t.type(murmurHash, 'function');
    t.type(murmurHashBE, 'function');
    t.type(murmurHashLE, 'function');
    t.type(murmurHashCPU, 'function');
    t.type(murmurHashOS, 'function');

    t.test('should render same results', function(t) {
      t.plan(6*2*(1 + 3));

      var seed = (Math.random() * 0xFFFFFFFF >>>0) + 1;

      ['', Buffer.alloc(0), crypto.randomBytes(10007), crypto.randomBytes(10007).toString('binary'), crypto.randomBytes(Math.random() * 100>>>0), crypto.randomBytes(Math.random() * 100>>>0).toString('binary')]
      .forEach(function(input) {
        t.deepEqual(murmurHash(input, seed, 'buffer'), murmurHashBE(input, seed, 'buffer'));
        ['hex', 'binary', 'base64'].forEach(function(encoding) {
          t.strictEqual(murmurHash(input, seed, encoding), murmurHashBE(input, seed, encoding));
        });

        t.deepEqual(murmurHashCPU(input, seed, 'buffer'), murmurHashOS(input, seed, 'buffer'));
        ['hex', 'binary', 'base64'].forEach(function(encoding) {
          t.strictEqual(murmurHashCPU(input, seed, encoding), murmurHashOS(input, seed, encoding));
        });
      });
    });

    t.test('should render swapped results', function(t) {
      t.plan(6*(2 + 3*2));

      var seed = (Math.random() * 0xFFFFFFFF >>>0) + 1;

      ['', Buffer.alloc(0), crypto.randomBytes(10007), crypto.randomBytes(10007).toString('binary'), crypto.randomBytes(Math.random() * 100>>>0), crypto.randomBytes(Math.random() * 100>>>0).toString('binary')]
      .forEach(function(input) {
        t.deepEqual(
            murmurHashLE(input, seed, 'buffer'),
            byteOrderSwap(
              murmurHashBE(input, seed, 'buffer'), wordBits, 0, size));
        t.deepEqual(
            byteOrderSwap(
              murmurHashLE(input, seed, 'buffer'), wordBits, 0, size),
            murmurHashBE(input, seed, 'buffer'));
        ['hex', 'binary', 'base64'].forEach(function(encoding) {
          t.strictEqual(
            murmurHashLE(input, seed, encoding),
            byteOrderSwap(Buffer.from(
              murmurHashBE(input, seed, encoding), encoding), wordBits, 0, size).toString(encoding));
          t.strictEqual(
            byteOrderSwap(Buffer.from(
              murmurHashLE(input, seed, encoding), encoding), wordBits, 0, size).toString(encoding),
            murmurHashBE(input, seed, encoding));
        });
      });
    });

    t.end();
  });

});

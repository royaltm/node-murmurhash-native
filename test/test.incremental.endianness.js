"use strict";

var os            = require("os")
  , crypto        = require("crypto")
  , test          = require("tap").test
  , byteOrderSwap = require("./byteswap/byteorderswap")
  , incr          = require('../incremental')
;

var endianness    = os.endianness();

[
  [4, 32, 'MurmurHash'],
  [16, 32, 'MurmurHash128x86'],
  [16, 64, 'MurmurHash128x64']
].forEach(function(args)  {

  var size                = args[ 0]
    , wordBits            = args[ 1]
    , name                = args[ 2]
    , MurmurHash          = incr[name]
;

  test(name, function(t) {

    t.type(MurmurHash, 'function');

    t.test('should render same results', function(t) {
      t.plan(6*2*(2 + 3*2));

      var seed = (Math.random() * 0xFFFFFFFF >>>0) + 1;

      ['', Buffer.alloc(0), crypto.randomBytes(10007), crypto.randomBytes(10007).toString('utf8'), crypto.randomBytes(Math.random() * 100>>>0), crypto.randomBytes(Math.random() * 100>>>0).toString('utf8')]
      .forEach(function(input) {

        t.deepEqual(
          new MurmurHash(seed).update(input).digest('buffer'),
          MurmurHash(seed, 'BE').update(input).digest('buffer'));
        t.deepEqual(
          MurmurHash(seed).update(input).digest('buffer'), 
          new MurmurHash(seed, 'BE').update(input).digest('buffer'));

        ['hex', 'binary', 'base64'].forEach(function(encoding) {
          t.strictEqual(
            new MurmurHash(seed).update(input).digest(encoding),
            MurmurHash(seed, 'BE').update(input).digest(encoding));
          t.strictEqual(
            MurmurHash(seed).update(input).digest(encoding),
            new MurmurHash(seed, 'BE').update(input).digest(encoding));
        });

        t.deepEqual(
          new MurmurHash(seed, 'platform').update(input).digest('buffer'),
          MurmurHash(seed, endianness).update(input).digest('buffer'));
        t.deepEqual(
          MurmurHash(seed, 'platform').update(input).digest('buffer'),
          new MurmurHash(seed, endianness).update(input).digest('buffer'));

        ['hex', 'binary', 'base64'].forEach(function(encoding) {
          t.strictEqual(
            new MurmurHash(seed, 'platform').update(input).digest(encoding),
            MurmurHash(seed, endianness).update(input).digest(encoding));
          t.strictEqual(
            MurmurHash(seed, 'platform').update(input).digest(encoding),
            new MurmurHash(seed, endianness).update(input).digest(encoding));
        });
      });
    });

    t.test('should render swapped results', function(t) {
      t.plan(6*(2 + 3*2));

      var seed = (Math.random() * 0xFFFFFFFF >>>0) + 1;

      ['', Buffer.alloc(0), crypto.randomBytes(10007), crypto.randomBytes(10007).toString('utf8'), crypto.randomBytes(Math.random() * 100>>>0), crypto.randomBytes(Math.random() * 100>>>0).toString('utf8')]
      .forEach(function(input) {

        t.deepEqual(
            new MurmurHash(seed, 'LE').update(input).digest('buffer'),
            byteOrderSwap(
              MurmurHash(seed, 'BE').update(input).digest('buffer'), wordBits, 0, size));
        t.deepEqual(
            byteOrderSwap(
              MurmurHash(seed, 'LE').update(input).digest('buffer'), wordBits, 0, size),
            new MurmurHash(seed, 'BE').update(input).digest('buffer'));

        ['hex', 'binary', 'base64'].forEach(function(encoding) {
          t.strictEqual(
            new MurmurHash(seed, 'LE').update(input).digest(encoding),
            byteOrderSwap(Buffer.from(
              MurmurHash(seed, 'BE').update(input).digest(encoding), encoding), wordBits, 0, size).toString(encoding));
          t.strictEqual(
            byteOrderSwap(Buffer.from(
              MurmurHash(seed, 'LE').update(input).digest(encoding), encoding), wordBits, 0, size).toString(encoding),
            new MurmurHash(seed, 'BE').update(input).digest(encoding));
        });
      });
    });

    t.end();
  });

});

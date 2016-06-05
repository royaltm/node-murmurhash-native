// jshint loopfunc:true
"use strict";

var os = require("os")
  , test = require("tap").test
  , byteOrderSwap = require("./byteswap/byteorderswap")
  , incr = require('../incremental')
  , strm = require('../stream')
  , hash = require('..')
;

test("should have murmurHash constructors", function(t) {
  t.type(incr.MurmurHash, 'function');
  t.strictEqual(incr.MurmurHash.name, 'MurmurHash');
  t.type(incr.MurmurHash128, 'function');
  t.type(incr.MurmurHash128x64, 'function');
  t.strictEqual(incr.MurmurHash128x64.name, 'MurmurHash128x64');
  t.type(incr.MurmurHash128x86, 'function');
  t.strictEqual(incr.MurmurHash128x86.name, 'MurmurHash128x86');
  t.end();
});

test("should not deserialize foreign serialized data", function(t) {
  var serial0 = incr.MurmurHash128x64().serialize();
  t.throws(function() { new incr.MurmurHash128x86(serial0); }, new TypeError("Incorrect serialized string"));
  t.throws(function() { new incr.MurmurHash(serial0); }, new TypeError("Incorrect size of the serialized string"));
  var serial1 = incr.MurmurHash128x86().serialize();
  t.throws(function() { new incr.MurmurHash128x64(serial1); }, new TypeError("Incorrect serialized string"));
  t.throws(function() { new incr.MurmurHash(serial1); }, new TypeError("Incorrect size of the serialized string"));
  var serial2 = incr.MurmurHash().serialize();
  t.throws(function() { new incr.MurmurHash128x86(serial2); }, new TypeError("Incorrect size of the serialized string"));
  t.throws(function() { new incr.MurmurHash128x64(serial2); }, new TypeError("Incorrect size of the serialized string"));
  t.end();
});

function wrapStream(name) {
  return function(seed, endian) {
    var hasher = (seed instanceof strm.MurmurHash)
               ? new strm.MurmurHash(seed, {endianness: endian})
               : new strm.MurmurHash(name, {seed: seed, endianness: endian});
    return hasher;
  };
}

[
  [4, 32, 'MurmurHash', void(0), incr.MurmurHash, incr.MurmurHash, hash.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      'e72d7f37'],
  [4, 32, 'MurmurHash', 'BE', incr.MurmurHash, incr.MurmurHash, hash.BE.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      'e72d7f37'],
  [4, 32, 'MurmurHash', 'LE', incr.MurmurHash, incr.MurmurHash, hash.LE.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '396ff181', 'b7284e51',
      '377f2de7'],
  [4, 32, 'MurmurHash (stream)', void(0), wrapStream('MurmurHash'), strm.MurmurHash, hash.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      'e72d7f37'],
  [4, 32, 'MurmurHash (stream)', 'BE', wrapStream('MurmurHash'), strm.MurmurHash, hash.BE.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      'e72d7f37'],
  [4, 32, 'MurmurHash (stream)', 'LE', wrapStream('MurmurHash'), strm.MurmurHash, hash.LE.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '396ff181', 'b7284e51',
      '377f2de7'],
  [16, 64, 'MurmurHash128x64', void(0), incr.MurmurHash128x64, incr.MurmurHash128x64, hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '18a573e78e997f9b0be9c4b4595e5875'],
  [16, 64, 'MurmurHash128x64', 'BE', incr.MurmurHash128x64, incr.MurmurHash128x64, hash.BE.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '18a573e78e997f9b0be9c4b4595e5875'],
  [16, 64, 'MurmurHash128x64', 'LE', incr.MurmurHash128x64, incr.MurmurHash128x64, hash.LE.murmurHash128x64,
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251',
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251',
      '9b7f998ee773a51875585e59b4c4e90b'],
  [16, 64, 'MurmurHash128x64 (stream)', void(0), wrapStream('MurmurHash128x64'), strm.MurmurHash, hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '18a573e78e997f9b0be9c4b4595e5875'],
  [16, 64, 'MurmurHash128x64 (stream)', 'BE', wrapStream('MurmurHash128x64'), strm.MurmurHash, hash.BE.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '18a573e78e997f9b0be9c4b4595e5875'],
  [16, 64, 'MurmurHash128x64 (stream)', 'LE', wrapStream('MurmurHash128x64'), strm.MurmurHash, hash.LE.murmurHash128x64,
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251',
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251',
      '9b7f998ee773a51875585e59b4c4e90b'],
  [16, 32, 'MurmurHash128x86', void(0), incr.MurmurHash128x86, incr.MurmurHash128x86, hash.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      'cf690ba00d5fb908b2978b4d8d77cbee'],
  [16, 32, 'MurmurHash128x86', 'BE', incr.MurmurHash128x86, incr.MurmurHash128x86, hash.BE.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      'cf690ba00d5fb908b2978b4d8d77cbee'],
  [16, 32, 'MurmurHash128x86', 'LE', incr.MurmurHash128x86, incr.MurmurHash128x86, hash.LE.murmurHash128x86,
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254',
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254',
      'a00b69cf08b95f0d4d8b97b2eecb778d'],
  [16, 32, 'MurmurHash128x86 (stream)', void(0), wrapStream('MurmurHash128x86'), strm.MurmurHash, hash.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      'cf690ba00d5fb908b2978b4d8d77cbee'],
  [16, 32, 'MurmurHash128x86 (stream)', 'BE', wrapStream('MurmurHash128x86'), strm.MurmurHash, hash.BE.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      'cf690ba00d5fb908b2978b4d8d77cbee'],
  [16, 32, 'MurmurHash128x86 (stream)', 'LE', wrapStream('MurmurHash128x86'), strm.MurmurHash, hash.LE.murmurHash128x86,
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254',
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254',
      'a00b69cf08b95f0d4d8b97b2eecb778d']
].forEach(function(args)  {
  var size                = args[ 0]
    , wordBits            = args[ 1]
    , label               = args[ 2]
    , endian              = args[ 3]
    , MurmurHash          = args[ 4]
    , klass               = args[ 5]
    , murmurHash          = args[ 6]
    , seedZeroNumber      = args[ 7]
    , seedMinusOneNumber  = args[ 8]
    , seedPlusOneNumber   = args[ 9]
    , seedZeroHex         = args[10]
    , seedMinusOneHex     = args[11]
    , seedPlusOneHex      = args[12]
    , crashTestHex        = args[13]
    , seedZeroBuffer      = new Buffer(seedZeroHex,  'hex')
    , seedMinusOneBuffer  = new Buffer(seedMinusOneHex, 'hex')
    , seedPlusOneBuffer   = new Buffer(seedPlusOneHex,  'hex')
    , seedZeroBase64      = seedZeroBuffer.toString('base64')
    , seedMinusOneBase64  = seedMinusOneBuffer.toString('base64')
    , seedPlusOneBase64   = seedPlusOneBuffer.toString('base64')
    , seedZeroBinary      = seedZeroBuffer.toString('binary')
    , seedMinusOneBinary  = seedMinusOneBuffer.toString('binary')
    , seedPlusOneBinary   = seedPlusOneBuffer.toString('binary')
;

  test(label, function(t) {

    t.type(MurmurHash, 'function');

    t.test("should create hasher", function(t) {
      var hasher = new MurmurHash();
      t.type(hasher, 'object');
      t.type(hasher, klass);
      t.type(hasher.update, 'function');
      t.type(hasher.digest, 'function');
      t.equal(hasher.total, 0);
      t.strictEqual(hasher.endianness, 'BE');
      t.type(hasher.SERIAL_BYTE_LENGTH, 'number');
      t.strictEqual(hasher.isBusy, false);
      if (klass === strm.MurmurHash) {
        t.deepEqual(Object.keys(hasher), ['_handle', '_options', 'SERIAL_BYTE_LENGTH']);
      } else {
        t.deepEqual(Object.keys(hasher), ['endianness', 'total', 'SERIAL_BYTE_LENGTH']);
      }
      t.strictEqual(hasher.total, 0);

      hasher = MurmurHash();
      t.type(hasher, 'object');
      t.type(hasher, klass);
      t.type(hasher.update, 'function');
      t.type(hasher.digest, 'function');
      t.equal(hasher.total, 0);
      t.strictEqual(hasher.endianness, 'BE');
      t.type(hasher.SERIAL_BYTE_LENGTH, 'number');
      t.strictEqual(hasher.isBusy, false);
      if (klass === strm.MurmurHash) {
        t.deepEqual(Object.keys(hasher), ['_handle', '_options', 'SERIAL_BYTE_LENGTH']);
      } else {
        t.deepEqual(Object.keys(hasher), ['endianness', 'total', 'SERIAL_BYTE_LENGTH']);
      }
      t.strictEqual(hasher.total, 0);

      t.end();
    });

    t.test("should create hasher with specified endianness", function(t) {
      var hasher = new MurmurHash(null, endian);
      t.type(hasher, 'object');
      t.type(hasher, klass);
      t.type(hasher.update, 'function');
      t.type(hasher.digest, 'function');
      t.equal(hasher.total, 0);
      t.strictEqual(hasher.endianness, endian || 'BE');
      t.type(hasher.SERIAL_BYTE_LENGTH, 'number');
      t.strictEqual(hasher.isBusy, false);
      if (klass === strm.MurmurHash) {
        t.deepEqual(Object.keys(hasher), ['_handle', '_options', 'SERIAL_BYTE_LENGTH']);
      } else {
        t.deepEqual(Object.keys(hasher), ['endianness', 'total', 'SERIAL_BYTE_LENGTH']);
      }
      t.strictEqual(hasher.total, 0);

      hasher = MurmurHash(0, endian, 'foo', 'bar', ['baz']);
      t.type(hasher, 'object');
      t.type(hasher, klass);
      t.type(hasher.update, 'function');
      t.type(hasher.digest, 'function');
      t.equal(hasher.total, 0);
      t.strictEqual(hasher.endianness, endian || 'BE');
      t.type(hasher.SERIAL_BYTE_LENGTH, 'number');
      t.strictEqual(hasher.isBusy, false);
      if (klass === strm.MurmurHash) {
        t.deepEqual(Object.keys(hasher), ['_handle', '_options', 'SERIAL_BYTE_LENGTH']);
      } else {
        t.deepEqual(Object.keys(hasher), ['endianness', 'total', 'SERIAL_BYTE_LENGTH']);
      }
      t.strictEqual(hasher.total, 0);

      hasher = MurmurHash(0, 'platform', 'foo', 'bar', ['baz']);
      t.type(hasher, 'object');
      t.type(hasher, klass);
      t.type(hasher.update, 'function');
      t.type(hasher.digest, 'function');
      t.equal(hasher.total, 0);
      t.strictEqual(hasher.endianness, os.endianness());
      hasher.endianness = 'Be';
      t.strictEqual(hasher.endianness, 'BE');
      hasher.endianness = 'Le';
      t.strictEqual(hasher.endianness, 'LE');
      hasher.endianness = 'pLaTfOrM';
      t.strictEqual(hasher.endianness, os.endianness());
      t.type(hasher.SERIAL_BYTE_LENGTH, 'number');
      t.strictEqual(hasher.isBusy, false);
      if (klass === strm.MurmurHash) {
        t.deepEqual(Object.keys(hasher), ['_handle', '_options', 'SERIAL_BYTE_LENGTH']);
      } else {
        t.deepEqual(Object.keys(hasher), ['endianness', 'total', 'SERIAL_BYTE_LENGTH']);
      }
      t.strictEqual(hasher.total, 0);

      t.end();
    });

    t.test('should throw error for bad arguments', function(t) {
      t.throws(function() { new MurmurHash(void(0), endian).update(); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash(void(0), endian).update({}); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash(void(0), endian).update([]); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash(void(0), endian).update(void(0)); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash(void(0), endian).update(null); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash(void(0), endian).update(true); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash(void(0), endian).update(false); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash(void(0), endian).update(0); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash(void(0), endian).update(1); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash(void(0), endian).update(-1); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash(void(0), endian).update(new Date()); }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash([], endian); }, new TypeError("Expected a seed number, MurmurHash instance or serialized state") );
      t.throws(function() { MurmurHash([], endian); }, new TypeError("Expected a seed number, MurmurHash instance or serialized state") );
      t.throws(function() { new MurmurHash({}, endian); }, new TypeError("Expected a seed number, MurmurHash instance or serialized state") );
      t.throws(function() { new MurmurHash(new Date(), endian); }, new TypeError("Expected a seed number, MurmurHash instance or serialized state") );
      t.throws(function() { new MurmurHash(true, endian); }, new TypeError("Expected a seed number, MurmurHash instance or serialized state") );
      t.throws(function() { new MurmurHash(false, endian); }, new TypeError("Expected a seed number, MurmurHash instance or serialized state") );
      t.throws(function() { new MurmurHash(void(0), ''); }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash(void(0), 'foo'); }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash(void(0), 0); }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash(void(0), []); }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash(void(0), {}); }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash(void(0), new Date()); }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash(void(0), true); }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash(void(0), false); }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash().endianness = ''; }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash().endianness = 'foo'; }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash().endianness = 0; }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash().endianness = []; }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash().endianness = {}; }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash().endianness = new Date(); }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash().endianness = true; }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash().endianness = false; }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash().endianness = null; }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.throws(function() { new MurmurHash().endianness = void(0); }, new TypeError("Unknown endianness: should be \"BE\", \"LE\" or \"platform\"") );
      t.notThrow(function() { new MurmurHash(); }, "nothing accepted" );
      t.notThrow(function() { new MurmurHash(null); }, "null accepted" );
      t.notThrow(function() { new MurmurHash(null, endian); }, "null with endian accepted" );
      t.notThrow(function() { new MurmurHash(null, null); }, "null with null accepted" );
      t.notThrow(function() { new MurmurHash(void(0)); }, "undefined accepted" );
      t.notThrow(function() { new MurmurHash(void(0), endian); }, "undefined with endian accepted" );
      t.notThrow(function() { new MurmurHash(void(0), void(0)); }, "undefined with undefined accepted" );
      t.notThrow(function() { new MurmurHash().endianness = endian || 'platform'; }, "allowed endianness" );
      t.notThrow(function() { new MurmurHash(void(0), endian).update("", "abcdefghijklmno"); }, "invalid encoding should be accepted" );
      t.notThrow(function() { new MurmurHash(void(0), endian).update("", "123456"); }, "invalid encoding should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash(void(0), endian).update("", "12345"); }, "invalid encoding should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash(void(0), endian).update("", "1234"); }, "invalid encoding should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash(void(0), endian).update("", "123"); }, "invalid encoding should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash(void(0), endian).update("", ""); }, "invalid encoding should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash(void(0), endian).digest(""); }, "invalid output type should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash(void(0), endian).digest("mumber"); }, "invalid output type should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash(void(0), endian).digest("xxxxxxx"); }, "invalid output type should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash(void(0), endian).digest("utf-8"); }, "invalid output type should be accepted and ignored" );
      var hasher = new MurmurHash(void(0), endian);
      t.notThrow(function() { hasher.digest(); }, "first digest ok" );
      t.notThrow(function() { hasher.update(''); }, "update ok" );
      t.notThrow(function() { hasher.digest(); }, "second digest ok" );
      t.notThrow(function() { hasher.update(''); }, "update ok" );
      t.notThrow(function() { hasher.digest(); }, "third digest ok" );

      t.end();
    });

    t.test('should create buffer hash from empty data', function(t) {
      t.deepEqual(new MurmurHash(void(0), endian).update('').digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(void(0), endian).digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).update('').digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(void(0), endian).update('').digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(void(0), endian).digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).update('').digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(void(0), endian).update('').digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(void(0), endian).digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).update('').digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(void(0), endian).update('').digest('utf8'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(void(0), endian).digest('utf8'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).update('').digest('utf8'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).digest('utf8'), seedZeroBuffer);
      t.strictEqual(new MurmurHash(void(0), endian).update('').digest('buffer').toString('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(void(0), endian).digest('buffer').toString('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(0, endian).update('').digest('buffer').toString('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(0, endian).digest('buffer').toString('hex'), seedZeroHex);
      t.deepEqual(new MurmurHash(void(0), endian).update(new Buffer('')).digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).update(new Buffer('')).digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(void(0), endian).update(new Buffer('')).digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).update(new Buffer('')).digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(void(0), endian).update(new Buffer('')).digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).update(new Buffer('')).digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(void(0), endian).update(new Buffer('')).digest('utf8'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0, endian).update(new Buffer('')).digest('utf8'), seedZeroBuffer);
      t.strictEqual(new MurmurHash(void(0), endian).update(new Buffer('')).digest('buffer').toString('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(0, endian).update(new Buffer('')).digest('buffer').toString('hex'), seedZeroHex);
      t.deepEqual(new MurmurHash(-1, endian).update('').digest('buffer'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1, endian).update('').digest(), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1, endian).update('').digest('foobar'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1, endian).update('').digest('utf8'), seedMinusOneBuffer);
      t.strictEqual(new MurmurHash(-1, endian).update('').digest('buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(new MurmurHash(-1, endian).update(new Buffer('')).digest('buffer'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1, endian).update(new Buffer('')).digest(), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1, endian).update(new Buffer('')).digest('foobar'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1, endian).update(new Buffer('')).digest('utf8'), seedMinusOneBuffer);
      t.strictEqual(new MurmurHash(-1, endian).update(new Buffer('')).digest('buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(new MurmurHash(4294967295, endian).update('').digest('buffer'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295, endian).update('').digest(), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295, endian).update('').digest('foobar'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295, endian).update('').digest('utf8'), seedMinusOneBuffer);
      t.strictEqual(new MurmurHash(4294967295, endian).update('').digest('buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(new MurmurHash(4294967295, endian).update(new Buffer('')).digest('buffer'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295, endian).update(new Buffer('')).digest(), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295, endian).update(new Buffer('')).digest('foobar'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295, endian).update(new Buffer('')).digest('utf8'), seedMinusOneBuffer);
      t.strictEqual(new MurmurHash(4294967295, endian).update(new Buffer('')).digest('buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(new MurmurHash(4294967296, endian).update('').digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296, endian).update('').digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296, endian).update('').digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296, endian).update('').digest('utf8'), seedZeroBuffer);
      t.strictEqual(new MurmurHash(4294967296, endian).update('').digest('buffer').toString('hex'), seedZeroHex);
      t.deepEqual(new MurmurHash(4294967296, endian).update(new Buffer('')).digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296, endian).update(new Buffer('')).digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296, endian).update(new Buffer('')).digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296, endian).update(new Buffer('')).digest('utf8'), seedZeroBuffer);
      t.strictEqual(new MurmurHash(4294967296, endian).update(new Buffer('')).digest('buffer').toString('hex'), seedZeroHex);
      t.deepEqual(new MurmurHash(1, endian).update('').digest('buffer'), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1, endian).update('').digest(), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1, endian).update('').digest('foobar'), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1, endian).update('').digest('utf8'), seedPlusOneBuffer);
      t.strictEqual(new MurmurHash(1, endian).update('').digest('buffer').toString('hex'), seedPlusOneHex);
      t.deepEqual(new MurmurHash(1, endian).update(new Buffer('')).digest('buffer'), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1, endian).update(new Buffer('')).digest(), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1, endian).update(new Buffer('')).digest('foobar'), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1, endian).update(new Buffer('')).digest('utf8'), seedPlusOneBuffer);
      t.strictEqual(new MurmurHash(1, endian).update(new Buffer('')).digest('buffer').toString('hex'), seedPlusOneHex);

      t.end();
    });

    t.test('should create number hash from empty data', function(t) {
      t.strictEqual(new MurmurHash(void(0), endian).update('').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(0, endian).update('').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(void(0), endian).update('', 'foo').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(0, endian).update('', 'foo').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(void(0), endian).update(new Buffer('')).digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(0, endian).update(new Buffer('')).digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(void(0), endian).update(new Buffer(''), 'foo').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(0, endian).update(new Buffer(''), 'foo').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(-1, endian).update('').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(-1, endian).update('', 'foo').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(-1, endian).update(new Buffer('')).digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(-1, endian).update(new Buffer(''), 'foo').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(4294967295, endian).update('').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(4294967295, endian).update('', 'foo').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(4294967295, endian).update(new Buffer('')).digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(4294967295, endian).update(new Buffer(''), 'number').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(4294967296, endian).update('').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(4294967296, endian).update('', 'foo').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(4294967296, endian).update(new Buffer('')).digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(4294967296, endian).update(new Buffer(''), 'number').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(1, endian).update('').digest('number'), seedPlusOneNumber);
      t.strictEqual(new MurmurHash(1, endian).update('', 'foo').digest('number'), seedPlusOneNumber);
      t.strictEqual(new MurmurHash(1, endian).update(new Buffer('')).digest('number'), seedPlusOneNumber);
      t.strictEqual(new MurmurHash(1, endian).update(new Buffer(''), 'foo').digest('number'), seedPlusOneNumber);

      t.end();
    });

    t.test('should create string encoded hash from empty data', function(t) {
      t.strictEqual(new MurmurHash(void(0), endian).update('').digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(0, endian).update('').digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(void(0), endian).update(new Buffer('')).digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(0, endian).update(new Buffer('')).digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(-1, endian).update('').digest('hex'), seedMinusOneHex);
      t.strictEqual(new MurmurHash(-1, endian).update(new Buffer('')).digest('hex'), seedMinusOneHex);
      t.strictEqual(new MurmurHash(4294967295, endian).update('').digest('hex'), seedMinusOneHex);
      t.strictEqual(new MurmurHash(4294967295, endian).update(new Buffer('')).digest('hex'), seedMinusOneHex);
      t.strictEqual(new MurmurHash(4294967296, endian).update('').digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(4294967296, endian).update(new Buffer('')).digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(1, endian).update('').digest('hex'), seedPlusOneHex);
      t.strictEqual(new MurmurHash(1, endian).update(new Buffer('')).digest('hex'), seedPlusOneHex);
      t.strictEqual(new MurmurHash(void(0), endian).update('').digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(0, endian).update('').digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(void(0), endian).update(new Buffer('')).digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(0, endian).update(new Buffer('')).digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(-1, endian).update('').digest('base64'), seedMinusOneBase64);
      t.strictEqual(new MurmurHash(-1, endian).update(new Buffer('')).digest('base64'), seedMinusOneBase64);
      t.strictEqual(new MurmurHash(4294967295, endian).update('').digest('base64'), seedMinusOneBase64);
      t.strictEqual(new MurmurHash(4294967295, endian).update(new Buffer('')).digest('base64'), seedMinusOneBase64);
      t.strictEqual(new MurmurHash(4294967296, endian).update('').digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(4294967296, endian).update(new Buffer('')).digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(1, endian).update('').digest('base64'), seedPlusOneBase64);
      t.strictEqual(new MurmurHash(1, endian).update(new Buffer('')).digest('base64'), seedPlusOneBase64);
      t.strictEqual(new MurmurHash(void(0), endian).update('').digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(0, endian).update('').digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(void(0), endian).update(new Buffer('')).digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(0, endian).update(new Buffer('')).digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(-1, endian).update('').digest('binary'), seedMinusOneBinary);
      t.strictEqual(new MurmurHash(-1, endian).update(new Buffer('')).digest('binary'), seedMinusOneBinary);
      t.strictEqual(new MurmurHash(4294967295, endian).update('').digest('binary'), seedMinusOneBinary);
      t.strictEqual(new MurmurHash(4294967295, endian).update(new Buffer('')).digest('binary'), seedMinusOneBinary);
      t.strictEqual(new MurmurHash(4294967296, endian).update('').digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(4294967296, endian).update(new Buffer('')).digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(1, endian).update('').digest('binary'), seedPlusOneBinary);
      t.strictEqual(new MurmurHash(1, endian).update(new Buffer('')).digest('binary'), seedPlusOneBinary);

      t.end();
    });

    t.test('should utilize different string input encodings', function(t) {
      var string = "\u1220łóżko"
        , base64 = '4YigxYLDs8W8a28='
        , hex = 'e188a0c582c3b3c5bc6b6f'
        , hash = murmurHash(string, 'utf8', 'buffer');
      t.deepEqual(new MurmurHash(void(0), endian).update(string).digest(), hash);
      t.deepEqual(new MurmurHash(void(0), endian).update(new Buffer(string, 'utf8')).digest(), hash);
      t.deepEqual(new MurmurHash(void(0), endian).update(string, 'ascii').digest(),
         new MurmurHash(void(0), endian).update(new Buffer(string, 'ascii')).digest());
      t.deepEqual(new MurmurHash(void(0), endian).update(string, 'binary').digest(),
         new MurmurHash(void(0), endian).update(new Buffer(string, 'binary')).digest());
      t.deepEqual(new MurmurHash(void(0), endian).update(string, 'utf8').digest(),
         new MurmurHash(void(0), endian).update(new Buffer(string, 'utf8')).digest());
      t.deepEqual(new MurmurHash(void(0), endian).update(string, 'utf8').digest(), hash);
      t.deepEqual(new MurmurHash(void(0), endian).update(string, 'utf-8').digest(),
         new MurmurHash(void(0), endian).update(new Buffer(string, 'utf-8')).digest());
      t.deepEqual(new MurmurHash(void(0), endian).update(string, 'utf-8').digest(), hash);
      t.deepEqual(new MurmurHash(void(0), endian).update(string, 'ucs2').digest(),
         new MurmurHash(void(0), endian).update(new Buffer(string, 'ucs2')).digest());
      t.deepEqual(new MurmurHash(void(0), endian).update(string, 'ucs-2').digest(),
         new MurmurHash(void(0), endian).update(new Buffer(string, 'ucs-2')).digest());
      t.deepEqual(new MurmurHash(void(0), endian).update(string, 'utf16le').digest(),
         new MurmurHash(void(0), endian).update(new Buffer(string, 'utf16le')).digest());
      t.deepEqual(new MurmurHash(void(0), endian).update(string, 'utf-16le').digest(),
         new MurmurHash(void(0), endian).update(new Buffer(string, 'utf-16le')).digest());
      t.deepEqual(new MurmurHash(void(0), endian).update(base64, 'base64').digest(), hash);
      t.deepEqual(new MurmurHash(void(0), endian).update(base64, 'base64').digest(),
         new MurmurHash(void(0), endian).update(new Buffer(base64, 'base64')).digest());
      t.deepEqual(new MurmurHash(void(0), endian).update(hex, 'hex').digest(), hash);
      t.deepEqual(new MurmurHash(void(0), endian).update(hex, 'hex').digest(),
         new MurmurHash(void(0), endian).update(new Buffer(hex, 'hex')).digest());

      t.end();
    });

    t.test('should create hash from some random data', function(t) {
      var data = '';
      var strlen = 1000;
      for (var i = 0; i < strlen; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var buffer = new Buffer(data, 'utf8');
      t.equal(new MurmurHash(void(0), endian).update(data).digest().length, size);
      t.equal(new MurmurHash(void(0), endian).update(data).total, buffer.length);
      t.equal(new MurmurHash(void(0), endian).update(data).digest('buffer').length, size);
      t.equal(new MurmurHash(void(0), endian).update(buffer).digest().length, size);
      t.equal(new MurmurHash(void(0), endian).update(buffer).digest('buffer').length, size);
      t.equal(new MurmurHash(void(0), endian).update(buffer).total, buffer.length);
      t.strictEqual(new MurmurHash(void(0), endian).update(data, 'binary').digest('number'),
                    new MurmurHash(void(0), endian).update(new Buffer(data, 'binary')).digest('number'));
      t.strictEqual(new MurmurHash(void(0), endian).update(data, 'binary').digest('number'), murmurHash(data, 'binary'));
      t.strictEqual(new MurmurHash(void(0), endian).update(data).digest('number'),
                    new MurmurHash(void(0), endian).update(buffer).digest('number'));
      t.strictEqual(new MurmurHash(void(0), endian).update(data).digest('number'), murmurHash(buffer));
      t.strictEqual(new MurmurHash(-1, endian).update(data).digest('number'),
                    new MurmurHash(-1, endian).update(buffer).digest('number'));
      t.strictEqual(new MurmurHash(-1, endian).update(data).digest('number'), murmurHash(buffer, -1));
      t.strictEqual(new MurmurHash(-1, endian).update(data).digest('number'),
                    new MurmurHash(4294967295, endian).update(buffer).digest('number'));
      t.strictEqual(new MurmurHash(-1, endian).update(data).digest('number'), murmurHash(buffer, 4294967295));
      t.strictEqual(new MurmurHash(4294967295, endian).update(data).digest('number'),
                    new MurmurHash(-1, endian).update(buffer).digest('number'));
      t.strictEqual(new MurmurHash(4294967295, endian).update(data).digest('number'), murmurHash(buffer, -1));

      var seed = (Math.random()*4294967296)|0;
      t.notStrictEqual(new MurmurHash(seed, endian).update(data).digest(), new MurmurHash(seed, endian).update(buffer).digest('buffer'));
      t.notStrictEqual(new MurmurHash(seed, endian).update(data).digest(), murmurHash(buffer, seed, 'buffer'));
      t.deepEqual(new MurmurHash(seed, endian).update(data).digest('buffer'), new MurmurHash(seed, endian).update(buffer).digest());
      t.deepEqual(new MurmurHash(seed, endian).update(data).digest('buffer'), murmurHash(buffer, seed, 'buffer'));
      t.strictEqual(new MurmurHash(seed, endian).update(data).digest('number'), new MurmurHash(seed, endian).update(buffer).digest('number'));
      t.strictEqual(new MurmurHash(seed, endian).update(data).digest('number'), murmurHash(buffer, seed));

      t.end();
    });


    t.test('should not crash with utf8 characters in encoding string', function(t) {
      t.notThrow(function() {
        new MurmurHash(void(0), endian).update("łabądź",
                 "\u1010\u1111\u1212\u1313\u1414\u1515\u1616\u1717",
                 "\u1010\u1111\u1212\u1313\u1414\u1515\u1616\u1717").digest();
      }, "ignores encoding");
      var match = new MurmurHash(void(0), endian).update("łabądź", "utf8").digest("buffer");
      var hash = new MurmurHash(void(0), endian).update("łabądź").digest();
      t.deepEqual(hash, match);
      t.type(hash, Buffer, 'hash is buffer');
      t.deepEqual(hash, new Buffer(crashTestHex, 'hex'));

      t.end();
    });

    t.test('should write digest in the provided buffer', function(t) {
      var pad = new Buffer(2); pad.fill(42);
      var output = new Buffer(0);
      t.strictEqual(new MurmurHash(void(0), endian).digest(output), output);
      t.strictEqual(new MurmurHash(void(0), endian).digest(output, 3), output);
      t.strictEqual(new MurmurHash(void(0), endian).digest(output, 3, 3), output);
      t.strictEqual(new MurmurHash(void(0), endian).digest(output, 3, -3), output);
      t.strictEqual(new MurmurHash(void(0), endian).digest(output, -3), output);
      t.strictEqual(new MurmurHash(void(0), endian).digest(output, -3, 3), output);
      t.strictEqual(new MurmurHash(void(0), endian).digest(output, -3, -3), output);

      output = new Buffer(size);
      t.strictEqual(new MurmurHash(void(0), endian).digest(output), output);
      t.deepEqual(output, seedZeroBuffer);
      t.strictEqual(new MurmurHash(1, endian).digest(output), output);
      t.deepEqual(output, seedPlusOneBuffer);
      t.strictEqual(new MurmurHash(-1, endian).digest(output), output);
      t.deepEqual(output, seedMinusOneBuffer);
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, 2), output);
      t.deepEqual(output, Buffer.concat([pad, seedPlusOneBuffer.slice(0, -2)]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, 2, -size + 2), output);
      t.deepEqual(output, Buffer.concat([pad, seedPlusOneBuffer.slice(2)]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, -size-2), output);
      t.deepEqual(output, Buffer.concat([seedPlusOneBuffer.slice(2), pad]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, -size, size - 2), output);
      t.deepEqual(output, Buffer.concat([seedPlusOneBuffer.slice(0, -2), pad]));

      output = new Buffer(size + 2); output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output), output);
      t.deepEqual(output, Buffer.concat([seedPlusOneBuffer, pad]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, 2), output);
      t.deepEqual(output, Buffer.concat([pad, seedPlusOneBuffer]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, -size), output);
      t.deepEqual(output, Buffer.concat([pad, seedPlusOneBuffer]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, -size-2), output);
      t.deepEqual(output, Buffer.concat([seedPlusOneBuffer, pad]));

      output = new Buffer(size - 2); output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, 0), output);
      t.deepEqual(output, seedPlusOneBuffer.slice(0, size - 2));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output,  -size), output);
      t.deepEqual(output, seedPlusOneBuffer.slice(2));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, 0, -size + 2), output);
      t.deepEqual(output, seedPlusOneBuffer.slice(2));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, -size + 2, -size + 2), output);
      t.deepEqual(output, seedPlusOneBuffer.slice(2));

      output = new Buffer(3); output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, 0, 1), output);
      t.deepEqual(output, Buffer.concat([seedPlusOneBuffer.slice(0, 1), pad]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, 0, -3), output);
      t.deepEqual(output, seedPlusOneBuffer.slice(-3));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, -1), output);
      t.deepEqual(output, Buffer.concat([pad, seedPlusOneBuffer.slice(0, 1)]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, -4, 3), output);
      t.deepEqual(output, Buffer.concat([seedPlusOneBuffer.slice(1, 3), pad.slice(0, 1)]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, -4, -3), output);
      t.deepEqual(output, Buffer.concat([seedPlusOneBuffer.slice(-2), pad.slice(0, 1)]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, 1), output);
      t.deepEqual(output, Buffer.concat([pad.slice(0, 1), seedPlusOneBuffer.slice(0, 2)]));
      output.fill(42);
      t.strictEqual(new MurmurHash(1, endian).digest(output, 1, -2), output);
      t.deepEqual(output, Buffer.concat([pad.slice(0, 1), seedPlusOneBuffer.slice(-2)]));

      t.end();
    });

    t.test('should create hash from some random data incrementally', function(t) {
      var maxchunksize = 101;
      var buffer = new Buffer(10007);
      var seed = (Math.random()*4294967296)|0;
      var hasher0 = new MurmurHash(0, endian);
      var hasher1 = new MurmurHash(1, endian);
      var hasherS = new MurmurHash(seed, endian);
      var hasher0str = new MurmurHash(0, endian);
      var hasher1str = new MurmurHash(1, endian);
      var hasherSstr = new MurmurHash(seed, endian);
      var n = 0;
      while(n < buffer.length) {
        var p = n;
        var slicelen = (Math.random()*maxchunksize|0) + 1;
        for(var j = 0; j < slicelen; ++j) {
          if (n >= buffer.length) break;
          buffer[n++] = (Math.random()*0x100)|0;
        }
        hasher0.update(buffer.slice(p, n));
        hasher1.update(buffer.slice(p, n));
        hasherS.update(buffer.slice(p, n));
        hasher0str.update(buffer.slice(p, n).toString('binary'),'binary');
        hasher1str.update(buffer.slice(p, n).toString('binary'),'binary');
        hasherSstr.update(buffer.slice(p, n).toString('binary'),'binary');
      }
      t.equal(n, buffer.length);
      t.equal(n, 10007);
      t.equal(hasher0.total, buffer.length);
      t.equal(hasher1.total, buffer.length);
      t.equal(hasherS.total, buffer.length);
      t.equal(hasher0str.total, buffer.length);
      t.equal(hasher1str.total, buffer.length);
      t.equal(hasherSstr.total, buffer.length);
      var data = buffer.toString('binary');
      t.equal(new MurmurHash(void(0), endian).update(data, 'binary').digest().length, size);
      t.equal(new MurmurHash(void(0), endian).update(data, 'binary').total, buffer.length);
      t.equal(new MurmurHash(void(0), endian).update(data, 'binary').digest('buffer').length, size);
      t.equal(new MurmurHash(void(0), endian).update(buffer).digest().length, size);
      t.equal(new MurmurHash(void(0), endian).update(buffer).digest('buffer').length, size);
      t.equal(new MurmurHash(void(0), endian).update(buffer).total, buffer.length);
      t.strictEqual(new MurmurHash(void(0), endian).update(data, 'binary').digest('number'),
                    new MurmurHash(void(0), endian).update(buffer).digest('number'));
      var d0 = hasher0.digest('number');
      var d1 = hasher1.digest('number');
      var dS = hasherS.digest('number');
      var d0str = hasher0str.digest('number');
      var d1str = hasher1str.digest('number');
      var dSstr = hasherSstr.digest('number');
      t.notStrictEqual(d0, d1);
      t.notStrictEqual(d0, dS);
      t.strictEqual(d0, d0str);
      t.strictEqual(d1, d1str);
      t.strictEqual(dS, dSstr);
      t.strictEqual(d0, new MurmurHash(void(0), endian).update(buffer).digest('number'));
      t.strictEqual(d0, new MurmurHash(void(0), endian).update(data, 'binary').digest('number'));
      t.strictEqual(d0, murmurHash(buffer));
      t.strictEqual(d0, murmurHash(data));
      t.strictEqual(d1, new MurmurHash(1, endian).update(buffer).digest('number'));
      t.strictEqual(d1, new MurmurHash(1, endian).update(data, 'binary').digest('number'));
      t.strictEqual(d1, murmurHash(buffer, 1));
      t.strictEqual(d1, murmurHash(data, 1));
      t.strictEqual(dS, new MurmurHash(seed, endian).update(buffer).digest('number'));
      t.strictEqual(dS, new MurmurHash(seed, endian).update(data, 'binary').digest('number'));
      t.strictEqual(dS, murmurHash(buffer, seed));
      t.strictEqual(dS, murmurHash(data, seed));

      t.end();
    });

    t.test('should copy internal state and create instance from copy', function(t) {
      var seed = (Math.random() * 0xFFFFFFFF >>>0) + 1;
      var hasher0 = new MurmurHash(seed, endian).update('foo');
      t.throws(function() { hasher0.copy(); }, new TypeError("Target must be another instance of the same murmur hash type utility"));
      t.throws(function() { hasher0.copy([]); }, new TypeError("Target must be another instance of the same murmur hash type utility"));
      t.throws(function() { hasher0.copy({}); }, new TypeError("Target must be another instance of the same murmur hash type utility"));
      t.throws(function() { hasher0.copy(0); }, new TypeError("Target must be another instance of the same murmur hash type utility"));
      t.throws(function() { hasher0.copy(true); }, new TypeError("Target must be another instance of the same murmur hash type utility"));
      t.throws(function() { hasher0.copy(false); }, new TypeError("Target must be another instance of the same murmur hash type utility"));
      t.throws(function() { hasher0.copy(null); }, new TypeError("Target must be another instance of the same murmur hash type utility"));
      t.throws(function() { hasher0.copy(hasher0); }, new Error("Target must not be the same instance"));

      var hasher1 = new MurmurHash(hasher0);
      t.notStrictEqual(hasher1, hasher0);
      t.strictEqual(hasher1.endianness, hasher0.endianness);
      t.strictEqual(hasher0.digest('hex'), hasher1.digest('hex'));
      t.strictEqual(hasher0.update('bar').digest('hex'), hasher1.update('bar').digest('hex'));
      t.strictEqual(hasher0.digest('hex'), new MurmurHash(seed, endian).update('foobar').digest('hex'));
      t.strictEqual(hasher1.digest('hex'), new MurmurHash(seed, endian).update('foobar').digest('hex'));

      var hasher2 = new MurmurHash(0, endian === 'LE' ? 'BE' : 'LE');
      t.strictEqual(hasher2.digest('hex'), seedZeroHex);
      t.notStrictEqual(hasher2.endianness, hasher0.endianness);
      t.strictEqual(hasher0.copy(hasher2), hasher2);
      t.notStrictEqual(hasher2.endianness, hasher0.endianness);
      var digest2 = hasher2.digest('hex');
      var digest = new MurmurHash(seed, endian).update('foobar').digest();
      t.strictEqual(digest2, byteOrderSwap(digest, wordBits, 0, size).toString('hex'));
      hasher2.endianness = hasher0.endianness;
      t.strictEqual(hasher2.endianness, hasher0.endianness);
      t.strictEqual(hasher2.digest('hex'), new MurmurHash(seed, endian).update('foobar').digest('hex'));
      t.notStrictEqual(new MurmurHash(seed, endian).update('foobar').digest('hex'), seedZeroHex);

      t.end();
    });

    t.test('should serialize internal state and create instance from serial', function(t) {
      var seed = (Math.random() * 0xFFFFFFFF >>>0) + 1;
      var hasher0 = new MurmurHash(seed, endian).update('foo');
      t.throws(function() { hasher0.serialize(new Buffer(0)); }, new Error("Serialized state does not fit in the provided buffer at the given offset"));
      t.throws(function() { hasher0.serialize(new Buffer(1000), -1); }, new Error("Serialized state does not fit in the provided buffer at the given offset"));
      t.throws(function() { hasher0.serialize(new Buffer(1000), 998); }, new Error("Serialized state does not fit in the provided buffer at the given offset"));
      t.throws(function() { new MurmurHash('', endian); }, new TypeError("Incorrect size of the serialized string"));
      t.throws(function() { new MurmurHash('1234567890abcdef1', endian); }, new TypeError("Incorrect size of the serialized string"));
      var buffer = new Buffer(50); buffer.fill(0);
      t.throws(function() { new MurmurHash(buffer, endian); }, new TypeError("Incorrect serialized data"));
      t.throws(function() { new MurmurHash(new Buffer(11), endian); }, new TypeError("Incorrect size of the serialized data"));
      var serial0 = hasher0.serialize();
      t.type(serial0, 'string');
      buffer = new Buffer(serial0.length); buffer.fill(0);
      t.throws(function() { new MurmurHash(buffer.toString('binary'), endian); }, new TypeError("Incorrect serialized string"));
      t.throws(function() { new MurmurHash(buffer, endian); }, new TypeError("Incorrect serialized data"));
      var serial0bin = new Buffer(hasher0.SERIAL_BYTE_LENGTH);
      t.strictEqual(hasher0.serialize(serial0bin), serial0bin);
      var hasher1 = new MurmurHash(serial0, endian);
      t.notStrictEqual(hasher1, hasher0);
      t.strictEqual(hasher1.digest('hex'), hasher0.digest('hex'));
      t.strictEqual(hasher0.digest('hex'), new MurmurHash(seed, endian).update('foo').digest('hex'));
      t.strictEqual(hasher1.update('bar').digest('hex'), hasher0.update('bar').digest('hex'));
      t.strictEqual(hasher0.digest('hex'), new MurmurHash(seed, endian).update('foobar').digest('hex'));
      t.strictEqual(hasher1.digest('hex'), new MurmurHash(seed, endian).update('foobar').digest('hex'));
      var hasher2 = new MurmurHash(serial0bin, endian);
      t.strictEqual(hasher2.digest('hex'), new MurmurHash(seed, endian).update('foo').digest('hex'));
      t.strictEqual(hasher2.update('bar').digest('hex'), new MurmurHash(seed, endian).update('foobar').digest('hex'));
      buffer = new Buffer(serial0bin.length);
      for(var i = 0; i < serial0bin.length; ++i) {
        for(var n = 1; n < 0x100; n <<= 1) {
          serial0bin.copy(buffer);
          t.strictEqual(new MurmurHash(serial0bin, endian).update('bar').digest('hex'),
                        new MurmurHash(seed, endian).update('foobar').digest('hex'));
          buffer[i] = buffer[i] ^ n;
          t.throws(function() { new MurmurHash(buffer, endian); }, new TypeError("Incorrect serialized data"));
        }
      }

      t.end();
    });

    t.end();
  });

});

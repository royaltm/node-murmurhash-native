"use strict";

var test = require("tap").test
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

function wrapStream(name) {
  return function(seed, endian) {
    var hasher = (seed instanceof strm.MurmurHash)
               ? new strm.MurmurHash(seed, {endianness: endian})
               : new strm.MurmurHash(name, {seed: seed, endianness: endian});
    return hasher;
  };
}

[
  [4, 'MurmurHash', void(0), incr.MurmurHash, hash.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7'],
  [4, 'MurmurHash', 'BE', incr.MurmurHash, hash.BE.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7'],
  [4, 'MurmurHash', 'LE', incr.MurmurHash, hash.LE.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '396ff181', 'b7284e51'],
  [4, 'MurmurHash (stream)', void(0), wrapStream('MurmurHash'), hash.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7'],
  [4, 'MurmurHash (stream)', 'BE', wrapStream('MurmurHash'), hash.BE.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7'],
  [4, 'MurmurHash (stream)', 'LE', wrapStream('MurmurHash'), hash.LE.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '396ff181', 'b7284e51'],
  [16, 'MurmurHash128x64', void(0), incr.MurmurHash128x64, hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583'],
  [16, 'MurmurHash128x64', 'BE', incr.MurmurHash128x64, hash.BE.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583'],
  [16, 'MurmurHash128x64', 'LE', incr.MurmurHash128x64, hash.LE.murmurHash128x64,
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251',
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251'],
  [16, 'MurmurHash128x64 (stream)', void(0), wrapStream('MurmurHash128x64'), hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583'],
  [16, 'MurmurHash128x64 (stream)', 'BE', wrapStream('MurmurHash128x64'), hash.BE.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583'],
  [16, 'MurmurHash128x64 (stream)', 'LE', wrapStream('MurmurHash128x64'), hash.LE.murmurHash128x64,
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251',
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251'],
  [16, 'MurmurHash128x86', void(0), incr.MurmurHash128x86, hash.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9'],
  [16, 'MurmurHash128x86', 'BE', incr.MurmurHash128x86, hash.BE.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9'],
  [16, 'MurmurHash128x86', 'LE', incr.MurmurHash128x86, hash.LE.murmurHash128x86,
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254',
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254'],
  [16, 'MurmurHash128x86 (stream)', void(0), wrapStream('MurmurHash128x86'), hash.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9'],
  [16, 'MurmurHash128x86 (stream)', 'BE', wrapStream('MurmurHash128x86'), hash.BE.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9'],
  [16, 'MurmurHash128x86 (stream)', 'LE', wrapStream('MurmurHash128x86'), hash.LE.murmurHash128x86,
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254',
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254']
].forEach(function(args)  {
  var size                = args[ 0]
    , label               = args[ 1]
    , endian              = args[ 2]
    , MurmurHash          = args[ 3]
    , murmurHash          = args[ 4]
    , seedZeroNumber      = args[ 5]
    , seedMinusOneNumber  = args[ 6]
    , seedPlusOneNumber   = args[ 7]
    , seedZeroHex         = args[ 8]
    , seedMinusOneHex     = args[ 9]
    , seedPlusOneHex      = args[10]
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

    t.test('should not bail on error throw in a callback', function(t) {
      t.plan(4);
      var threw = t.hasOwnProperty('threw') ? t.threw : undefined;
      t.threw = function(error) {
        t.pass('threw async exception');
        if (threw === undefined)
          delete t.threw;
        else
          t.threw = threw;
        setImmediate(function() {
          t.strictEqual(error.message, "mana mana");
        });
      };
      t.strictEqual(undefined, MurmurHash(void(0), endian).update('', function(err) {
        t.error(err);
        throw new Error("mana mana");
      }));
    });

    t.test('should raise error for bad arguments', function(t) {
      t.plan(1+11*5+6*2);
      function cberrAsync(arg) {
        var hasher = new MurmurHash();
        hasher.endianness = endian || 'platform';
        t.strictEqual(undefined, hasher.update(arg, function(err) {
          t.type(err, TypeError);
          t.strictEqual(err.message, "string or Buffer is required");
          t.equal(hasher.isBusy, false);
        }));
        t.equal(hasher.isBusy, true);
      }
      function cberrNotThrow(err) {
        t.error(err);
      }
      t.throws(function() {
        new MurmurHash(null, endian).update(function() { t.error("should not be called") });
      }, new TypeError("string or Buffer is required") );
      cberrAsync(undefined);
      cberrAsync({});
      cberrAsync([]);
      cberrAsync(void(0));
      cberrAsync(null);
      cberrAsync(true);
      cberrAsync(false);
      cberrAsync(0);
      cberrAsync(1);
      cberrAsync(-1);
      cberrAsync(new Date());
      t.strictEqual(undefined, new MurmurHash(void(0), endian).update("", "abcdefghijklmno", cberrNotThrow));
      t.strictEqual(undefined, new MurmurHash(void(0), endian).update("", "123456", cberrNotThrow));
      t.strictEqual(undefined, new MurmurHash(void(0), endian).update("", "12345", cberrNotThrow));
      t.strictEqual(undefined, new MurmurHash(void(0), endian).update("", "1234", cberrNotThrow));
      t.strictEqual(undefined, new MurmurHash(void(0), endian).update("", "123", cberrNotThrow));
      t.strictEqual(undefined, new MurmurHash(void(0), endian).update("", "", cberrNotThrow));
    });

    t.test('should raise in-progress error', function(t) {
      t.plan(16);
      var hasher = new MurmurHash(void(0), endian);
      function cb1(err) {
        t.error(err);
        t.strictEqual(hasher.isBusy, false);
      }
      function cberr1(err) {
        t.type(err, Error);
        t.strictEqual(hasher.isBusy, true);
        t.strictEqual(err.message, "Asynchronous update still in progress");
      }
      t.strictEqual(hasher.isBusy, false);
      hasher.update('foobarbaz', cb1);
      t.strictEqual(hasher.isBusy, true);
      t.strictEqual(undefined, hasher.update('', cberr1));
      t.throws(function() { hasher.update(''); }, new Error("Asynchronous update still in progress") );
      t.throws(function() { hasher.digest(); }, new Error("Asynchronous update still in progress") );
      t.throws(function() { hasher.serialize(); }, new Error("Asynchronous update still in progress") );
      t.throws(function() { hasher.toJSON(); }, new Error("Asynchronous update still in progress") );
      t.throws(function() { hasher.copy(new MurmurHash(void(0), endian)); }, new Error("Asynchronous update still in progress") );
      t.throws(function() { new MurmurHash(void(0), endian).copy(hasher); }, new Error("Asynchronous update still in progress") );
      t.throws(function() { new MurmurHash(hasher); }, new Error("Asynchronous update still in progress") );
      t.throws(function() { MurmurHash(hasher, endian); }, new Error("Asynchronous update still in progress") );

    });

    t.test('should async update and create hash from empty data', function(t) {
      t.plan(12*12);
      function async(hasher, update, bufvalue, hexvalue, numvalue, base64value, binvalue) {
        t.strictEqual(undefined, hasher.update(update, function(err) {
          t.error(err);
          var result = hasher.digest();
          t.deepEqual(result, bufvalue);
          t.strictEqual(result.toString('hex'), hexvalue);
          t.deepEqual(hasher.digest('buffer'), bufvalue);
          t.deepEqual(hasher.digest('foobar'), bufvalue);
          t.deepEqual(hasher.digest('utf8'), bufvalue);
          t.deepEqual(hasher.digest('ucs2'), bufvalue);
          t.strictEqual(hasher.digest('number'), numvalue);
          t.strictEqual(hasher.digest('hex'), hexvalue);
          t.strictEqual(hasher.digest('base64'), base64value);
          t.strictEqual(hasher.digest('binary'), binvalue);
        }));
      }
      async(new MurmurHash(void(0), endian), '', seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(0, endian), '', seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(void(0), endian), new Buffer(''), seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(0, endian), new Buffer(''), seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(-1, endian), '', seedMinusOneBuffer, seedMinusOneHex, seedMinusOneNumber, seedMinusOneBase64, seedMinusOneBinary);
      async(new MurmurHash(-1, endian), new Buffer(''), seedMinusOneBuffer, seedMinusOneHex, seedMinusOneNumber, seedMinusOneBase64, seedMinusOneBinary);
      async(new MurmurHash(4294967295, endian), '', seedMinusOneBuffer, seedMinusOneHex, seedMinusOneNumber, seedMinusOneBase64, seedMinusOneBinary);
      async(new MurmurHash(4294967295, endian), new Buffer(''), seedMinusOneBuffer, seedMinusOneHex, seedMinusOneNumber, seedMinusOneBase64, seedMinusOneBinary);
      async(new MurmurHash(4294967296, endian), '', seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(4294967296, endian), new Buffer(''), seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(1, endian), '', seedPlusOneBuffer, seedPlusOneHex, seedPlusOneNumber, seedPlusOneBase64, seedPlusOneBinary);
      async(new MurmurHash(1, endian), new Buffer(''), seedPlusOneBuffer, seedPlusOneHex, seedPlusOneNumber, seedPlusOneBase64, seedPlusOneBinary);

    });

    t.test('should utilize different string input encodings', function(t) {
      t.plan(11*6);
      var string = "\u1220łóżko"
        , base64 = '4YigxYLDs8W8a28='
        , hex = 'e188a0c582c3b3c5bc6b6f';

      function async(string, encoding) {
        var hasher1 = new MurmurHash(void(0), endian);
        t.strictEqual(undefined, encoding ? hasher1.update(string, encoding, cb) : hasher1.update(string, cb));
        function cb(err) {
          t.error(err);
          encoding = encoding || 'utf8';
          var hasher2 = new MurmurHash(void(0), endian);
          t.strictEqual(undefined, hasher2.update(new Buffer(string, encoding), function(err) {
            t.error(err);
            t.deepEqual(hasher2.digest(), hasher1.digest());
            t.deepEqual(hasher2.digest(), murmurHash(string, encoding, 'buffer'));
          }));
        }
      }

      async(string);
      async(string, 'utf8');
      async(string, 'utf-8');
      async(string, 'ucs2');
      async(string, 'ucs-2');
      async(string, 'utf16le');
      async(string, 'utf-16le');
      async(string, 'ascii');
      async(string, 'binary');
      async(base64, 'base64');
      async(hex, 'hex');
    });

    t.test('should create hash from some random data', function(t) {
      t.plan(6*19);
      var data = '';
      var strlen = 1000;
      for (var i = 0; i < strlen; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var buffer = new Buffer(data, 'utf8');
      function async(seed) {
        var hasher1 = new MurmurHash(seed, endian);
        t.strictEqual(undefined, hasher1.update(data, function(err) {
          t.error(err);
          t.equal(hasher1.digest().length, size);
          t.equal(hasher1.total, buffer.length);
          t.deepEqual(hasher1.digest(), murmurHash(data, 'utf8', seed|0, 'buffer'));
          t.strictEqual(hasher1.digest('number'), murmurHash(data, 'utf8', seed));
          t.strictEqual(hasher1.digest('hex'), murmurHash(data, 'utf8', seed|0, 'hex'));
          t.strictEqual(hasher1.digest('base64'), murmurHash(data, 'utf8', seed|0, 'base64'));
          t.strictEqual(hasher1.digest('binary'), murmurHash(data, 'utf8', seed|0, 'binary'));
          var hasher2 = new MurmurHash(seed, endian);
          t.strictEqual(undefined, hasher2.update(buffer, function(err) {
            t.error(err);
            t.equal(hasher2.digest().length, size);
            t.equal(hasher2.total, buffer.length);
            t.deepEqual(hasher2.digest(), murmurHash(buffer, seed, 'buffer'));
            t.deepEqual(hasher2.digest(), hasher1.digest());
            t.strictEqual(hasher2.digest('number'), hasher1.digest('number'));
            t.strictEqual(hasher2.digest('hex'), hasher1.digest('hex'));
            t.strictEqual(hasher2.digest('base64'), hasher1.digest('base64'));
            t.strictEqual(hasher2.digest('binary'), hasher1.digest('binary'));
          }));
        }));
      }

      async();
      async(0);
      async(-1);
      async(1);
      async(4294967295);
      async((Math.random()*4294967296)|0);
    });

    t.test('should create hash from some random data incrementally', function(t) {
      t.plan(33);
      var maxchunksize = 101;
      var buffer = new Buffer(10007);
      var seed = (Math.random()*4294967296)|0;
      var hasher0 = new MurmurHash(0, endian);
      var hasher1 = new MurmurHash(1, endian);
      var hasherS = new MurmurHash(seed, endian);
      var hasher0str = new MurmurHash(0, endian);
      var hasher1str = new MurmurHash(1, endian);
      var hasherSstr = new MurmurHash(seed, endian);
      var lastErr = null;
      var n = 0;
      var feed = function() {
        if (n < buffer.length) {
          var p = n;
          var slicelen = (Math.random()*maxchunksize|0) + 1;
          for(var j = 0; j < slicelen; ++j) {
            if (n >= buffer.length) break;
            buffer[n++] = (Math.random()*0x100)|0;
          }
          var countdown = 0;
          var callback = function(err) {
            if (err) lastErr = err;
            if (!--countdown) feed();
          };
          hasher0.update(buffer.slice(p, n), callback); ++countdown;
          hasher1.update(buffer.slice(p, n), callback); ++countdown;
          hasherS.update(buffer.slice(p, n), callback); ++countdown;
          hasher0str.update(buffer.slice(p, n).toString('binary'), 'binary', callback); ++countdown;
          hasher1str.update(buffer.slice(p, n).toString('binary'), 'binary', callback); ++countdown;
          hasherSstr.update(buffer.slice(p, n).toString('binary'), 'binary', callback); ++countdown;
        } else
          check();
      };

      feed();

      function check() {
        t.error(lastErr);
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
      }
    });

    t.end();
  });

});

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
  return function(seed) {
    var hasher = (seed instanceof strm.MurmurHash)
               ? new strm.MurmurHash(seed)
               : new strm.MurmurHash(name, {seed: seed});
    return hasher;
  };
}

[
  [4, 'MurmurHash', incr.MurmurHash, hash.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7'],
  [4, 'MurmurHash (stream)', wrapStream('MurmurHash'), hash.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7'],
  [16, 'MurmurHash128x64', incr.MurmurHash128x64, hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583'],
  [16, 'MurmurHash128x64 (stream)', wrapStream('MurmurHash128x64'), hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583'],
  [16, 'MurmurHash128x86', incr.MurmurHash128x86, hash.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9'],
  [16, 'MurmurHash128x86 (stream)', wrapStream('MurmurHash128x86'), hash.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9']
].forEach(function(args)  {
  var size                = args[ 0]
    , label               = args[ 1]
    , MurmurHash          = args[ 2]
    , murmurHash          = args[ 3]
    , seedZeroNumber      = args[ 4]
    , seedMinusOneNumber  = args[ 5]
    , seedPlusOneNumber   = args[ 6]
    , seedZeroHex         = args[ 7]
    , seedMinusOneHex     = args[ 8]
    , seedPlusOneHex      = args[ 9]
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
      t.strictEqual(undefined, MurmurHash().update('', function(err) {
        t.error(err);
        throw new Error("mana mana");
      }));
    });

    t.test('should raise error for bad arguments', function(t) {
      t.plan(1+11*3+6*2);
      function cberr1(err) {
        t.type(err, TypeError);
        t.strictEqual(err.message, "string or Buffer is required");
      }
      function cberrNotThrow(err) {
        t.error(err);
      }
      t.throws(function() { new MurmurHash().update(cberr1); }, new TypeError("string or Buffer is required") );
      t.strictEqual(undefined, new MurmurHash().update(undefined, cberr1));
      t.strictEqual(undefined, new MurmurHash().update({}, cberr1));
      t.strictEqual(undefined, new MurmurHash().update([], cberr1));
      t.strictEqual(undefined, new MurmurHash().update(void(0), cberr1));
      t.strictEqual(undefined, new MurmurHash().update(null, cberr1));
      t.strictEqual(undefined, new MurmurHash().update(true, cberr1));
      t.strictEqual(undefined, new MurmurHash().update(false, cberr1));
      t.strictEqual(undefined, new MurmurHash().update(0, cberr1));
      t.strictEqual(undefined, new MurmurHash().update(1, cberr1));
      t.strictEqual(undefined, new MurmurHash().update(-1, cberr1));
      t.strictEqual(undefined, new MurmurHash().update(new Date(), cberr1));
      t.strictEqual(undefined, new MurmurHash().update("", "abcdefghijklmno", cberrNotThrow));
      t.strictEqual(undefined, new MurmurHash().update("", "123456", cberrNotThrow));
      t.strictEqual(undefined, new MurmurHash().update("", "12345", cberrNotThrow));
      t.strictEqual(undefined, new MurmurHash().update("", "1234", cberrNotThrow));
      t.strictEqual(undefined, new MurmurHash().update("", "123", cberrNotThrow));
      t.strictEqual(undefined, new MurmurHash().update("", "", cberrNotThrow));
    });

    t.test('should raise in-progress error', function(t) {
      t.plan(15);
      var hasher = new MurmurHash();
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
      t.throws(function() { hasher.copy(new MurmurHash()); }, new Error("Asynchronous update still in progress") );
      t.throws(function() { new MurmurHash(hasher); }, new Error("Asynchronous update still in progress") );
      t.throws(function() { MurmurHash(hasher); }, new Error("Asynchronous update still in progress") );

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
      async(new MurmurHash(), '', seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(0), '', seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(), new Buffer(''), seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(0), new Buffer(''), seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(-1), '', seedMinusOneBuffer, seedMinusOneHex, seedMinusOneNumber, seedMinusOneBase64, seedMinusOneBinary);
      async(new MurmurHash(-1), new Buffer(''), seedMinusOneBuffer, seedMinusOneHex, seedMinusOneNumber, seedMinusOneBase64, seedMinusOneBinary);
      async(new MurmurHash(4294967295), '', seedMinusOneBuffer, seedMinusOneHex, seedMinusOneNumber, seedMinusOneBase64, seedMinusOneBinary);
      async(new MurmurHash(4294967295), new Buffer(''), seedMinusOneBuffer, seedMinusOneHex, seedMinusOneNumber, seedMinusOneBase64, seedMinusOneBinary);
      async(new MurmurHash(4294967296), '', seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(4294967296), new Buffer(''), seedZeroBuffer, seedZeroHex, seedZeroNumber, seedZeroBase64, seedZeroBinary);
      async(new MurmurHash(1), '', seedPlusOneBuffer, seedPlusOneHex, seedPlusOneNumber, seedPlusOneBase64, seedPlusOneBinary);
      async(new MurmurHash(1), new Buffer(''), seedPlusOneBuffer, seedPlusOneHex, seedPlusOneNumber, seedPlusOneBase64, seedPlusOneBinary);

    });

    t.test('should utilize different string input encodings', function(t) {
      t.plan(11*6);
      var string = "\u1220łóżko"
        , base64 = '4YigxYLDs8W8a28='
        , hex = 'e188a0c582c3b3c5bc6b6f';

      function async(string, encoding) {
        var hasher1 = new MurmurHash();
        t.strictEqual(undefined, encoding ? hasher1.update(string, encoding, cb) : hasher1.update(string, cb));
        function cb(err) {
          t.error(err);
          encoding = encoding || 'utf8';
          var hasher2 = new MurmurHash();
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
        var hasher1 = new MurmurHash(seed);
        t.strictEqual(undefined, hasher1.update(data, function(err) {
          t.error(err);
          t.equal(hasher1.digest().length, size);
          t.equal(hasher1.total, buffer.length);
          t.deepEqual(hasher1.digest(), murmurHash(data, 'utf8', seed|0, 'buffer'));
          t.strictEqual(hasher1.digest('number'), murmurHash(data, 'utf8', seed));
          t.strictEqual(hasher1.digest('hex'), murmurHash(data, 'utf8', seed|0, 'hex'));
          t.strictEqual(hasher1.digest('base64'), murmurHash(data, 'utf8', seed|0, 'base64'));
          t.strictEqual(hasher1.digest('binary'), murmurHash(data, 'utf8', seed|0, 'binary'));
          var hasher2 = new MurmurHash(seed);
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
      var hasher0 = new MurmurHash(0);
      var hasher1 = new MurmurHash(1);
      var hasherS = new MurmurHash(seed);
      var hasher0str = new MurmurHash(0);
      var hasher1str = new MurmurHash(1);
      var hasherSstr = new MurmurHash(seed);
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
        t.equal(new MurmurHash().update(data, 'binary').digest().length, size);
        t.equal(new MurmurHash().update(data, 'binary').total, buffer.length);
        t.equal(new MurmurHash().update(data, 'binary').digest('buffer').length, size);
        t.equal(new MurmurHash().update(buffer).digest().length, size);
        t.equal(new MurmurHash().update(buffer).digest('buffer').length, size);
        t.equal(new MurmurHash().update(buffer).total, buffer.length);
        t.strictEqual(new MurmurHash().update(data, 'binary').digest('number'),
                      new MurmurHash().update(buffer).digest('number'));
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
        t.strictEqual(d0, new MurmurHash().update(buffer).digest('number'));
        t.strictEqual(d0, new MurmurHash().update(data, 'binary').digest('number'));
        t.strictEqual(d0, murmurHash(buffer));
        t.strictEqual(d0, murmurHash(data));
        t.strictEqual(d1, new MurmurHash(1).update(buffer).digest('number'));
        t.strictEqual(d1, new MurmurHash(1).update(data, 'binary').digest('number'));
        t.strictEqual(d1, murmurHash(buffer, 1));
        t.strictEqual(d1, murmurHash(data, 1));
        t.strictEqual(dS, new MurmurHash(seed).update(buffer).digest('number'));
        t.strictEqual(dS, new MurmurHash(seed).update(data, 'binary').digest('number'));
        t.strictEqual(dS, murmurHash(buffer, seed));
        t.strictEqual(dS, murmurHash(data, seed));
      }
    });

    t.end();
  });

});

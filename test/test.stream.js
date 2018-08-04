"use strict";

var test = require("tap").test
  , stream = require('stream')
  , strm = require('../stream')
  , hash = require('..')
  , RandomChunkStream = require('./randomchunkstream.js')
;

function testStream(hasher, data, encoding, cb) {
  if ('function' === typeof encoding) {
    cb = encoding; encoding = null;
  }
  hasher.end(data, encoding);
  hasher.on('readable', function() {
    var hash = hasher.read();
    hash && cb(hash);
  });
}

test("should have algorithms", function(t) {
  t.type(strm.getHashes, 'function');
  t.type(strm.getHashes(), Array);
  t.ok(strm.getHashes().length > 0);
  strm.getHashes().forEach(function(s) { t.type(s, 'string'); });
  t.end();
});

test('should throw error for bad arguments', function(t) {
  t.throws(function() { strm.createHash(); }, new TypeError("Must give algorithm string or MurmurHash instance") );
  t.throws(function() { strm.createHash("foo"); }, new Error("Algorithm not supported") );
  t.end();
});

[
  [4, 'murmurhash', hash.murmurHash,
      '00000000', '81f16f39', '514e28b7'],
  [4, 'murmurhash3a', hash.murmurHash,
      '00000000', '81f16f39', '514e28b7'],
  [4, 'murmurhash32', hash.murmurHash,
      '00000000', '81f16f39', '514e28b7'],
  [4, 'murmurhash32x86', hash.murmurHash,
      '00000000', '81f16f39', '514e28b7'],
  [16, 'murmurhash128x64', hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583'],
  [16, 'murmurhash128x86', hash.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9']
].forEach(function(args)  {
  var size                = args[ 0]
    , algorithm           = args[ 1]
    , murmurHash          = args[ 2]
    , seedZeroHex         = args[ 3]
    , seedMinusOneHex     = args[ 4]
    , seedPlusOneHex      = args[ 5]
    , seedZeroBuffer      = Buffer.from(seedZeroHex,  'hex')
    , seedMinusOneBuffer  = Buffer.from(seedMinusOneHex, 'hex')
    , seedPlusOneBuffer   = Buffer.from(seedPlusOneHex,  'hex')
    , seedZeroBase64      = seedZeroBuffer.toString('base64')
    , seedMinusOneBase64  = seedMinusOneBuffer.toString('base64')
    , seedPlusOneBase64   = seedPlusOneBuffer.toString('base64')
    , seedZeroBinary      = seedZeroBuffer.toString('binary')
    , seedMinusOneBinary  = seedMinusOneBuffer.toString('binary')
    , seedPlusOneBinary   = seedPlusOneBuffer.toString('binary')
;

  test(algorithm, function(t) {

    t.test("should have algorithm", function(t) {
      t.type(strm.createHash(algorithm), strm.MurmurHash);
      t.type(strm.createHash(algorithm.toUpperCase()), strm.MurmurHash);
      t.end();
    });

    t.test('should throw error for bad arguments', function(t) {
      t.throws(function() {
        strm.createHash(algorithm, {encoding:'xyz'}).write('');
      }, new Error("Unknown encoding: xyz") );
      t.end();
    });

    t.test('should create hex hash from empty data', function(t) {
      t.plan(20);
      function cbfactory(value) {
        return function(result) {
          t.strictEqual(result, value);
        };
      }
      testStream(strm.createHash(algorithm, {encoding:'hex'}), '', cbfactory(seedZeroHex));
      testStream(strm.createHash(algorithm, {encoding:'hex'}), '', 'binary', cbfactory(seedZeroHex));
      testStream(strm.createHash(algorithm, {encoding:'hex'}), Buffer.from(''), cbfactory(seedZeroHex));
      testStream(strm.createHash(algorithm, {encoding:'hex'}), Buffer.from(''), 'binary', cbfactory(seedZeroHex));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'hex'}), '', cbfactory(seedMinusOneHex));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'hex'}), '', 'binary', cbfactory(seedMinusOneHex));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'hex'}), Buffer.from(''), cbfactory(seedMinusOneHex));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'hex'}), Buffer.from(''), 'binary', cbfactory(seedMinusOneHex));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'hex'}), '', cbfactory(seedMinusOneHex));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'hex'}), '', 'binary', cbfactory(seedMinusOneHex));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'hex'}), Buffer.from(''), cbfactory(seedMinusOneHex));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'hex'}), Buffer.from(''), 'binary', cbfactory(seedMinusOneHex));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'hex'}), '', cbfactory(seedZeroHex));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'hex'}), '', 'binary', cbfactory(seedZeroHex));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'hex'}), Buffer.from(''), cbfactory(seedZeroHex));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'hex'}), Buffer.from(''), 'binary', cbfactory(seedZeroHex));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'hex'}), '', cbfactory(seedPlusOneHex));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'hex'}), '', 'binary', cbfactory(seedPlusOneHex));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'hex'}), Buffer.from(''), cbfactory(seedPlusOneHex));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'hex'}), Buffer.from(''), 'binary', cbfactory(seedPlusOneHex));
    });

    t.test('should create buffer hash from empty data', function(t) {
      t.plan(20);
      function cbfactory(value) {
        return function(result) {
          t.deepEqual(result, value);
        };
      }
      testStream(strm.createHash(algorithm), '', cbfactory(seedZeroBuffer));
      testStream(strm.createHash(algorithm), '', 'binary', cbfactory(seedZeroBuffer));
      testStream(strm.createHash(algorithm), Buffer.from(''), cbfactory(seedZeroBuffer));
      testStream(strm.createHash(algorithm), Buffer.from(''), 'binary', cbfactory(seedZeroBuffer));
      testStream(strm.createHash(algorithm, {seed:-1}), '', cbfactory(seedMinusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:-1}), '', 'binary', cbfactory(seedMinusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:-1}), Buffer.from(''), cbfactory(seedMinusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:-1}), Buffer.from(''), 'binary', cbfactory(seedMinusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:4294967295}), '', cbfactory(seedMinusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:4294967295}), '', 'binary', cbfactory(seedMinusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:4294967295}), Buffer.from(''), cbfactory(seedMinusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:4294967295}), Buffer.from(''), 'binary', cbfactory(seedMinusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:4294967296}), '', cbfactory(seedZeroBuffer));
      testStream(strm.createHash(algorithm, {seed:4294967296}), '', 'binary', cbfactory(seedZeroBuffer));
      testStream(strm.createHash(algorithm, {seed:4294967296}), Buffer.from(''), cbfactory(seedZeroBuffer));
      testStream(strm.createHash(algorithm, {seed:4294967296}), Buffer.from(''), 'binary', cbfactory(seedZeroBuffer));
      testStream(strm.createHash(algorithm, {seed:1}), '', cbfactory(seedPlusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:1}), '', 'binary', cbfactory(seedPlusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:1}), Buffer.from(''), cbfactory(seedPlusOneBuffer));
      testStream(strm.createHash(algorithm, {seed:1}), Buffer.from(''), 'binary', cbfactory(seedPlusOneBuffer));
    });

    t.test('should create string encoded hash from empty data', function(t) {
      t.plan(20*2);
      function cbfactory(value) {
        return function(result) {
          t.strictEqual(result, value);
        };
      }
      testStream(strm.createHash(algorithm, {encoding:'base64'}), '', cbfactory(seedZeroBase64));
      testStream(strm.createHash(algorithm, {encoding:'binary'}), '', cbfactory(seedZeroBinary));
      testStream(strm.createHash(algorithm, {encoding:'base64'}), '', 'binary', cbfactory(seedZeroBase64));
      testStream(strm.createHash(algorithm, {encoding:'binary'}), '', 'binary', cbfactory(seedZeroBinary));
      testStream(strm.createHash(algorithm, {encoding:'base64'}), Buffer.from(''), cbfactory(seedZeroBase64));
      testStream(strm.createHash(algorithm, {encoding:'binary'}), Buffer.from(''), cbfactory(seedZeroBinary));
      testStream(strm.createHash(algorithm, {encoding:'base64'}), Buffer.from(''), 'binary', cbfactory(seedZeroBase64));
      testStream(strm.createHash(algorithm, {encoding:'binary'}), Buffer.from(''), 'binary', cbfactory(seedZeroBinary));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'base64'}), '', cbfactory(seedMinusOneBase64));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'binary'}), '', cbfactory(seedMinusOneBinary));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'base64'}), '', 'binary', cbfactory(seedMinusOneBase64));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'binary'}), '', 'binary', cbfactory(seedMinusOneBinary));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'base64'}), Buffer.from(''), cbfactory(seedMinusOneBase64));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'binary'}), Buffer.from(''), cbfactory(seedMinusOneBinary));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'base64'}), Buffer.from(''), 'binary', cbfactory(seedMinusOneBase64));
      testStream(strm.createHash(algorithm, {seed:-1, encoding:'binary'}), Buffer.from(''), 'binary', cbfactory(seedMinusOneBinary));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'base64'}), '', cbfactory(seedMinusOneBase64));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'binary'}), '', cbfactory(seedMinusOneBinary));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'base64'}), '', 'binary', cbfactory(seedMinusOneBase64));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'binary'}), '', 'binary', cbfactory(seedMinusOneBinary));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'base64'}), Buffer.from(''), cbfactory(seedMinusOneBase64));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'binary'}), Buffer.from(''), cbfactory(seedMinusOneBinary));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'base64'}), Buffer.from(''), 'binary', cbfactory(seedMinusOneBase64));
      testStream(strm.createHash(algorithm, {seed:4294967295, encoding:'binary'}), Buffer.from(''), 'binary', cbfactory(seedMinusOneBinary));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'base64'}), '', cbfactory(seedZeroBase64));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'binary'}), '', cbfactory(seedZeroBinary));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'base64'}), '', 'binary', cbfactory(seedZeroBase64));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'binary'}), '', 'binary', cbfactory(seedZeroBinary));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'base64'}), Buffer.from(''), cbfactory(seedZeroBase64));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'binary'}), Buffer.from(''), cbfactory(seedZeroBinary));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'base64'}), Buffer.from(''), 'binary', cbfactory(seedZeroBase64));
      testStream(strm.createHash(algorithm, {seed:4294967296, encoding:'binary'}), Buffer.from(''), 'binary', cbfactory(seedZeroBinary));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'base64'}), '', cbfactory(seedPlusOneBase64));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'binary'}), '', cbfactory(seedPlusOneBinary));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'base64'}), '', 'binary', cbfactory(seedPlusOneBase64));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'binary'}), '', 'binary', cbfactory(seedPlusOneBinary));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'base64'}), Buffer.from(''), cbfactory(seedPlusOneBase64));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'binary'}), Buffer.from(''), cbfactory(seedPlusOneBinary));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'base64'}), Buffer.from(''), 'binary', cbfactory(seedPlusOneBase64));
      testStream(strm.createHash(algorithm, {seed:1, encoding:'binary'}), Buffer.from(''), 'binary', cbfactory(seedPlusOneBinary));
    });

    t.test('should utilize different string input encodings', function(t) {
      t.plan(17);
      function cbfactory(arg) {
        return function(result) {
          var result2 = murmurHash(arg, 'buffer');
          t.deepEqual(result, result2);
        };
      }
      function cbfactory2(value) {
        return function(result) {
          t.deepEqual(result, value);
        };
      }
      var string = "\u1220łóżko"
        , base64 = 'IELzfGtv'
        , hex = '2042f37c6b6f'
        , hash = murmurHash(string,'buffer');
      testStream(strm.createHash(algorithm), Buffer.from(string, 'binary'), cbfactory2(hash));
      testStream(strm.createHash(algorithm), string,  cbfactory(Buffer.from(string, 'binary')));
      testStream(strm.createHash(algorithm), string,  cbfactory(Buffer.from(string, 'binary')));
      testStream(strm.createHash(algorithm), string, 'ascii', cbfactory(Buffer.from(string, 'ascii')));
      testStream(strm.createHash(algorithm), string, 'ascii', cbfactory2(hash));
      testStream(strm.createHash(algorithm), string, 'binary', cbfactory(Buffer.from(string, 'binary')));
      testStream(strm.createHash(algorithm), string, 'binary', cbfactory2(hash));
      testStream(strm.createHash(algorithm), string, 'utf8', cbfactory(Buffer.from(string, 'utf8')));
      testStream(strm.createHash(algorithm), string, 'utf-8', cbfactory(Buffer.from(string, 'utf-8')));
      testStream(strm.createHash(algorithm), string, 'ucs2', cbfactory(Buffer.from(string, 'ucs2')));
      testStream(strm.createHash(algorithm), string, 'ucs-2', cbfactory(Buffer.from(string, 'ucs-2')));
      testStream(strm.createHash(algorithm), string, 'utf16le', cbfactory(Buffer.from(string, 'utf16le')));
      testStream(strm.createHash(algorithm), string, 'utf-16le', cbfactory(Buffer.from(string, 'utf-16le')));
      testStream(strm.createHash(algorithm), base64, 'base64', cbfactory2(hash));
      testStream(strm.createHash(algorithm), base64, 'base64', cbfactory(Buffer.from(base64, 'base64')));
      testStream(strm.createHash(algorithm), hex, 'hex', cbfactory2(hash));
      testStream(strm.createHash(algorithm), hex, 'hex', cbfactory(Buffer.from(hex, 'hex')));
    });

    t.test('should create hash from some random data', function(t) {
      t.plan(2+5+3);
      function cbfactoryLen() {
        return function(result) {
          t.equal(result.length, size);
        };
      }
      function cbfactory(arg, seed) {
        return function(result) {
          var result2 = (seed === undefined)
            ? murmurHash(arg, 0, 'hex')
            : murmurHash(arg, seed, 'hex');
          t.strictEqual(result, result2);
        };
      }
      function cbfactory2(assertion, arg, seed, output) {
        return function(result) {
          var result2 = murmurHash(arg, seed, output);
          t[assertion](result, result2);
        };
      }
      var data = '';
      for (var i = 0; i < 1000; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var buffer = Buffer.from(data, 'binary');
      testStream(strm.createHash(algorithm, {seed:0}), data, cbfactoryLen());
      testStream(strm.createHash(algorithm), buffer, cbfactoryLen());
      testStream(strm.createHash(algorithm, {encoding: 'hex'}), data, 'utf8', cbfactory(Buffer.from(data, 'utf8')));
      testStream(strm.createHash(algorithm, {encoding: 'hex'}), data, cbfactory(buffer));
      testStream(strm.createHash(algorithm, {seed: -1, encoding: 'hex'}), data, cbfactory(buffer, -1));
      testStream(strm.createHash(algorithm, {seed: -1, encoding: 'hex'}), data, cbfactory(buffer, 4294967295));
      testStream(strm.createHash(algorithm, {seed: 4294967295, encoding: 'hex'}), data, cbfactory(buffer, -1));

      var seed = (Math.random()*4294967296)|0;
      testStream(strm.createHash(algorithm, {seed: seed}), data, cbfactory2('notStrictEqual', buffer, seed, 'buffer'));
      testStream(strm.createHash(algorithm, {seed: seed}), data, cbfactory2('deepEqual', buffer, seed, 'buffer'));
      testStream(strm.createHash(algorithm, {seed: seed, encoding: 'hex'}), data, cbfactory2('strictEqual', buffer, seed, 'hex'));
    });

    [101, 10009, 32768].forEach(function(maxchunksize) {
      t.test('should create hash from some random data incrementally', function(t) {
        t.plan(4+11+7+17);
        var src = new RandomChunkStream({size: maxchunksize*23-1, maxchunksize:maxchunksize});
        var strsrc = new stream.PassThrough({encoding: 'binary'});
        var seed = (Math.random()*4294967296)|0;
        var hasher0 = strm.createHash(algorithm, {seed: 0, encoding: 'hex'});
        var hasher1 = strm.createHash(algorithm, {seed: 1, encoding: 'hex'});
        var hasherS = strm.createHash(algorithm, {seed: seed, encoding: 'hex'});
        var hasher0str = strm.createHash(algorithm, {seed: 0, encoding: 'hex'});
        var hasher1str = strm.createHash(algorithm, {seed: 1, encoding: 'hex'});
        var hasherSstr = strm.createHash(algorithm, {seed: seed, encoding: 'hex'});
        var bufchunks = 0, bufsize = 0;
        var strchunks = 0, strsize = 0;
        src.pipe(strsrc);
        src.pipe(hasher0);
        src.pipe(hasher1);
        src.pipe(hasherS);
        src.once('data', function(data) {
          t.type(data, 'Buffer');
          t.ok(data.length <= src.maxchunksize);
        }).on('data', function(data) {
          bufchunks++;
          bufsize += data.length;
        });
        strsrc.pipe(hasher0str);
        strsrc.pipe(hasher1str);
        strsrc.pipe(hasherSstr);
        strsrc.once('data', function(data) {
          t.type(data, 'string');
          t.ok(data.length <= src.maxchunksize);
        }).on('data', function(data) {
          strchunks++;
          strsize += data.length;
        });
        var countdown = 0;
        hasher0str.once('readable', done); ++countdown;
        hasher1str.once('readable', done); ++countdown;
        hasherSstr.once('readable', done); ++countdown;
        hasher0.once('readable', done); ++countdown;
        hasher1.once('readable', done); ++countdown;
        hasherS.once('readable', done); ++countdown;
        function done() {
          if (--countdown) return;
          var buffer = src.buffer;
          t.equal(bufsize, buffer.length);
          t.equal(strsize, buffer.length);
          t.equal(bufchunks, strchunks);
          t.ok(bufchunks >= src.size / src.maxchunksize);
          t.ok(strchunks >= src.size / src.maxchunksize);
          t.equal(hasher0str._handle.total, buffer.length);
          t.equal(hasher1str._handle.total, buffer.length);
          t.equal(hasherSstr._handle.total, buffer.length);
          t.equal(hasher0._handle.total, buffer.length);
          t.equal(hasher1._handle.total, buffer.length);
          t.equal(hasherS._handle.total, buffer.length);
          var data = buffer.toString('binary');
          t.equal(strm.createHash(algorithm).update(data, 'binary').digest().length, size);
          t.equal(strm.createHash(algorithm).update(data, 'binary').total, buffer.length);
          t.equal(strm.createHash(algorithm).update(data, 'binary').digest('buffer').length, size);
          t.equal(strm.createHash(algorithm).update(buffer).digest().length, size);
          t.equal(strm.createHash(algorithm).update(buffer).digest('buffer').length, size);
          t.equal(strm.createHash(algorithm).update(buffer).total, buffer.length);
          t.strictEqual(strm.createHash(algorithm).update(data, 'binary').digest('number'),
                        strm.createHash(algorithm).update(buffer).digest('number'));
          var d0 = hasher0.read();
          var d1 = hasher1.read();
          var dS = hasherS.read();
          var d0str = hasher0str.read();
          var d1str = hasher1str.read();
          var dSstr = hasherSstr.read();
          t.notStrictEqual(d0, d1);
          t.notStrictEqual(d0, dS);
          t.strictEqual(d0, d0str);
          t.strictEqual(d1, d1str);
          t.strictEqual(dS, dSstr);
          t.strictEqual(d0, strm.createHash(algorithm).update(buffer).digest('hex'));
          t.strictEqual(d0, strm.createHash(algorithm).update(data, 'binary').digest('hex'));
          t.strictEqual(d0, murmurHash(buffer, 0, 'hex'));
          t.strictEqual(d0, murmurHash(data, 0, 'hex'));
          t.strictEqual(d1, strm.createHash(algorithm, {seed: 1}).update(buffer).digest('hex'));
          t.strictEqual(d1, strm.createHash(algorithm, {seed: 1}).update(data, 'binary').digest('hex'));
          t.strictEqual(d1, murmurHash(buffer, 1, 'hex'));
          t.strictEqual(d1, murmurHash(data, 1, 'hex'));
          t.strictEqual(dS, strm.createHash(algorithm, {seed: seed}).update(buffer).digest('hex'));
          t.strictEqual(dS, strm.createHash(algorithm, {seed: seed}).update(data, 'binary').digest('hex'));
          t.strictEqual(dS, murmurHash(buffer, seed, 'hex'));
          t.strictEqual(dS, murmurHash(data, seed, 'hex'));
        }
      });
    });

    t.test('should JSON serialize and deserialize', function(t) {
      t.plan(3);
      var seed = (Math.random() * 0xFFFFFFFF >>>0) + 1;
      var hasher0 = strm.createHash(algorithm, {seed: seed, encoding: 'hex'});
      hasher0.write('foo');
      var json = JSON.stringify(hasher0);
      t.type(json, 'string');
      var hasher1 = strm.createHash(JSON.parse(json), {encoding: 'hex'});
      hasher0.once('readable', function() {
        var hash0 = hasher0.read();
        hasher1.once('readable', function() {
          var hash1 = hasher1.read();
          t.strictEqual(hash1, hash0);
          t.strictEqual(hash1, murmurHash('foo', seed, 'hex'));
        });
      });
      hasher0.end();
      hasher1.end();
    });

    t.end();
  });
});

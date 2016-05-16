var test = require("tap").test
  , incr = require('../incremental')
  , strm = require('../stream')
  , hash = require('..')
;

test("should have murmurHash constructors", function(t) {
  t.type(incr.MurmurHash, 'function');
  t.strictEqual(incr.MurmurHash.name, 'MurmurHash');
  t.end();
});

function wrapStream(name) {
  return function(seed) {
    var hasher = new strm.MurmurHash(name, seed);
    Object.defineProperty(hasher, 'total', {
      get: function() {
        return this._handle.total;
      }
    });
    return hasher;
  }
}

[
  [4, 'MurmurHash', incr.MurmurHash, incr.MurmurHash, hash.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      'e72d7f37'],
  [4, 'MurmurHash (stream)', wrapStream('MurmurHash'), strm.MurmurHash, hash.murmurHash,
               0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      'e72d7f37'],
  [16, 'MurmurHash128x64', incr.MurmurHash128x64, incr.MurmurHash128x64, hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '18a573e78e997f9b0be9c4b4595e5875'],
  [16, 'MurmurHash128x64 (stream)', wrapStream('MurmurHash128x64'), strm.MurmurHash, hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '18a573e78e997f9b0be9c4b4595e5875'],
].forEach(function(args)  {
  var size                = args[ 0]
    , label               = args[ 1]
    , MurmurHash          = args[ 2]
    , klass               = args[ 3]
    , murmurHash          = args[ 4]
    , seedZeroNumber      = args[ 5]
    , seedMinusOneNumber  = args[ 6]
    , seedPlusOneNumber   = args[ 7]
    , seedZeroHex         = args[ 8]
    , seedMinusOneHex     = args[ 9]
    , seedPlusOneHex      = args[10]
    , crashTestHex        = args[11]
    , seedZeroBuffer      = new Buffer(seedZeroHex,  'hex')
    , seedMinusOneBuffer  = new Buffer(seedMinusOneHex, 'hex')
    , seedPlusOneBuffer   = new Buffer(seedPlusOneHex,  'hex')
    , seedZeroBase64      = seedZeroBuffer.toString('base64')
    , seedMinusOneBase64  = seedMinusOneBuffer.toString('base64')
    , seedPlusOneBase64   = seedPlusOneBuffer.toString('base64')
    , seedZeroBinary      = seedZeroBuffer.toString('binary')
    , seedMinusOneBinary  = seedMinusOneBuffer.toString('binary')
    , seedPlusOneBinary   = seedPlusOneBuffer.toString('binary')

  test(label, function(t) {

    t.type(MurmurHash, 'function');

    t.test("should create hasher", function(t) {
      var hasher = new MurmurHash();
      t.type(hasher, 'object');
      t.type(hasher, klass);
      t.type(hasher.update, 'function');
      t.type(hasher.digest, 'function');
      t.strictEqual(hasher.total, 0);

      t.end();
    });

    t.test('should throw error for bad arguments', function(t) {
      t.throws(function() { new MurmurHash().update() }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash().update({}) }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash().update([]) }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash().update(void(0)) }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash().update(null) }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash().update(true) }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash().update(false) }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash().update(0) }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash().update(1) }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash().update(-1) }, new TypeError("string or Buffer is required") );
      t.throws(function() { new MurmurHash().update(new Date()) }, new TypeError("string or Buffer is required") );
      t.notThrow(function() { new MurmurHash().update("", "abcdefghijklmno") }, "invalid encoding should be accepted" );
      t.notThrow(function() { new MurmurHash().update("", "123456") }, "invalid encoding should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash().update("", "12345") }, "invalid encoding should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash().update("", "1234") }, "invalid encoding should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash().update("", "123") }, "invalid encoding should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash().update("", "") }, "invalid encoding should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash().digest("") }, "invalid output type should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash().digest("mumber") }, "invalid output type should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash().digest("xxxxxxx") }, "invalid output type should be accepted and ignored" );
      t.notThrow(function() { new MurmurHash().digest("utf-8") }, "invalid output type should be accepted and ignored" );
      var hasher = new MurmurHash();
      t.notThrow(function() { hasher.digest() }, "first digest ok" );
      t.throws(function() { hasher.update() }, new Error("Digest already called") );
      t.throws(function() { hasher.digest() }, new Error("Digest already called") );
      t.throws(function() { hasher.update() }, new Error("Digest already called") );
      t.throws(function() { hasher.digest() }, new Error("Digest already called") );

      t.end();
    });

    t.test('should create buffer hash from empty data', function(t) {
      t.deepEqual(new MurmurHash().update('').digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash().digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).update('').digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash().update('').digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash().digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).update('').digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash().update('').digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash().digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).update('').digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash().update('').digest('utf8'), seedZeroBuffer);
      t.deepEqual(new MurmurHash().digest('utf8'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).update('').digest('utf8'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).digest('utf8'), seedZeroBuffer);
      t.strictEqual(new MurmurHash().update('').digest('buffer').toString('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash().digest('buffer').toString('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(0).update('').digest('buffer').toString('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(0).digest('buffer').toString('hex'), seedZeroHex);
      t.deepEqual(new MurmurHash().update(new Buffer('')).digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).update(new Buffer('')).digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash().update(new Buffer('')).digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).update(new Buffer('')).digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash().update(new Buffer('')).digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).update(new Buffer('')).digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash().update(new Buffer('')).digest('utf8'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(0).update(new Buffer('')).digest('utf8'), seedZeroBuffer);
      t.strictEqual(new MurmurHash().update(new Buffer('')).digest('buffer').toString('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(0).update(new Buffer('')).digest('buffer').toString('hex'), seedZeroHex);
      t.deepEqual(new MurmurHash(-1).update('').digest('buffer'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1).update('').digest(), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1).update('').digest('foobar'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1).update('').digest('utf8'), seedMinusOneBuffer);
      t.strictEqual(new MurmurHash(-1).update('').digest('buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(new MurmurHash(-1).update(new Buffer('')).digest('buffer'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1).update(new Buffer('')).digest(), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1).update(new Buffer('')).digest('foobar'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(-1).update(new Buffer('')).digest('utf8'), seedMinusOneBuffer);
      t.strictEqual(new MurmurHash(-1).update(new Buffer('')).digest('buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(new MurmurHash(4294967295).update('').digest('buffer'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295).update('').digest(), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295).update('').digest('foobar'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295).update('').digest('utf8'), seedMinusOneBuffer);
      t.strictEqual(new MurmurHash(4294967295).update('').digest('buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(new MurmurHash(4294967295).update(new Buffer('')).digest('buffer'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295).update(new Buffer('')).digest(), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295).update(new Buffer('')).digest('foobar'), seedMinusOneBuffer);
      t.deepEqual(new MurmurHash(4294967295).update(new Buffer('')).digest('utf8'), seedMinusOneBuffer);
      t.strictEqual(new MurmurHash(4294967295).update(new Buffer('')).digest('buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(new MurmurHash(4294967296).update('').digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296).update('').digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296).update('').digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296).update('').digest('utf8'), seedZeroBuffer);
      t.strictEqual(new MurmurHash(4294967296).update('').digest('buffer').toString('hex'), seedZeroHex);
      t.deepEqual(new MurmurHash(4294967296).update(new Buffer('')).digest('buffer'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296).update(new Buffer('')).digest(), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296).update(new Buffer('')).digest('foobar'), seedZeroBuffer);
      t.deepEqual(new MurmurHash(4294967296).update(new Buffer('')).digest('utf8'), seedZeroBuffer);
      t.strictEqual(new MurmurHash(4294967296).update(new Buffer('')).digest('buffer').toString('hex'), seedZeroHex);
      t.deepEqual(new MurmurHash(1).update('').digest('buffer'), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1).update('').digest(), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1).update('').digest('foobar'), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1).update('').digest('utf8'), seedPlusOneBuffer);
      t.strictEqual(new MurmurHash(1).update('').digest('buffer').toString('hex'), seedPlusOneHex);
      t.deepEqual(new MurmurHash(1).update(new Buffer('')).digest('buffer'), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1).update(new Buffer('')).digest(), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1).update(new Buffer('')).digest('foobar'), seedPlusOneBuffer);
      t.deepEqual(new MurmurHash(1).update(new Buffer('')).digest('utf8'), seedPlusOneBuffer);
      t.strictEqual(new MurmurHash(1).update(new Buffer('')).digest('buffer').toString('hex'), seedPlusOneHex);

      t.end();
    });

    t.test('should create number hash from empty data', function(t) {
      t.strictEqual(new MurmurHash().update('').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(0).update('').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash().update('', 'foo').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(0).update('', 'foo').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash().update(new Buffer('')).digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(0).update(new Buffer('')).digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash().update(new Buffer(''), 'foo').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(0).update(new Buffer(''), 'foo').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(-1).update('').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(-1).update('', 'foo').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(-1).update(new Buffer('')).digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(-1).update(new Buffer(''), 'foo').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(4294967295).update('').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(4294967295).update('', 'foo').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(4294967295).update(new Buffer('')).digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(4294967295).update(new Buffer(''), 'number').digest('number'), seedMinusOneNumber);
      t.strictEqual(new MurmurHash(4294967296).update('').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(4294967296).update('', 'foo').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(4294967296).update(new Buffer('')).digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(4294967296).update(new Buffer(''), 'number').digest('number'), seedZeroNumber);
      t.strictEqual(new MurmurHash(1).update('').digest('number'), seedPlusOneNumber);
      t.strictEqual(new MurmurHash(1).update('', 'foo').digest('number'), seedPlusOneNumber);
      t.strictEqual(new MurmurHash(1).update(new Buffer('')).digest('number'), seedPlusOneNumber);
      t.strictEqual(new MurmurHash(1).update(new Buffer(''), 'foo').digest('number'), seedPlusOneNumber);

      t.end();
    });

    t.test('should create string encoded hash from empty data', function(t) {
      t.strictEqual(new MurmurHash().update('').digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(0).update('').digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash().update(new Buffer('')).digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(0).update(new Buffer('')).digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(-1).update('').digest('hex'), seedMinusOneHex);
      t.strictEqual(new MurmurHash(-1).update(new Buffer('')).digest('hex'), seedMinusOneHex);
      t.strictEqual(new MurmurHash(4294967295).update('').digest('hex'), seedMinusOneHex);
      t.strictEqual(new MurmurHash(4294967295).update(new Buffer('')).digest('hex'), seedMinusOneHex);
      t.strictEqual(new MurmurHash(4294967296).update('').digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(4294967296).update(new Buffer('')).digest('hex'), seedZeroHex);
      t.strictEqual(new MurmurHash(1).update('').digest('hex'), seedPlusOneHex);
      t.strictEqual(new MurmurHash(1).update(new Buffer('')).digest('hex'), seedPlusOneHex);
      t.strictEqual(new MurmurHash().update('').digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(0).update('').digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash().update(new Buffer('')).digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(0).update(new Buffer('')).digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(-1).update('').digest('base64'), seedMinusOneBase64);
      t.strictEqual(new MurmurHash(-1).update(new Buffer('')).digest('base64'), seedMinusOneBase64);
      t.strictEqual(new MurmurHash(4294967295).update('').digest('base64'), seedMinusOneBase64);
      t.strictEqual(new MurmurHash(4294967295).update(new Buffer('')).digest('base64'), seedMinusOneBase64);
      t.strictEqual(new MurmurHash(4294967296).update('').digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(4294967296).update(new Buffer('')).digest('base64'), seedZeroBase64);
      t.strictEqual(new MurmurHash(1).update('').digest('base64'), seedPlusOneBase64);
      t.strictEqual(new MurmurHash(1).update(new Buffer('')).digest('base64'), seedPlusOneBase64);
      t.strictEqual(new MurmurHash().update('').digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(0).update('').digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash().update(new Buffer('')).digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(0).update(new Buffer('')).digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(-1).update('').digest('binary'), seedMinusOneBinary);
      t.strictEqual(new MurmurHash(-1).update(new Buffer('')).digest('binary'), seedMinusOneBinary);
      t.strictEqual(new MurmurHash(4294967295).update('').digest('binary'), seedMinusOneBinary);
      t.strictEqual(new MurmurHash(4294967295).update(new Buffer('')).digest('binary'), seedMinusOneBinary);
      t.strictEqual(new MurmurHash(4294967296).update('').digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(4294967296).update(new Buffer('')).digest('binary'), seedZeroBinary);
      t.strictEqual(new MurmurHash(1).update('').digest('binary'), seedPlusOneBinary);
      t.strictEqual(new MurmurHash(1).update(new Buffer('')).digest('binary'), seedPlusOneBinary);

      t.end();
    });

    t.test('should utilize different string input encodings', function(t) {
      var string = "\u1220łóżko"
        , base64 = '4YigxYLDs8W8a28='
        , hex = 'e188a0c582c3b3c5bc6b6f'
        , hash = murmurHash(string, 'utf8', 'buffer');
      t.deepEqual(new MurmurHash().update(string).digest(), hash);
      t.deepEqual(new MurmurHash().update(new Buffer(string, 'utf8')).digest(), hash);
      t.deepEqual(new MurmurHash().update(string, 'ascii').digest(),
         new MurmurHash().update(new Buffer(string, 'ascii')).digest());
      t.deepEqual(new MurmurHash().update(string, 'binary').digest(),
         new MurmurHash().update(new Buffer(string, 'binary')).digest());
      t.deepEqual(new MurmurHash().update(string, 'utf8').digest(),
         new MurmurHash().update(new Buffer(string, 'utf8')).digest());
      t.deepEqual(new MurmurHash().update(string, 'utf8').digest(), hash);
      t.deepEqual(new MurmurHash().update(string, 'utf-8').digest(),
         new MurmurHash().update(new Buffer(string, 'utf-8')).digest());
      t.deepEqual(new MurmurHash().update(string, 'utf-8').digest(), hash);
      t.deepEqual(new MurmurHash().update(string, 'ucs2').digest(),
         new MurmurHash().update(new Buffer(string, 'ucs2')).digest());
      t.deepEqual(new MurmurHash().update(string, 'ucs-2').digest(),
         new MurmurHash().update(new Buffer(string, 'ucs-2')).digest());
      t.deepEqual(new MurmurHash().update(string, 'utf16le').digest(),
         new MurmurHash().update(new Buffer(string, 'utf16le')).digest());
      t.deepEqual(new MurmurHash().update(string, 'utf-16le').digest(),
         new MurmurHash().update(new Buffer(string, 'utf-16le')).digest());
      t.deepEqual(new MurmurHash().update(base64, 'base64').digest(), hash);
      t.deepEqual(new MurmurHash().update(base64, 'base64').digest(),
         new MurmurHash().update(new Buffer(base64, 'base64')).digest());
      t.deepEqual(new MurmurHash().update(hex, 'hex').digest(), hash);
      t.deepEqual(new MurmurHash().update(hex, 'hex').digest(),
         new MurmurHash().update(new Buffer(hex, 'hex')).digest());

      t.end();
    });

    t.test('should create hash from some random data', function(t) {
      var data = '';
      var strlen = 1000;
      for (var i = 0; i < strlen; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var buffer = new Buffer(data, 'utf8');
      t.equal(new MurmurHash().update(data).digest().length, size);
      t.equal(new MurmurHash().update(data).total, buffer.length);
      t.equal(new MurmurHash().update(data).digest('buffer').length, size);
      t.equal(new MurmurHash().update(buffer).digest().length, size);
      t.equal(new MurmurHash().update(buffer).digest('buffer').length, size);
      t.equal(new MurmurHash().update(buffer).total, buffer.length);
      t.strictEqual(new MurmurHash().update(data, 'binary').digest('number'),
                    new MurmurHash().update(new Buffer(data, 'binary')).digest('number'));
      t.strictEqual(new MurmurHash().update(data, 'binary').digest('number'), murmurHash(data, 'binary'));
      t.strictEqual(new MurmurHash().update(data).digest('number'),
                    new MurmurHash().update(buffer).digest('number'));
      t.strictEqual(new MurmurHash().update(data).digest('number'), murmurHash(buffer));
      t.strictEqual(new MurmurHash(-1).update(data).digest('number'),
                    new MurmurHash(-1).update(buffer).digest('number'));
      t.strictEqual(new MurmurHash(-1).update(data).digest('number'), murmurHash(buffer, -1));
      t.strictEqual(new MurmurHash(-1).update(data).digest('number'),
                    new MurmurHash(4294967295).update(buffer).digest('number'));
      t.strictEqual(new MurmurHash(-1).update(data).digest('number'), murmurHash(buffer, 4294967295));
      t.strictEqual(new MurmurHash(4294967295).update(data).digest('number'),
                    new MurmurHash(-1).update(buffer).digest('number'));
      t.strictEqual(new MurmurHash(4294967295).update(data).digest('number'), murmurHash(buffer, -1));

      var seed = (Math.random()*4294967296)|0;
      t.notStrictEqual(new MurmurHash(seed).update(data).digest(), new MurmurHash(seed).update(buffer).digest('buffer'));
      t.notStrictEqual(new MurmurHash(seed).update(data).digest(), murmurHash(buffer, seed, 'buffer'));
      t.deepEqual(new MurmurHash(seed).update(data).digest('buffer'), new MurmurHash(seed).update(buffer).digest());
      t.deepEqual(new MurmurHash(seed).update(data).digest('buffer'), murmurHash(buffer, seed, 'buffer'));
      t.strictEqual(new MurmurHash(seed).update(data).digest('number'), new MurmurHash(seed).update(buffer).digest('number'));
      t.strictEqual(new MurmurHash(seed).update(data).digest('number'), murmurHash(buffer, seed));

      t.end();
    });


    t.test('should not crash with utf8 characters in encoding string', function(t) {
      t.notThrow(function() {
        new MurmurHash().update("łabądź",
                 "\u1010\u1111\u1212\u1313\u1414\u1515\u1616\u1717",
                 "\u1010\u1111\u1212\u1313\u1414\u1515\u1616\u1717").digest();
      }, "ignores encoding");
      var match = new MurmurHash().update("łabądź", "utf8").digest("buffer");
      var hash = new MurmurHash().update("łabądź").digest();
      t.deepEqual(hash, match);
      t.type(hash, Buffer, 'hash is buffer');
      t.deepEqual(hash, new Buffer(crashTestHex, 'hex'));

      t.end();
    });

    t.test('should create hash from some random data incrementally', function(t) {
      var maxchunksize = 100;
      var buffer = new Buffer(10015);
      var seed = (Math.random()*4294967296)|0;
      var hasher0 = new MurmurHash(0);
      var hasher1 = new MurmurHash(1);
      var hasherS = new MurmurHash(seed);
      var hasher0str = new MurmurHash(0);
      var hasher1str = new MurmurHash(1);
      var hasherSstr = new MurmurHash(seed);
      var n = 0;
      while(n < buffer.length) {
        var p = n;
        var slicelen = (Math.random()*maxchunksize);
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
      t.equal(hasher0str.total, buffer.length);
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

      t.end();
    });

    t.end();
  });

});
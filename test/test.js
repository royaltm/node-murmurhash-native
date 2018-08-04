"use strict";

var os   = require("os")
  , test = require("tap").test
  , hash = require('..')
;

test("should have murmurHash functions", function(t) {
  ['murmurHash',
   'murmurHash32',
   'murmurHash64',
   'murmurHash64x64',
   'murmurHash64x86',
   'murmurHash128x64',
   'murmurHash128',
   'murmurHash128x86'
  ].forEach(function(name) {
    t.type(hash[name], 'function');
    t.strictEqual(hash[name].name, name);
    t.type(hash.BE[name], 'function');
    t.strictEqual(hash.BE[name].name, name);
    t.type(hash.LE[name], 'function');
    t.strictEqual(hash.LE[name].name, name);
    t.type(hash.platform[name], 'function');
    t.strictEqual(hash.platform[name].name, name);
  });
  t.strictEqual(hash.platform, hash[os.endianness()]);
  t.end();
});

[
  [4, 'murmurHash', hash.murmurHash, 0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      '50191cd1'],
  [4, 'murmurHash', hash.murmurHash32, 0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      '50191cd1'],
  [4, 'murmurHash', hash.BE.murmurHash, 0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      '50191cd1'],
  [4, 'murmurHash', hash.BE.murmurHash32, 0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      '50191cd1'],
  [4, 'murmurHash', hash.LE.murmurHash, 0, 2180083513, 1364076727,
      '00000000', '396ff181', 'b7284e51',
      'd11c1950'],
  [4, 'murmurHash', hash.LE.murmurHash32, 0, 2180083513, 1364076727,
      '00000000', '396ff181', 'b7284e51',
      'd11c1950'],
  [8, 'murmurHash64x64', hash.murmurHash64x64,
      '0000000000000000', '952d4201a42f3c31', 'c6a4a7935bd064dc',
      '0000000000000000', '952d4201a42f3c31', 'c6a4a7935bd064dc',
      'e5718ae073beb171'],
  [8, 'murmurHash64x64', hash.BE.murmurHash64x64,
      '0000000000000000', '952d4201a42f3c31', 'c6a4a7935bd064dc',
      '0000000000000000', '952d4201a42f3c31', 'c6a4a7935bd064dc',
      'e5718ae073beb171'],
  [8, 'murmurHash64x64', hash.LE.murmurHash64x64,
      '0000000000000000', '313c2fa401422d95', 'dc64d05b93a7a4c6',
      '0000000000000000', '313c2fa401422d95', 'dc64d05b93a7a4c6',
      '71b1be73e08a71e5'],
  [8, 'murmurHash64x86', hash.murmurHash64x86,
      '0000000000000000', 'f107ca78f6c98ab0', 'dd9f019f79505248',
      '0000000000000000', 'f107ca78f6c98ab0', 'dd9f019f79505248',
      '20010cf69cfc8f5b'],
  [8, 'murmurHash64x86', hash.BE.murmurHash64x86,
      '0000000000000000', 'f107ca78f6c98ab0', 'dd9f019f79505248',
      '0000000000000000', 'f107ca78f6c98ab0', 'dd9f019f79505248',
      '20010cf69cfc8f5b'],
  [8, 'murmurHash64x86', hash.LE.murmurHash64x86,
      '0000000000000000', 'b08ac9f678ca07f1', '485250799f019fdd',
      '0000000000000000', 'b08ac9f678ca07f1', '485250799f019fdd',
      '5b8ffc9cf60c0120'],
  [16, 'murmurHash128x64', hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '56ca212715c05cb53aa4737dfb49076f'],
  [16, 'murmurHash128x64', hash.BE.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '56ca212715c05cb53aa4737dfb49076f'],
  [16, 'murmurHash128x64', hash.LE.murmurHash128x64,
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251',
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251',
      'b55cc0152721ca566f0749fb7d73a43a'],
  [16, 'murmurHash128x86', hash.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '09cc949d260a8dd2de241315de241315'],
  [16, 'murmurHash128x86', hash.BE.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '09cc949d260a8dd2de241315de241315'],
  [16, 'murmurHash128x86', hash.LE.murmurHash128x86,
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254',
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254',
      '9d94cc09d28d0a26151324de151324de']
].forEach(function(args)  {

  var size                = args[ 0]
    , label               = args[ 1]
    , murmurHash          = args[ 2]
    , seedZeroDefault     = args[ 3]
    , seedMinusOneDefault = args[ 4]
    , seedPlusOneDefault  = args[ 5]
    , seedZeroHex         = args[ 6]
    , seedMinusOneHex     = args[ 7]
    , seedPlusOneHex      = args[ 8]
    , crashTestHex        = args[ 9]
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

  test(label, function(t) {

    t.type(murmurHash, 'function');

    t.test('should throw error for bad arguments', function(t) {
      t.throws(function() { murmurHash(); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash({}); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash([]); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(void(0)); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(null); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(true); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(false); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(0); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(1); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(-1); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(new Date()); }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash("", "abcdefghijklmno"); }, new TypeError("\"encoding\" must be a valid string encoding") );
      t.throws(function() { murmurHash("", "123456"); }, new TypeError("\"encoding\" must be a valid string encoding") );
      t.throws(function() { murmurHash("", "12345"); }, new TypeError("\"encoding\" must be a valid string encoding") );
      t.throws(function() { murmurHash("", "1234"); }, new TypeError("\"encoding\" must be a valid string encoding") );
      t.throws(function() { murmurHash("", "123"); }, new TypeError("\"encoding\" must be a valid string encoding") );
      t.throws(function() { murmurHash("", ""); }, new TypeError("\"encoding\" must be a valid string encoding") );
      t.throws(function() { murmurHash(Buffer.alloc(0), 0, ""); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );
      t.throws(function() { murmurHash(Buffer.alloc(0), ""); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );
      t.throws(function() { murmurHash("", 0, ""); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );
      t.throws(function() { murmurHash("", 0, "mumber"); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );
      t.throws(function() { murmurHash("", 0, "xxxxxxx"); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );
      t.throws(function() { murmurHash("", 0, "utf-8"); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );

      t.end();
    });

    t.test('should create number hash from empty data', function(t) {
      t.strictEqual(murmurHash(''), seedZeroDefault);
      t.strictEqual(murmurHash('', 'number'), seedZeroDefault);
      t.strictEqual(murmurHash(Buffer.from('')), seedZeroDefault);
      t.strictEqual(murmurHash(Buffer.from(''), 'number'), seedZeroDefault);
      t.strictEqual(murmurHash('', -1), seedMinusOneDefault);
      t.strictEqual(murmurHash('', -1, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash(Buffer.from(''), -1), seedMinusOneDefault);
      t.strictEqual(murmurHash(Buffer.from(''), -1, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 4294967295), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 4294967295, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967295), seedMinusOneDefault);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967295, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 4294967296), seedZeroDefault);
      t.strictEqual(murmurHash('', 4294967296, 'number'), seedZeroDefault);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967296), seedZeroDefault);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967296, 'number'), seedZeroDefault);
      t.strictEqual(murmurHash('', 1), seedPlusOneDefault);
      t.strictEqual(murmurHash('', 1, 'number'), seedPlusOneDefault);
      t.strictEqual(murmurHash(Buffer.from(''), 1), seedPlusOneDefault);
      t.strictEqual(murmurHash(Buffer.from(''), 1, 'number'), seedPlusOneDefault);

      t.end();
    });

    t.test('should create buffer hash from empty data', function(t) {
      t.deepEqual(murmurHash('', 0, 'buffer'), seedZeroBuffer);
      t.strictEqual(murmurHash('', 0, 'buffer').toString('hex'), seedZeroHex);
      t.deepEqual(murmurHash(Buffer.from(''), 'buffer'), seedZeroBuffer);
      t.strictEqual(murmurHash(Buffer.from(''), 'buffer').toString('hex'), seedZeroHex);
      t.deepEqual(murmurHash('', -1, 'buffer'), seedMinusOneBuffer);
      t.strictEqual(murmurHash('', -1, 'buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(murmurHash(Buffer.from(''), -1, 'buffer'), seedMinusOneBuffer);
      t.strictEqual(murmurHash(Buffer.from(''), -1, 'buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(murmurHash('', 4294967295, 'buffer'), seedMinusOneBuffer);
      t.strictEqual(murmurHash('', 4294967295, 'buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(murmurHash(Buffer.from(''), 4294967295, 'buffer'), seedMinusOneBuffer);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967295, 'buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(murmurHash('', 4294967296, 'buffer'), seedZeroBuffer);
      t.strictEqual(murmurHash('', 4294967296, 'buffer').toString('hex'), seedZeroHex);
      t.deepEqual(murmurHash(Buffer.from(''), 4294967296, 'buffer'), seedZeroBuffer);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967296, 'buffer').toString('hex'), seedZeroHex);
      t.deepEqual(murmurHash('', 1, 'buffer'), seedPlusOneBuffer);
      t.strictEqual(murmurHash('', 1, 'buffer').toString('hex'), seedPlusOneHex);
      t.deepEqual(murmurHash(Buffer.from(''), 1, 'buffer'), seedPlusOneBuffer);
      t.strictEqual(murmurHash(Buffer.from(''), 1, 'buffer').toString('hex'), seedPlusOneHex);

      t.end();
    });

    t.test('should create string encoded hash from empty data', function(t) {
      t.strictEqual(murmurHash('', 0, 'hex'), seedZeroHex);
      t.strictEqual(murmurHash(Buffer.from(''), 'hex'), seedZeroHex);
      t.strictEqual(murmurHash('', -1, 'hex'), seedMinusOneHex);
      t.strictEqual(murmurHash(Buffer.from(''), -1, 'hex'), seedMinusOneHex);
      t.strictEqual(murmurHash('', 4294967295, 'hex'), seedMinusOneHex);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967295, 'hex'), seedMinusOneHex);
      t.strictEqual(murmurHash('', 4294967296, 'hex'), seedZeroHex);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967296, 'hex'), seedZeroHex);
      t.strictEqual(murmurHash('', 1, 'hex'), seedPlusOneHex);
      t.strictEqual(murmurHash(Buffer.from(''), 1, 'hex'), seedPlusOneHex);
      t.strictEqual(murmurHash('', 0, 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash(Buffer.from(''), 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash('', -1, 'base64'), seedMinusOneBase64);
      t.strictEqual(murmurHash(Buffer.from(''), -1, 'base64'), seedMinusOneBase64);
      t.strictEqual(murmurHash('', 4294967295, 'base64'), seedMinusOneBase64);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967295, 'base64'), seedMinusOneBase64);
      t.strictEqual(murmurHash('', 4294967296, 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967296, 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash('', 1, 'base64'), seedPlusOneBase64);
      t.strictEqual(murmurHash(Buffer.from(''), 1, 'base64'), seedPlusOneBase64);
      t.strictEqual(murmurHash('', 0, 'binary'), seedZeroBinary);
      t.strictEqual(murmurHash(Buffer.from(''), 'binary'), seedZeroBinary);
      t.strictEqual(murmurHash('', -1, 'binary'), seedMinusOneBinary);
      t.strictEqual(murmurHash(Buffer.from(''), -1, 'binary'), seedMinusOneBinary);
      t.strictEqual(murmurHash('', 4294967295, 'binary'), seedMinusOneBinary);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967295, 'binary'), seedMinusOneBinary);
      t.strictEqual(murmurHash('', 4294967296, 'binary'), seedZeroBinary);
      t.strictEqual(murmurHash(Buffer.from(''), 4294967296, 'binary'), seedZeroBinary);
      t.strictEqual(murmurHash('', 1, 'binary'), seedPlusOneBinary);
      t.strictEqual(murmurHash(Buffer.from(''), 1, 'binary'), seedPlusOneBinary);

      t.end();
    });

    t.test('should utilize different string input encodings', function(t) {
      var string = "\u1220łóżko"
        , base64 = 'IELzfGtv'
        , hex = '2042f37c6b6f'
        , hash = murmurHash(string);
      t.strictEqual(hash,
         murmurHash(Buffer.from(string, 'binary')));
      t.strictEqual(murmurHash(string, 'ascii'),
         murmurHash(Buffer.from(string, 'ascii')));
      t.strictEqual(murmurHash(string, 'ascii'), hash);
      t.strictEqual(murmurHash(string, 'binary'),
         murmurHash(Buffer.from(string, 'binary')));
      t.strictEqual(murmurHash(string, 'binary'), hash);
      t.strictEqual(murmurHash(string, 'utf8'),
         murmurHash(Buffer.from(string, 'utf8')));
      t.strictEqual(murmurHash(string, 'utf-8'),
         murmurHash(Buffer.from(string, 'utf-8')));
      t.strictEqual(murmurHash(string, 'ucs2'),
         murmurHash(Buffer.from(string, 'ucs2')));
      t.strictEqual(murmurHash(string, 'ucs-2'),
         murmurHash(Buffer.from(string, 'ucs-2')));
      t.strictEqual(murmurHash(string, 'utf16le'),
         murmurHash(Buffer.from(string, 'utf16le')));
      t.strictEqual(murmurHash(string, 'utf-16le'),
         murmurHash(Buffer.from(string, 'utf-16le')));
      t.strictEqual(murmurHash(base64, 'base64'), hash);
      t.strictEqual(murmurHash(base64, 'base64'),
         murmurHash(Buffer.from(base64, 'base64')));
      t.strictEqual(murmurHash(hex, 'hex'), hash);
      t.strictEqual(murmurHash(hex, 'hex'),
         murmurHash(Buffer.from(hex, 'hex')));

      t.end();
    });


    t.test('should create hash from some random data', function(t) {
      var data = '';
      for (var i = 0; i < 1000; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var buffer = Buffer.from(data, 'binary');
      t.equal(murmurHash(data, 0, 'buffer').length, size);
      t.equal(murmurHash(buffer, 'buffer').length, size);
      t.strictEqual(murmurHash(data, 'utf8'), murmurHash(Buffer.from(data, 'utf8')));
      t.strictEqual(murmurHash(data), murmurHash(buffer));
      t.strictEqual(murmurHash(data, -1), murmurHash(buffer, -1));
      t.strictEqual(murmurHash(data, -1), murmurHash(buffer, 4294967295));
      t.strictEqual(murmurHash(data, 4294967295), murmurHash(buffer, -1));

      var seed = (Math.random()*4294967296)|0;
      t.notStrictEqual(murmurHash(data, seed, 'buffer'), murmurHash(buffer, seed, 'buffer'));
      t.deepEqual(murmurHash(data, seed, 'buffer'), murmurHash(buffer, seed, 'buffer'));
      t.strictEqual(murmurHash(data, seed), murmurHash(buffer, seed));

      t.end();
    });

    t.test('should not crash with utf8 characters in encoding string', function(t) {
      t.throws(function() {
        murmurHash("łabądź",
                 "\u1010\u1111\u1212\u1313\u1414\u1515\u1616\u1717",
                 "\u1010\u1111\u1212\u1313\u1414\u1515\u1616\u1717");
      }, new TypeError("\"encoding\" must be a valid string encoding"));
      var match = murmurHash("łabądź", "binary", "buffer");
      var hash = murmurHash("łabądź", "buffer");
      t.deepEqual(hash, match);
      t.type(hash, Buffer, 'hash is buffer');
      t.deepEqual(hash, Buffer.from(crashTestHex, 'hex'));
      t.end();
    });

    t.test('should interpret 1 argument properly', function(t) {
      t.strictEqual(murmurHash(''), seedZeroDefault);
      t.strictEqual(murmurHash(Buffer.alloc(0)), seedZeroDefault);

      t.end();
    });

    t.test('should interpret 2[+2] arguments properly', function(t) {
      t.strictEqual(murmurHash('', 0), seedZeroDefault);
      t.strictEqual(murmurHash('', -1), seedMinusOneDefault);
      t.strictEqual(murmurHash(Buffer.alloc(0), 0), seedZeroDefault);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1), seedMinusOneDefault);
      t.strictEqual(murmurHash(Buffer.alloc(0), 0, 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, 'base64'), seedMinusOneBase64);
      t.strictEqual(murmurHash(Buffer.alloc(0), 'base64', 0), seedZeroBase64);
      t.strictEqual(murmurHash(Buffer.alloc(0), 'base64', -1), seedMinusOneBase64);
      t.strictEqual(murmurHash('\u1234', 'ucs2'), murmurHash(Buffer.from('\u1234', 'ucs2')));
      t.strictEqual(murmurHash('\u1234', 'utf8'), murmurHash(Buffer.from('\u1234', 'utf8')));
      t.strictEqual(murmurHash('\u1234', 'ascii'), murmurHash(Buffer.from('\u1234', 'ascii')));
      t.strictEqual(murmurHash('\u1234', 'binary'), murmurHash(Buffer.from('\u1234', 'binary')));
      t.strictEqual(murmurHash('/w==', 'base64'), murmurHash(Buffer.from('/w==', 'base64')));
      t.strictEqual(murmurHash('ff', 'hex'), murmurHash(Buffer.from('ff', 'hex')));
      t.strictEqual(murmurHash('ó', 'number'), murmurHash(Buffer.from('ó', 'binary')));
      t.deepEqual(murmurHash('ą', 'buffer'), murmurHash(Buffer.from('ą', 'binary'), 0, 'buffer'));
      t.strictEqual(murmurHash(Buffer.from([0xFF]), 'hex'),
                    murmurHash(Buffer.from('\u12FF', 'binary'), 'hex'));
      t.strictEqual(murmurHash(Buffer.from([0xFF]), 'number'),
                    murmurHash(Buffer.from('\u12FF', 'binary'), 'number'));
      t.strictEqual(murmurHash(Buffer.from([0xFF]), 'binary'),
                    murmurHash(Buffer.from('\u12FF', 'binary'), 'binary'));
      t.deepEqual(murmurHash(Buffer.from([0xFF]), 'buffer'),
                    murmurHash(Buffer.from('\u12FF', 'binary'), 'buffer'));

      var buf = Buffer.alloc(size, -1);
      t.strictEqual(murmurHash('', buf), buf);
      t.deepEqual(buf, Buffer.from(seedZeroHex, 'hex'));
      buf.fill(-1);
      t.strictEqual(murmurHash(Buffer.alloc(0), buf), buf);
      t.deepEqual(buf, Buffer.from(seedZeroHex, 'hex'));

      var buf2 = Buffer.allocUnsafe(size + 2); buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash('', buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([Buffer.from([0,0]), Buffer.from(seedZeroHex, 'hex')]));
      buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash(Buffer.alloc(0), buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([Buffer.from([0,0]), Buffer.from(seedZeroHex, 'hex')]));

      var buf3 = Buffer.alloc(size - 1, -1);
      t.strictEqual(murmurHash('', buf3, -size), buf3);
      t.deepEqual(buf3, Buffer.from(seedZeroHex, 'hex').slice(1));
      buf3.fill(-1);
      t.strictEqual(murmurHash(Buffer.alloc(0), buf3, -size), buf3);
      t.deepEqual(buf3, Buffer.from(seedZeroHex, 'hex').slice(1));

      var bufpad = Buffer.alloc(size - 3, -1);

      var buf4 = Buffer.allocUnsafe(size + 2); buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash('', buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([Buffer.from([0,0]),
                                       Buffer.from(seedZeroHex, 'hex').slice(0, 3),
                                       bufpad]));
      buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash(Buffer.alloc(0), buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([Buffer.from([0,0]),
                                       Buffer.from(seedZeroHex, 'hex').slice(0, 3),
                                       bufpad]));

      var buf5 = Buffer.alloc(size - 1, -1);
      t.strictEqual(murmurHash('', buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([Buffer.from(seedZeroHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));
      buf5.fill(-1);
      t.strictEqual(murmurHash(Buffer.alloc(0), buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([Buffer.from(seedZeroHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));

      t.end();
    });

    t.test('should interpret 3[+2] arguments properly', function(t) {
      t.strictEqual(murmurHash('', -1, 0), seedZeroDefault);
      t.strictEqual(murmurHash('', null, 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash('', -1, null), seedMinusOneDefault);
      t.strictEqual(murmurHash('', -1, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash('', -1, 'number', 1), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 'number', -1), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 'number', -1, 1), seedMinusOneDefault);
      t.deepEqual(murmurHash('', -1, 'buffer'), Buffer.from(seedMinusOneHex, 'hex'));
      t.deepEqual(murmurHash('', -1, 'buffer', 1), Buffer.from(seedMinusOneHex, 'hex'));
      t.strictEqual(murmurHash('', 1, -1), seedMinusOneDefault);
      t.strictEqual(murmurHash('', null, -1), seedMinusOneDefault);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, 0), seedZeroDefault);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, null), seedMinusOneDefault);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, 'number', 1), seedMinusOneDefault);
      t.deepEqual(murmurHash(Buffer.alloc(0), -1, 'buffer'), Buffer.from(seedMinusOneHex, 'hex'));
      t.deepEqual(murmurHash(Buffer.alloc(0), -1, 'buffer', 1), Buffer.from(seedMinusOneHex, 'hex'));
      t.deepEqual(murmurHash(Buffer.alloc(0), 1, -1), seedMinusOneDefault);
      t.deepEqual(murmurHash(Buffer.alloc(0), null, -1), seedMinusOneDefault);
      t.strictEqual(murmurHash('\u1234', 'utf8', 100), murmurHash(Buffer.from('\u1234', 'utf8'), 100));
      t.strictEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'number', 100),
                  murmurHash(Buffer.from('\u1234', 'binary'), 100));
      t.deepEqual(murmurHash('\u1234', 'utf8', 'buffer'),
                    murmurHash(Buffer.from('\u1234', 'utf8'), 0, 'buffer'));
      t.deepEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'buffer'),
                    murmurHash(Buffer.from('\u1234', 'binary'), 0, 'buffer'));
      t.deepEqual(murmurHash('\u1234', 'utf8', 'buffer', -1),
                    murmurHash(Buffer.from('\u1234', 'utf8'), 0, 'buffer'));
      t.deepEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'ignore', 'buffer', -1),
                    murmurHash(Buffer.from('\u1234', 'binary'), 0, 'buffer'));
      t.deepEqual(murmurHash('\u1234', null, 'buffer'),
                    murmurHash(Buffer.from('\u1234', 'binary'), 0, 'buffer'));
      t.deepEqual(murmurHash(Buffer.from('\u1234', 'binary'), null, 'buffer'),
                    murmurHash(Buffer.from('\u1234', 'binary'), 0, 'buffer'));
      t.deepEqual(murmurHash('\u1234', null, 'buffer', -1),
                    murmurHash(Buffer.from('\u1234', 'binary'), 0, 'buffer'));
      t.deepEqual(murmurHash(Buffer.from('\u1234', 'binary'), null, 'buffer', -1),
                    murmurHash(Buffer.from('\u1234', 'binary'), 0, 'buffer'));
      t.strictEqual(murmurHash('\u1234', null, null),
                  murmurHash(Buffer.from('\u1234', 'binary'), 0));
      t.strictEqual(murmurHash(Buffer.from('\u1234', 'binary'), null, null),
                  murmurHash(Buffer.from('\u1234', 'binary'), 0));
      t.strictEqual(murmurHash('\u1234', null, null, -1),
                  murmurHash(Buffer.from('\u1234', 'binary'), 0));
      t.strictEqual(murmurHash(Buffer.from('\u1234', 'binary'), null, null, -1),
                  murmurHash(Buffer.from('\u1234', 'binary'), 0));
      t.strictEqual(murmurHash('\u1234', 'utf8', null),
                  murmurHash(Buffer.from('\u1234', 'utf8'), 0));
      t.strictEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'number', null),
                  murmurHash(Buffer.from('\u1234', 'binary'), 0));
      t.strictEqual(murmurHash('\u1234', 'utf8', null, -1),
                  murmurHash(Buffer.from('\u1234', 'utf8'), 0));
      t.strictEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'number', null, -1),
                  murmurHash(Buffer.from('\u1234', 'binary'), 0));

      var buf = Buffer.alloc(size, -1);
      t.strictEqual(murmurHash('', -1, buf), buf);
      t.deepEqual(buf, Buffer.from(seedMinusOneHex, 'hex'));
      buf.fill(-1);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, buf), buf);
      t.deepEqual(buf, Buffer.from(seedMinusOneHex, 'hex'));

      var buf2 = Buffer.allocUnsafe(size + 2); buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash('', -1, buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([Buffer.from([0,0]), Buffer.from(seedMinusOneHex, 'hex')]));
      buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([Buffer.from([0,0]), Buffer.from(seedMinusOneHex, 'hex')]));

      var buf3 = Buffer.alloc(size - 1, -1);
      t.strictEqual(murmurHash('', -1, buf3, -size), buf3);
      t.deepEqual(buf3, Buffer.from(seedMinusOneHex, 'hex').slice(1));
      buf3.fill(-1);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, buf3, -size), buf3);
      t.deepEqual(buf3, Buffer.from(seedMinusOneHex, 'hex').slice(1));

      var bufpad = Buffer.alloc(size - 3, -1);

      var buf4 = Buffer.allocUnsafe(size + 2); buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash('', -1, buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([Buffer.from([0,0]),
                                       Buffer.from(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));
      buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([Buffer.from([0,0]),
                                       Buffer.from(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));

      var buf5 = Buffer.alloc(size - 1, -1);
      t.strictEqual(murmurHash('', -1, buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([Buffer.from(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));
      buf5.fill(-1);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([Buffer.from(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));

      t.end();
    });

    t.test('should interpret 4[+2] arguments properly', function(t) {
      t.strictEqual(murmurHash('', 'utf8', -1, 0), seedZeroDefault);
      t.strictEqual(murmurHash('', 'utf8', -1, null), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 'utf8', -1, null, 1), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 'utf8', -1, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 'utf8', -1, 'number', 1), seedMinusOneDefault);
      t.deepEqual(murmurHash('', 'utf8', -1, 'buffer'), Buffer.from(seedMinusOneHex, 'hex'));
      t.deepEqual(murmurHash('', 'utf8', -1, 'buffer', 1), Buffer.from(seedMinusOneHex, 'hex'));
      t.strictEqual(murmurHash('', 'utf8', 1, -1), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 'utf8', null, -1), seedZeroDefault);
      t.strictEqual(murmurHash(Buffer.alloc(0), 'hex', -1, 0), seedMinusOneHex);
      t.strictEqual(murmurHash(Buffer.alloc(0), 'hex', -1, null), seedMinusOneHex);
      t.strictEqual(murmurHash(Buffer.alloc(0), 'hex', -1, null, 1), seedMinusOneHex);
      t.strictEqual(murmurHash(Buffer.alloc(0), 'hex', -1, 'ignore'), seedMinusOneHex);
      t.strictEqual(murmurHash(Buffer.alloc(0), 'hex', -1, 'ignore', 1), seedMinusOneHex);
      t.deepEqual(murmurHash(Buffer.alloc(0), 'buffer', -1, 'ignore'), Buffer.from(seedMinusOneHex, 'hex'));
      t.deepEqual(murmurHash(Buffer.alloc(0), 'buffer', -1, 'ignore', 1), Buffer.from(seedMinusOneHex, 'hex'));
      t.strictEqual(murmurHash(Buffer.alloc(0), 'number', 1, -1), seedPlusOneDefault);
      t.strictEqual(murmurHash(Buffer.alloc(0), 'number', null, -1), seedZeroDefault);
      t.deepEqual(murmurHash('\u1234', 'utf8', 100, 'buffer'),
                    murmurHash(Buffer.from('\u1234', 'utf8'), 100, 'buffer'));
      t.deepEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'buffer', 100, 'ignore'),
                    murmurHash(Buffer.from('\u1234', 'binary'), 100, 'buffer'));
      t.deepEqual(murmurHash('\u1234', 'utf8', 100, 'buffer', -1),
                    murmurHash(Buffer.from('\u1234', 'utf8'), 100, 'buffer'));
      t.deepEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'buffer', 100, 'ignore', -1),
                    murmurHash(Buffer.from('\u1234', 'binary'), 100, 'buffer'));
      t.deepEqual(murmurHash('\u1234', 'utf8', 0, 'buffer'),
                    murmurHash(Buffer.from('\u1234', 'utf8'), 'buffer'));
      t.deepEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'buffer', 0, 'ignore'),
                    murmurHash(Buffer.from('\u1234', 'binary'), 'buffer'));
      t.deepEqual(murmurHash('\u1234', 'utf8', 0, 'buffer', -1),
                    murmurHash(Buffer.from('\u1234', 'utf8'), 'buffer'));
      t.deepEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'buffer', 0, 'ignore', -1),
                    murmurHash(Buffer.from('\u1234', 'binary'), 'buffer'));
      t.deepEqual(murmurHash('\u1234', null, 1, 'buffer'),
                    murmurHash(Buffer.from('\u1234', 'binary'), 1, 'buffer'));
      t.deepEqual(murmurHash(Buffer.from('\u1234', 'binary'), null, 1, 'buffer'),
                    murmurHash(Buffer.from('\u1234', 'binary'), 1, 'buffer'));
      t.deepEqual(murmurHash('\u1234', null, 1, 'buffer', -1),
                    murmurHash(Buffer.from('\u1234', 'binary'), 1, 'buffer'));
      t.deepEqual(murmurHash(Buffer.from('\u1234', 'binary'), null, 1, 'buffer', -1),
                    murmurHash(Buffer.from('\u1234', 'binary'), 1, 'buffer'));
      t.strictEqual(murmurHash('\u1234', null, 1, null),
                  murmurHash(Buffer.from('\u1234', 'binary'), 1));
      t.strictEqual(murmurHash(Buffer.from('\u1234', 'binary'), null, 1, null),
                  murmurHash(Buffer.from('\u1234', 'binary'), 1));
      t.strictEqual(murmurHash('\u1234', null, 1, null, -1),
                  murmurHash(Buffer.from('\u1234', 'binary'), 1));
      t.strictEqual(murmurHash(Buffer.from('\u1234', 'binary'), null, 1, null, -1),
                  murmurHash(Buffer.from('\u1234', 'binary'), 1));
      t.strictEqual(murmurHash('\u1234', 'utf8', 1, null),
                  murmurHash(Buffer.from('\u1234', 'utf8'), 1));
      t.strictEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'number', 1, null),
                  murmurHash(Buffer.from('\u1234', 'binary'), 1));
      t.strictEqual(murmurHash('\u1234', 'utf8', 1, null, -1),
                  murmurHash(Buffer.from('\u1234', 'utf8'), 1));
      t.strictEqual(murmurHash(Buffer.from('\u1234', 'binary'), 'number', 1, null, -1),
                  murmurHash(Buffer.from('\u1234', 'binary'), 1));

      var buf = Buffer.alloc(size, -1);
      t.strictEqual(murmurHash('', 'utf8', -1, buf), buf);
      t.deepEqual(buf, Buffer.from(seedMinusOneHex, 'hex'));
      buf.fill(-1);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, buf, 0), buf);
      t.deepEqual(buf, Buffer.from(seedMinusOneHex, 'hex'));

      var buf2 = Buffer.allocUnsafe(size + 2); buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash('', 'binary', -1, buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([Buffer.from([0,0]), Buffer.from(seedMinusOneHex, 'hex')]));
      buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([Buffer.from([0,0]), Buffer.from(seedMinusOneHex, 'hex')]));

      var buf3 = Buffer.alloc(size - 1, -1);
      t.strictEqual(murmurHash('', 'ascii', -1, buf3, -size), buf3);
      t.deepEqual(buf3, Buffer.from(seedMinusOneHex, 'hex').slice(1));
      buf3.fill(-1);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, buf3, -size), buf3);
      t.deepEqual(buf3, Buffer.from(seedMinusOneHex, 'hex').slice(1));

      var bufpad = Buffer.alloc(size - 3, -1);

      var buf4 = Buffer.allocUnsafe(size + 2); buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash('', 'ucs2', -1, buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([Buffer.from([0,0]),
                                       Buffer.from(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));
      buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([Buffer.from([0,0]),
                                       Buffer.from(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));

      var buf5 = Buffer.alloc(size - 1, -1);
      t.strictEqual(murmurHash('', 'hex', -1, buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([Buffer.from(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));
      buf5.fill(-1);
      t.strictEqual(murmurHash(Buffer.alloc(0), -1, buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([Buffer.from(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));

      t.end();
    });

    t.test('should write hash into the same buffer it is reading from', function(t) {
      var data = '';
      for (var i = 0; i < 1000; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var databuf = Buffer.from(data, 'utf8');
      var seed = (Math.random() * 0x100000000)|0;

      var buf = Buffer.concat([databuf, Buffer.allocUnsafe(size)]); buf.fill(-1, databuf.length);
      t.strictEqual(murmurHash(buf.slice(0, databuf.length), seed, buf, databuf.length), buf);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer'), buf.slice(databuf.length));
      t.deepEqual(murmurHash(databuf, seed, 'buffer'),      buf.slice(databuf.length));

      var buf2 = Buffer.concat([Buffer.allocUnsafe(size), databuf]); buf2.fill(-1, 0, size);
      t.strictEqual(murmurHash(buf2.slice(size), seed, buf2), buf2);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer'), buf2.slice(0, size));
      t.deepEqual(murmurHash(databuf, seed, 'buffer'),      buf2.slice(0, size));

      var buf3 = Buffer.allocUnsafe(databuf.length); databuf.copy(buf3);
      t.strictEqual(murmurHash(buf3, seed, buf3), buf3);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer'), buf3.slice(0, size));
      t.deepEqual(murmurHash(databuf, seed, 'buffer'),      buf3.slice(0, size));
      t.deepEqual(buf3.slice(size), databuf.slice(size));

      var buf4 = Buffer.allocUnsafe(databuf.length); databuf.copy(buf4);
      t.strictEqual(murmurHash(buf4, seed, buf4, -size), buf4);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer'), buf4.slice(databuf.length - size));
      t.deepEqual(murmurHash(databuf, seed, 'buffer'),      buf4.slice(databuf.length - size));
      t.deepEqual(buf4.slice(0, databuf.length - size), databuf.slice(0, databuf.length - size));

      var buf5 = Buffer.allocUnsafe(databuf.length); databuf.copy(buf5);
      t.strictEqual(murmurHash(buf5, seed, buf5, 0, size - 1), buf5);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer').slice(0, size - 1), buf5.slice(0, size - 1));
      t.deepEqual(murmurHash(databuf, seed, 'buffer').slice(0, size - 1),      buf5.slice(0, size - 1));
      t.deepEqual(buf5.slice(size - 1), databuf.slice(size - 1));

      var buf6 = Buffer.allocUnsafe(databuf.length); databuf.copy(buf6);
      t.strictEqual(murmurHash(buf6, seed, buf6, -size, -size + 2), buf6);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer').slice(2),
                        buf6.slice(databuf.length - size, databuf.length - 2));
      t.deepEqual(murmurHash(databuf, seed, 'buffer').slice(2),
                        buf6.slice(databuf.length - size, databuf.length - 2));
      t.deepEqual(buf6.slice(0, databuf.length - size), databuf.slice(0, databuf.length - size));
      t.deepEqual(buf6.slice(databuf.length - 2), databuf.slice(databuf.length - 2));

      t.end();
    });

    t.end();
  });

});

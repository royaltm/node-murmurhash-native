"use strict";

var test = require("tap").test
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
  });
  t.end();
});

[
  [4, 'murmurHash', hash.murmurHash, 0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      '50191cd1'],
  [4, 'murmurHash', hash.murmurHash32, 0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7',
      '50191cd1'],
  [8, 'murmurHash64x64', hash.murmurHash64x64,
      '0000000000000000', '952d4201a42f3c31', 'c6a4a7935bd064dc',
      '0000000000000000', '952d4201a42f3c31', 'c6a4a7935bd064dc',
      'e5718ae073beb171'],
  [8, 'murmurHash64x86', hash.murmurHash64x86,
      '0000000000000000', 'f107ca78f6c98ab0', 'dd9f019f79505248',
      '0000000000000000', 'f107ca78f6c98ab0', 'dd9f019f79505248',
      '20010cf69cfc8f5b'],
  [16, 'murmurHash128x64', hash.murmurHash128x64,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '56ca212715c05cb53aa4737dfb49076f'],
  [16, 'murmurHash128x86', hash.murmurHash128x86,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '09cc949d260a8dd2de241315de241315'],
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
      t.throws(function() { murmurHash(new Buffer(0), 0, ""); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );
      t.throws(function() { murmurHash(new Buffer(0), ""); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );
      t.throws(function() { murmurHash("", 0, ""); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );
      t.throws(function() { murmurHash("", 0, "mumber"); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );
      t.throws(function() { murmurHash("", 0, "xxxxxxx"); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );
      t.throws(function() { murmurHash("", 0, "utf-8"); }, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") );

      t.end();
    });

    t.test('should create number hash from empty data', function(t) {
      t.strictEqual(murmurHash(''), seedZeroDefault);
      t.strictEqual(murmurHash('', 'number'), seedZeroDefault);
      t.strictEqual(murmurHash(new Buffer('')), seedZeroDefault);
      t.strictEqual(murmurHash(new Buffer(''), 'number'), seedZeroDefault);
      t.strictEqual(murmurHash('', -1), seedMinusOneDefault);
      t.strictEqual(murmurHash('', -1, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash(new Buffer(''), -1), seedMinusOneDefault);
      t.strictEqual(murmurHash(new Buffer(''), -1, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 4294967295), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 4294967295, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash(new Buffer(''), 4294967295), seedMinusOneDefault);
      t.strictEqual(murmurHash(new Buffer(''), 4294967295, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 4294967296), seedZeroDefault);
      t.strictEqual(murmurHash('', 4294967296, 'number'), seedZeroDefault);
      t.strictEqual(murmurHash(new Buffer(''), 4294967296), seedZeroDefault);
      t.strictEqual(murmurHash(new Buffer(''), 4294967296, 'number'), seedZeroDefault);
      t.strictEqual(murmurHash('', 1), seedPlusOneDefault);
      t.strictEqual(murmurHash('', 1, 'number'), seedPlusOneDefault);
      t.strictEqual(murmurHash(new Buffer(''), 1), seedPlusOneDefault);
      t.strictEqual(murmurHash(new Buffer(''), 1, 'number'), seedPlusOneDefault);

      t.end();
    });

    t.test('should create buffer hash from empty data', function(t) {
      t.deepEqual(murmurHash('', 0, 'buffer'), seedZeroBuffer);
      t.strictEqual(murmurHash('', 0, 'buffer').toString('hex'), seedZeroHex);
      t.deepEqual(murmurHash(new Buffer(''), 'buffer'), seedZeroBuffer);
      t.strictEqual(murmurHash(new Buffer(''), 'buffer').toString('hex'), seedZeroHex);
      t.deepEqual(murmurHash('', -1, 'buffer'), seedMinusOneBuffer);
      t.strictEqual(murmurHash('', -1, 'buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(murmurHash(new Buffer(''), -1, 'buffer'), seedMinusOneBuffer);
      t.strictEqual(murmurHash(new Buffer(''), -1, 'buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(murmurHash('', 4294967295, 'buffer'), seedMinusOneBuffer);
      t.strictEqual(murmurHash('', 4294967295, 'buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(murmurHash(new Buffer(''), 4294967295, 'buffer'), seedMinusOneBuffer);
      t.strictEqual(murmurHash(new Buffer(''), 4294967295, 'buffer').toString('hex'), seedMinusOneHex);
      t.deepEqual(murmurHash('', 4294967296, 'buffer'), seedZeroBuffer);
      t.strictEqual(murmurHash('', 4294967296, 'buffer').toString('hex'), seedZeroHex);
      t.deepEqual(murmurHash(new Buffer(''), 4294967296, 'buffer'), seedZeroBuffer);
      t.strictEqual(murmurHash(new Buffer(''), 4294967296, 'buffer').toString('hex'), seedZeroHex);
      t.deepEqual(murmurHash('', 1, 'buffer'), seedPlusOneBuffer);
      t.strictEqual(murmurHash('', 1, 'buffer').toString('hex'), seedPlusOneHex);
      t.deepEqual(murmurHash(new Buffer(''), 1, 'buffer'), seedPlusOneBuffer);
      t.strictEqual(murmurHash(new Buffer(''), 1, 'buffer').toString('hex'), seedPlusOneHex);

      t.end();
    });

    t.test('should create string encoded hash from empty data', function(t) {
      t.strictEqual(murmurHash('', 0, 'hex'), seedZeroHex);
      t.strictEqual(murmurHash(new Buffer(''), 'hex'), seedZeroHex);
      t.strictEqual(murmurHash('', -1, 'hex'), seedMinusOneHex);
      t.strictEqual(murmurHash(new Buffer(''), -1, 'hex'), seedMinusOneHex);
      t.strictEqual(murmurHash('', 4294967295, 'hex'), seedMinusOneHex);
      t.strictEqual(murmurHash(new Buffer(''), 4294967295, 'hex'), seedMinusOneHex);
      t.strictEqual(murmurHash('', 4294967296, 'hex'), seedZeroHex);
      t.strictEqual(murmurHash(new Buffer(''), 4294967296, 'hex'), seedZeroHex);
      t.strictEqual(murmurHash('', 1, 'hex'), seedPlusOneHex);
      t.strictEqual(murmurHash(new Buffer(''), 1, 'hex'), seedPlusOneHex);
      t.strictEqual(murmurHash('', 0, 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash(new Buffer(''), 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash('', -1, 'base64'), seedMinusOneBase64);
      t.strictEqual(murmurHash(new Buffer(''), -1, 'base64'), seedMinusOneBase64);
      t.strictEqual(murmurHash('', 4294967295, 'base64'), seedMinusOneBase64);
      t.strictEqual(murmurHash(new Buffer(''), 4294967295, 'base64'), seedMinusOneBase64);
      t.strictEqual(murmurHash('', 4294967296, 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash(new Buffer(''), 4294967296, 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash('', 1, 'base64'), seedPlusOneBase64);
      t.strictEqual(murmurHash(new Buffer(''), 1, 'base64'), seedPlusOneBase64);
      t.strictEqual(murmurHash('', 0, 'binary'), seedZeroBinary);
      t.strictEqual(murmurHash(new Buffer(''), 'binary'), seedZeroBinary);
      t.strictEqual(murmurHash('', -1, 'binary'), seedMinusOneBinary);
      t.strictEqual(murmurHash(new Buffer(''), -1, 'binary'), seedMinusOneBinary);
      t.strictEqual(murmurHash('', 4294967295, 'binary'), seedMinusOneBinary);
      t.strictEqual(murmurHash(new Buffer(''), 4294967295, 'binary'), seedMinusOneBinary);
      t.strictEqual(murmurHash('', 4294967296, 'binary'), seedZeroBinary);
      t.strictEqual(murmurHash(new Buffer(''), 4294967296, 'binary'), seedZeroBinary);
      t.strictEqual(murmurHash('', 1, 'binary'), seedPlusOneBinary);
      t.strictEqual(murmurHash(new Buffer(''), 1, 'binary'), seedPlusOneBinary);

      t.end();
    });

    t.test('should utilize different string input encodings', function(t) {
      var string = "\u1220łóżko"
        , base64 = 'IELzfGtv'
        , hex = '2042f37c6b6f'
        , hash = murmurHash(string);
      t.strictEqual(hash,
         murmurHash(new Buffer(string, 'binary')));
      t.strictEqual(murmurHash(string, 'ascii'),
         murmurHash(new Buffer(string, 'ascii')));
      t.strictEqual(murmurHash(string, 'ascii'), hash);
      t.strictEqual(murmurHash(string, 'binary'),
         murmurHash(new Buffer(string, 'binary')));
      t.strictEqual(murmurHash(string, 'binary'), hash);
      t.strictEqual(murmurHash(string, 'utf8'),
         murmurHash(new Buffer(string, 'utf8')));
      t.strictEqual(murmurHash(string, 'utf-8'),
         murmurHash(new Buffer(string, 'utf-8')));
      t.strictEqual(murmurHash(string, 'ucs2'),
         murmurHash(new Buffer(string, 'ucs2')));
      t.strictEqual(murmurHash(string, 'ucs-2'),
         murmurHash(new Buffer(string, 'ucs-2')));
      t.strictEqual(murmurHash(string, 'utf16le'),
         murmurHash(new Buffer(string, 'utf16le')));
      t.strictEqual(murmurHash(string, 'utf-16le'),
         murmurHash(new Buffer(string, 'utf-16le')));
      t.strictEqual(murmurHash(base64, 'base64'), hash);
      t.strictEqual(murmurHash(base64, 'base64'),
         murmurHash(new Buffer(base64, 'base64')));
      t.strictEqual(murmurHash(hex, 'hex'), hash);
      t.strictEqual(murmurHash(hex, 'hex'),
         murmurHash(new Buffer(hex, 'hex')));

      t.end();
    });


    t.test('should create hash from some random data', function(t) {
      var data = '';
      for (var i = 0; i < 1000; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var buffer = new Buffer(data, 'binary');
      t.equal(murmurHash(data, 0, 'buffer').length, size);
      t.equal(murmurHash(buffer, 'buffer').length, size);
      t.strictEqual(murmurHash(data, 'utf8'), murmurHash(new Buffer(data, 'utf8')));
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
      t.deepEqual(hash, new Buffer(crashTestHex, 'hex'));
      t.end();
    });

    t.test('should interpret 1 argument properly', function(t) {
      t.strictEqual(murmurHash(''), seedZeroDefault);
      t.strictEqual(murmurHash(new Buffer(0)), seedZeroDefault);

      t.end();
    });

    t.test('should interpret 2[+2] arguments properly', function(t) {
      t.strictEqual(murmurHash('', 0), seedZeroDefault);
      t.strictEqual(murmurHash('', -1), seedMinusOneDefault);
      t.strictEqual(murmurHash(new Buffer(0), 0), seedZeroDefault);
      t.strictEqual(murmurHash(new Buffer(0), -1), seedMinusOneDefault);
      t.strictEqual(murmurHash(new Buffer(0), 0, 'base64'), seedZeroBase64);
      t.strictEqual(murmurHash(new Buffer(0), -1, 'base64'), seedMinusOneBase64);
      t.strictEqual(murmurHash(new Buffer(0), 'base64', 0), seedZeroBase64);
      t.strictEqual(murmurHash(new Buffer(0), 'base64', -1), seedMinusOneBase64);
      t.strictEqual(murmurHash('\u1234', 'ucs2'), murmurHash(new Buffer('\u1234', 'ucs2')));
      t.strictEqual(murmurHash('\u1234', 'utf8'), murmurHash(new Buffer('\u1234', 'utf8')));
      t.strictEqual(murmurHash('\u1234', 'ascii'), murmurHash(new Buffer('\u1234', 'ascii')));
      t.strictEqual(murmurHash('\u1234', 'binary'), murmurHash(new Buffer('\u1234', 'binary')));
      t.strictEqual(murmurHash('/w==', 'base64'), murmurHash(new Buffer('/w==', 'base64')));
      t.strictEqual(murmurHash('ff', 'hex'), murmurHash(new Buffer('ff', 'hex')));
      t.strictEqual(murmurHash('ó', 'number'), murmurHash(new Buffer('ó', 'binary')));
      t.deepEqual(murmurHash('ą', 'buffer'), murmurHash(new Buffer('ą', 'binary'), 0, 'buffer'));
      t.strictEqual(murmurHash(new Buffer([0xFF]), 'hex'),
                    murmurHash(new Buffer('\u12FF', 'binary'), 'hex'));
      t.strictEqual(murmurHash(new Buffer([0xFF]), 'number'),
                    murmurHash(new Buffer('\u12FF', 'binary'), 'number'));
      t.strictEqual(murmurHash(new Buffer([0xFF]), 'binary'),
                    murmurHash(new Buffer('\u12FF', 'binary'), 'binary'));
      t.deepEqual(murmurHash(new Buffer([0xFF]), 'buffer'),
                    murmurHash(new Buffer('\u12FF', 'binary'), 'buffer'));

      var buf = new Buffer(size); buf.fill(-1);
      t.strictEqual(murmurHash('', buf), buf);
      t.deepEqual(buf, new Buffer(seedZeroHex, 'hex'));
      buf.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), buf), buf);
      t.deepEqual(buf, new Buffer(seedZeroHex, 'hex'));

      var buf2 = new Buffer(size + 2); buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash('', buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedZeroHex, 'hex')]));
      buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash(new Buffer(0), buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedZeroHex, 'hex')]));

      var buf3 = new Buffer(size - 1); buf3.fill(-1);
      t.strictEqual(murmurHash('', buf3, -size), buf3);
      t.deepEqual(buf3, new Buffer(seedZeroHex, 'hex').slice(1));
      buf3.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), buf3, -size), buf3);
      t.deepEqual(buf3, new Buffer(seedZeroHex, 'hex').slice(1));

      var bufpad = new Buffer(size - 3); bufpad.fill(-1);

      var buf4 = new Buffer(size + 2); buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash('', buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                       new Buffer(seedZeroHex, 'hex').slice(0, 3),
                                       bufpad]));
      buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash(new Buffer(0), buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                       new Buffer(seedZeroHex, 'hex').slice(0, 3),
                                       bufpad]));

      var buf5 = new Buffer(size - 1); buf5.fill(-1);
      t.strictEqual(murmurHash('', buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([new Buffer(seedZeroHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));
      buf5.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([new Buffer(seedZeroHex, 'hex').slice(size - 3 + 1),
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
      t.deepEqual(murmurHash('', -1, 'buffer'), new Buffer(seedMinusOneHex, 'hex'));
      t.deepEqual(murmurHash('', -1, 'buffer', 1), new Buffer(seedMinusOneHex, 'hex'));
      t.strictEqual(murmurHash('', 1, -1), seedMinusOneDefault);
      t.strictEqual(murmurHash('', null, -1), seedMinusOneDefault);
      t.strictEqual(murmurHash(new Buffer(0), -1, 0), seedZeroDefault);
      t.strictEqual(murmurHash(new Buffer(0), -1, null), seedMinusOneDefault);
      t.strictEqual(murmurHash(new Buffer(0), -1, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash(new Buffer(0), -1, 'number', 1), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), -1, 'buffer'), new Buffer(seedMinusOneHex, 'hex'));
      t.deepEqual(murmurHash(new Buffer(0), -1, 'buffer', 1), new Buffer(seedMinusOneHex, 'hex'));
      t.deepEqual(murmurHash(new Buffer(0), 1, -1), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), null, -1), seedMinusOneDefault);
      t.strictEqual(murmurHash('\u1234', 'utf8', 100), murmurHash(new Buffer('\u1234', 'utf8'), 100));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'number', 100),
                  murmurHash(new Buffer('\u1234', 'binary'), 100));
      t.deepEqual(murmurHash('\u1234', 'utf8', 'buffer'),
                    murmurHash(new Buffer('\u1234', 'utf8'), 0, 'buffer'));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'buffer'),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer'));
      t.deepEqual(murmurHash('\u1234', 'utf8', 'buffer', -1),
                    murmurHash(new Buffer('\u1234', 'utf8'), 0, 'buffer'));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'ignore', 'buffer', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer'));
      t.deepEqual(murmurHash('\u1234', null, 'buffer'),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer'));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 'buffer'),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer'));
      t.deepEqual(murmurHash('\u1234', null, 'buffer', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer'));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 'buffer', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer'));
      t.strictEqual(murmurHash('\u1234', null, null),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), null, null),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));
      t.strictEqual(murmurHash('\u1234', null, null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), null, null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));
      t.strictEqual(murmurHash('\u1234', 'utf8', null),
                  murmurHash(new Buffer('\u1234', 'utf8'), 0));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'number', null),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));
      t.strictEqual(murmurHash('\u1234', 'utf8', null, -1),
                  murmurHash(new Buffer('\u1234', 'utf8'), 0));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'number', null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));

      var buf = new Buffer(size); buf.fill(-1);
      t.strictEqual(murmurHash('', -1, buf), buf);
      t.deepEqual(buf, new Buffer(seedMinusOneHex, 'hex'));
      buf.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), -1, buf), buf);
      t.deepEqual(buf, new Buffer(seedMinusOneHex, 'hex'));

      var buf2 = new Buffer(size + 2); buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash('', -1, buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedMinusOneHex, 'hex')]));
      buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash(new Buffer(0), -1, buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedMinusOneHex, 'hex')]));

      var buf3 = new Buffer(size - 1); buf3.fill(-1);
      t.strictEqual(murmurHash('', -1, buf3, -size), buf3);
      t.deepEqual(buf3, new Buffer(seedMinusOneHex, 'hex').slice(1));
      buf3.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), -1, buf3, -size), buf3);
      t.deepEqual(buf3, new Buffer(seedMinusOneHex, 'hex').slice(1));

      var bufpad = new Buffer(size - 3); bufpad.fill(-1);

      var buf4 = new Buffer(size + 2); buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash('', -1, buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                       new Buffer(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));
      buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash(new Buffer(0), -1, buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                       new Buffer(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));

      var buf5 = new Buffer(size - 1); buf5.fill(-1);
      t.strictEqual(murmurHash('', -1, buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([new Buffer(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));
      buf5.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), -1, buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([new Buffer(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));

      t.end();
    });

    t.test('should interpret 4[+2] arguments properly', function(t) {
      t.strictEqual(murmurHash('', 'utf8', -1, 0), seedZeroDefault);
      t.strictEqual(murmurHash('', 'utf8', -1, null), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 'utf8', -1, null, 1), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 'utf8', -1, 'number'), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 'utf8', -1, 'number', 1), seedMinusOneDefault);
      t.deepEqual(murmurHash('', 'utf8', -1, 'buffer'), new Buffer(seedMinusOneHex, 'hex'));
      t.deepEqual(murmurHash('', 'utf8', -1, 'buffer', 1), new Buffer(seedMinusOneHex, 'hex'));
      t.strictEqual(murmurHash('', 'utf8', 1, -1), seedMinusOneDefault);
      t.strictEqual(murmurHash('', 'utf8', null, -1), seedZeroDefault);
      t.strictEqual(murmurHash(new Buffer(0), 'hex', -1, 0), seedMinusOneHex);
      t.strictEqual(murmurHash(new Buffer(0), 'hex', -1, null), seedMinusOneHex);
      t.strictEqual(murmurHash(new Buffer(0), 'hex', -1, null, 1), seedMinusOneHex);
      t.strictEqual(murmurHash(new Buffer(0), 'hex', -1, 'ignore'), seedMinusOneHex);
      t.strictEqual(murmurHash(new Buffer(0), 'hex', -1, 'ignore', 1), seedMinusOneHex);
      t.deepEqual(murmurHash(new Buffer(0), 'buffer', -1, 'ignore'), new Buffer(seedMinusOneHex, 'hex'));
      t.deepEqual(murmurHash(new Buffer(0), 'buffer', -1, 'ignore', 1), new Buffer(seedMinusOneHex, 'hex'));
      t.strictEqual(murmurHash(new Buffer(0), 'number', 1, -1), seedPlusOneDefault);
      t.strictEqual(murmurHash(new Buffer(0), 'number', null, -1), seedZeroDefault);
      t.deepEqual(murmurHash('\u1234', 'utf8', 100, 'buffer'),
                    murmurHash(new Buffer('\u1234', 'utf8'), 100, 'buffer'));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'buffer', 100, 'ignore'),
                    murmurHash(new Buffer('\u1234', 'binary'), 100, 'buffer'));
      t.deepEqual(murmurHash('\u1234', 'utf8', 100, 'buffer', -1),
                    murmurHash(new Buffer('\u1234', 'utf8'), 100, 'buffer'));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'buffer', 100, 'ignore', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 100, 'buffer'));
      t.deepEqual(murmurHash('\u1234', 'utf8', 0, 'buffer'),
                    murmurHash(new Buffer('\u1234', 'utf8'), 'buffer'));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'buffer', 0, 'ignore'),
                    murmurHash(new Buffer('\u1234', 'binary'), 'buffer'));
      t.deepEqual(murmurHash('\u1234', 'utf8', 0, 'buffer', -1),
                    murmurHash(new Buffer('\u1234', 'utf8'), 'buffer'));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'buffer', 0, 'ignore', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 'buffer'));
      t.deepEqual(murmurHash('\u1234', null, 1, 'buffer'),
                    murmurHash(new Buffer('\u1234', 'binary'), 1, 'buffer'));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 1, 'buffer'),
                    murmurHash(new Buffer('\u1234', 'binary'), 1, 'buffer'));
      t.deepEqual(murmurHash('\u1234', null, 1, 'buffer', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 1, 'buffer'));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 1, 'buffer', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 1, 'buffer'));
      t.strictEqual(murmurHash('\u1234', null, 1, null),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 1, null),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));
      t.strictEqual(murmurHash('\u1234', null, 1, null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 1, null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));
      t.strictEqual(murmurHash('\u1234', 'utf8', 1, null),
                  murmurHash(new Buffer('\u1234', 'utf8'), 1));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'number', 1, null),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));
      t.strictEqual(murmurHash('\u1234', 'utf8', 1, null, -1),
                  murmurHash(new Buffer('\u1234', 'utf8'), 1));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'number', 1, null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));

      var buf = new Buffer(size); buf.fill(-1);
      t.strictEqual(murmurHash('', 'utf8', -1, buf), buf);
      t.deepEqual(buf, new Buffer(seedMinusOneHex, 'hex'));
      buf.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), -1, buf, 0), buf);
      t.deepEqual(buf, new Buffer(seedMinusOneHex, 'hex'));

      var buf2 = new Buffer(size + 2); buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash('', 'binary', -1, buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedMinusOneHex, 'hex')]));
      buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash(new Buffer(0), -1, buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedMinusOneHex, 'hex')]));

      var buf3 = new Buffer(size - 1); buf3.fill(-1);
      t.strictEqual(murmurHash('', 'ascii', -1, buf3, -size), buf3);
      t.deepEqual(buf3, new Buffer(seedMinusOneHex, 'hex').slice(1));
      buf3.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), -1, buf3, -size), buf3);
      t.deepEqual(buf3, new Buffer(seedMinusOneHex, 'hex').slice(1));

      var bufpad = new Buffer(size - 3); bufpad.fill(-1);

      var buf4 = new Buffer(size + 2); buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash('', 'ucs2', -1, buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                       new Buffer(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));
      buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash(new Buffer(0), -1, buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                       new Buffer(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));

      var buf5 = new Buffer(size - 1); buf5.fill(-1);
      t.strictEqual(murmurHash('', 'hex', -1, buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([new Buffer(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));
      buf5.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), -1, buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([new Buffer(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));

      t.end();
    });

    t.test('should write hash into the same buffer it is reading from', function(t) {
      var data = '';
      for (var i = 0; i < 1000; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var databuf = new Buffer(data, 'utf8');
      var seed = (Math.random() * 0x100000000)|0;

      var buf = Buffer.concat([databuf, new Buffer(size)]); buf.fill(-1, databuf.length);
      t.strictEqual(murmurHash(buf.slice(0, databuf.length), seed, buf, databuf.length), buf);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer'), buf.slice(databuf.length));
      t.deepEqual(murmurHash(databuf, seed, 'buffer'),      buf.slice(databuf.length));

      var buf2 = Buffer.concat([new Buffer(size), databuf]); buf2.fill(-1, 0, size);
      t.strictEqual(murmurHash(buf2.slice(size), seed, buf2), buf2);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer'), buf2.slice(0, size));
      t.deepEqual(murmurHash(databuf, seed, 'buffer'),      buf2.slice(0, size));

      var buf3 = new Buffer(databuf.length); databuf.copy(buf3);
      t.strictEqual(murmurHash(buf3, seed, buf3), buf3);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer'), buf3.slice(0, size));
      t.deepEqual(murmurHash(databuf, seed, 'buffer'),      buf3.slice(0, size));
      t.deepEqual(buf3.slice(size), databuf.slice(size));

      var buf4 = new Buffer(databuf.length); databuf.copy(buf4);
      t.strictEqual(murmurHash(buf4, seed, buf4, -size), buf4);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer'), buf4.slice(databuf.length - size));
      t.deepEqual(murmurHash(databuf, seed, 'buffer'),      buf4.slice(databuf.length - size));
      t.deepEqual(buf4.slice(0, databuf.length - size), databuf.slice(0, databuf.length - size));

      var buf5 = new Buffer(databuf.length); databuf.copy(buf5);
      t.strictEqual(murmurHash(buf5, seed, buf5, 0, size - 1), buf5);
      t.deepEqual(murmurHash(data, 'utf8', seed, 'buffer').slice(0, size - 1), buf5.slice(0, size - 1));
      t.deepEqual(murmurHash(databuf, seed, 'buffer').slice(0, size - 1),      buf5.slice(0, size - 1));
      t.deepEqual(buf5.slice(size - 1), databuf.slice(size - 1));

      var buf6 = new Buffer(databuf.length); databuf.copy(buf6);
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

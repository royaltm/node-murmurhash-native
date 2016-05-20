"use strict";

var test = require("tap").test
  , promisify = require('../promisify')
  , hash = promisify(global.Promise || require('bluebird'))
;

test("should have murmurHash functions", function(t) {
  t.plan(8*2);
  ['murmurHashAsync',
   'murmurHash32Async',
   'murmurHash64Async',
   'murmurHash64x64Async',
   'murmurHash64x86Async',
   'murmurHash128x64Async',
   'murmurHash128Async',
   'murmurHash128x86Async'
  ].forEach(function(name) {
    t.type(hash[name], 'function');
    t.strictEqual(hash[name].name, name);
  });
});

[
  [4, 'murmurHash', hash.murmurHashAsync, 0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7'],
  [4, 'murmurHash', hash.murmurHash32Async, 0, 2180083513, 1364076727,
      '00000000', '81f16f39', '514e28b7'],
  [8, 'murmurHash64x64', hash.murmurHash64x64Async,
      '0000000000000000', '952d4201a42f3c31', 'c6a4a7935bd064dc',
      '0000000000000000', '952d4201a42f3c31', 'c6a4a7935bd064dc'],
  [8, 'murmurHash64x86', hash.murmurHash64x86Async,
      '0000000000000000', 'f107ca78f6c98ab0', 'dd9f019f79505248',
      '0000000000000000', 'f107ca78f6c98ab0', 'dd9f019f79505248'],
  [16, 'murmurHash128x64', hash.murmurHash128x64Async,
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583',
      '00000000000000000000000000000000', '6af1df4d9d3bc9ec857421121ee6446b',
      '4610abe56eff5cb551622daa78f83583'],
  [16, 'murmurHash128x86', hash.murmurHash128x86Async,
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9',
      '00000000000000000000000000000000', '051e08a9989d49f7989d49f7989d49f7',
      '88c4adec54d201b954d201b954d201b9'],
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
    , seedZeroBuffer      = new Buffer(seedZeroHex,  'hex')
    , seedMinusOneBuffer  = new Buffer(seedMinusOneHex, 'hex')
    , seedPlusOneBuffer   = new Buffer(seedPlusOneHex,  'hex')


  test(label, function(t) {

    t.type(murmurHash, 'function');

    t.test('should throw error for bad arguments', function(t) {
      t.plan(21*2);
      function testerr(err, expect) {
        t.type(err, expect.constructor);
        t.strictEqual(err.message, expect.message);
      }
      murmurHash().catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash({}).catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash([]).catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash(void(0)).catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash(null).catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash(true).catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash(false).catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash(0).catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash(1).catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash(-1).catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash(new Date()).catch(function(err) { testerr(err, new TypeError("string or Buffer is required") ) });
      murmurHash("", "abcdefghijklmno").catch(function(err) { testerr(err, new TypeError("\"encoding\" must be a valid string encoding") ) });
      murmurHash("", "123456").catch(function(err) { testerr(err, new TypeError("\"encoding\" must be a valid string encoding") ) });
      murmurHash("", "12345").catch(function(err) { testerr(err, new TypeError("\"encoding\" must be a valid string encoding") ) });
      murmurHash("", "1234").catch(function(err) { testerr(err, new TypeError("\"encoding\" must be a valid string encoding") ) });
      murmurHash("", "123").catch(function(err) { testerr(err, new TypeError("\"encoding\" must be a valid string encoding") ) });
      murmurHash("", "").catch(function(err) { testerr(err, new TypeError("\"encoding\" must be a valid string encoding") ) });
      murmurHash("", 0, "").catch(function(err) { testerr(err, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") ) });
      murmurHash("", 0, "mumber").catch(function(err) { testerr(err, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") ) });
      murmurHash("", 0, "xxxxxxx").catch(function(err) { testerr(err, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") ) });
      murmurHash("", 0, "utf-8").catch(function(err) { testerr(err, new TypeError("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"") ) });
    });

    t.test('should create number hash from empty data', function(t) {
      t.plan(20);
      murmurHash('').then(function(res) { t.strictEqual(res, seedZeroDefault) });
      murmurHash('', 'number').then(function(res) { t.strictEqual(res, seedZeroDefault) });
      murmurHash(new Buffer('')).then(function(res) { t.strictEqual(res, seedZeroDefault) });
      murmurHash(new Buffer(''), 'number').then(function(res) { t.strictEqual(res, seedZeroDefault) });
      murmurHash('', -1).then(function(res) { t.strictEqual(res, seedMinusOneDefault) });
      murmurHash('', -1, 'number').then(function(res) { t.strictEqual(res, seedMinusOneDefault) });
      murmurHash(new Buffer(''), -1).then(function(res) { t.strictEqual(res, seedMinusOneDefault) });
      murmurHash(new Buffer(''), -1, 'number').then(function(res) { t.strictEqual(res, seedMinusOneDefault) });
      murmurHash('', 4294967295).then(function(res) { t.strictEqual(res, seedMinusOneDefault) });
      murmurHash('', 4294967295, 'number').then(function(res) { t.strictEqual(res, seedMinusOneDefault) });
      murmurHash(new Buffer(''), 4294967295).then(function(res) { t.strictEqual(res, seedMinusOneDefault) });
      murmurHash(new Buffer(''), 4294967295, 'number').then(function(res) { t.strictEqual(res, seedMinusOneDefault) });
      murmurHash('', 4294967296).then(function(res) { t.strictEqual(res, seedZeroDefault) });
      murmurHash('', 4294967296, 'number').then(function(res) { t.strictEqual(res, seedZeroDefault) });
      murmurHash(new Buffer(''), 4294967296).then(function(res) { t.strictEqual(res, seedZeroDefault) });
      murmurHash(new Buffer(''), 4294967296, 'number').then(function(res) { t.strictEqual(res, seedZeroDefault) });
      murmurHash('', 1).then(function(res) { t.strictEqual(res, seedPlusOneDefault) });
      murmurHash('', 1, 'number').then(function(res) { t.strictEqual(res, seedPlusOneDefault) });
      murmurHash(new Buffer(''), 1).then(function(res) { t.strictEqual(res, seedPlusOneDefault) });
      murmurHash(new Buffer(''), 1, 'number').then(function(res) { t.strictEqual(res, seedPlusOneDefault) });
    });

    t.test('should create buffer hash from empty data', function(t) {
      t.plan(20);
      murmurHash('', 0, 'buffer').then(function(res) { t.deepEqual(res, seedZeroBuffer) });
      murmurHash('', 0, 'buffer').then(function(res) { t.strictEqual(res.toString('hex'), seedZeroHex) });
      murmurHash(new Buffer(''), 'buffer').then(function(res) { t.deepEqual(res, seedZeroBuffer) });
      murmurHash(new Buffer(''), 'buffer').then(function(res) { t.strictEqual(res.toString('hex'), seedZeroHex) });
      murmurHash('', -1, 'buffer').then(function(res) { t.deepEqual(res, seedMinusOneBuffer) });
      murmurHash('', -1, 'buffer').then(function(res) { t.strictEqual(res.toString('hex'), seedMinusOneHex) });
      murmurHash(new Buffer(''), -1, 'buffer').then(function(res) { t.deepEqual(res, seedMinusOneBuffer) });
      murmurHash(new Buffer(''), -1, 'buffer').then(function(res) { t.strictEqual(res.toString('hex'), seedMinusOneHex) });
      murmurHash('', 4294967295, 'buffer').then(function(res) { t.deepEqual(res, seedMinusOneBuffer) });
      murmurHash('', 4294967295, 'buffer').then(function(res) { t.strictEqual(res.toString('hex'), seedMinusOneHex) });
      murmurHash(new Buffer(''), 4294967295, 'buffer').then(function(res) { t.deepEqual(res, seedMinusOneBuffer) });
      murmurHash(new Buffer(''), 4294967295, 'buffer').then(function(res) { t.strictEqual(res.toString('hex'), seedMinusOneHex) });
      murmurHash('', 4294967296, 'buffer').then(function(res) { t.deepEqual(res, seedZeroBuffer) });
      murmurHash('', 4294967296, 'buffer').then(function(res) { t.strictEqual(res.toString('hex'), seedZeroHex) });
      murmurHash(new Buffer(''), 4294967296, 'buffer').then(function(res) { t.deepEqual(res, seedZeroBuffer) });
      murmurHash(new Buffer(''), 4294967296, 'buffer').then(function(res) { t.strictEqual(res.toString('hex'), seedZeroHex) });
      murmurHash('', 1, 'buffer').then(function(res) { t.deepEqual(res, seedPlusOneBuffer) });
      murmurHash('', 1, 'buffer').then(function(res) { t.strictEqual(res.toString('hex'), seedPlusOneHex) });
      murmurHash(new Buffer(''), 1, 'buffer').then(function(res) { t.deepEqual(res, seedPlusOneBuffer) });
      murmurHash(new Buffer(''), 1, 'buffer').then(function(res) { t.strictEqual(res.toString('hex'), seedPlusOneHex) });
    });

    t.end();
  });

});

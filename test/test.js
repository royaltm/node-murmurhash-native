var test = require("tap").test
  , hash = require('..')
  , isNode010 = isNodeAtLeast(0, 10);
;

function isNodeAtLeast(major, minor) {
  var ver = process.versions.node.split('.', 2);
  return ver[0] > major || (ver[0] == major && ver[1] >= minor);
}

test("should have murmurHash functions", function(t) {
  t.type(hash.murmurHash, 'function');
  t.type(hash.murmurHash64, 'function');
  t.type(hash.murmurHash64x64, 'function');
  t.type(hash.murmurHash64x86, 'function');
  t.type(hash.murmurHash128x64, 'function');
  t.type(hash.murmurHash128, 'function');
  t.type(hash.murmurHash128x86, 'function');
  t.end();
});

[
  [4, 'murmurHash', hash.murmurHash, 0, -2114883783, 1364076727,
      '00000000', '396ff181', 'b7284e51',
      'd11c1950'],
  [8, 'murmurHash64x64', hash.murmurHash64x64,
      new Buffer('0000000000000000', 'hex'),
      new Buffer('313c2fa401422d95', 'hex'),
      new Buffer('dc64d05b93a7a4c6', 'hex'),
      '0000000000000000', '313c2fa401422d95', 'dc64d05b93a7a4c6',
      '71b1be73e08a71e5'],
  [8, 'murmurHash64x86', hash.murmurHash64x86,
      new Buffer('0000000000000000', 'hex'),
      new Buffer('b08ac9f678ca07f1', 'hex'),
      new Buffer('485250799f019fdd', 'hex'),
      '0000000000000000', 'b08ac9f678ca07f1', '485250799f019fdd',
      '5b8ffc9cf60c0120'],
  [16, 'murmurHash128x64', hash.murmurHash128x64,
      new Buffer('00000000000000000000000000000000', 'hex'),
      new Buffer('ecc93b9d4ddff16a6b44e61e12217485', 'hex'),
      new Buffer('b55cff6ee5ab10468335f878aa2d6251', 'hex'),
      '00000000000000000000000000000000', 'ecc93b9d4ddff16a6b44e61e12217485',
      'b55cff6ee5ab10468335f878aa2d6251',
      'b55cc0152721ca566f0749fb7d73a43a'],
  [16, 'murmurHash128x86', hash.murmurHash128x86,
      new Buffer('00000000000000000000000000000000', 'hex'),
      new Buffer('a9081e05f7499d98f7499d98f7499d98', 'hex'),
      new Buffer('ecadc488b901d254b901d254b901d254', 'hex'),
      '00000000000000000000000000000000', 'a9081e05f7499d98f7499d98f7499d98',
      'ecadc488b901d254b901d254b901d254',
      '9d94cc09d28d0a26151324de151324de'],
].forEach(function(args) {

  var size                = args[0]
    , label               = args[1]
    , murmurHash          = args[2]
    , seedZeroDefault     = args[3]
    , seedMinusOneDefault = args[4]
    , seedPlusOneDefault  = args[5]
    , seedZeroHex         = args[6]
    , seedMinusOneHex     = args[7]
    , seedPlusOneHex      = args[8]
    , crashTestHex        = args[9]

  test(label, function(t) {

    t.type(murmurHash, 'function');

    t.test('should throw error for bad arguments', function(t) {
      t.throws(function() { murmurHash() }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash({}) }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash([]) }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(void(0)) }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(null) }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(true) }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(false) }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(0) }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(1) }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(-1) }, new TypeError("string or Buffer is required") );
      t.throws(function() { murmurHash(new Date()) }, new TypeError("string or Buffer is required") );

      t.end();
    });

    t.test('should create hash from empty data', function(t) {
      t.deepEqual(murmurHash(''), seedZeroDefault);
      t.deepEqual(murmurHash(new Buffer('')), seedZeroDefault);
      t.deepEqual(murmurHash('', -1), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(''), -1), seedMinusOneDefault);
      t.deepEqual(murmurHash('', 4294967295), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(''), 4294967295), seedMinusOneDefault);
      t.deepEqual(murmurHash('', 4294967296), seedZeroDefault);
      t.deepEqual(murmurHash(new Buffer(''), 4294967296), seedZeroDefault);
      t.deepEqual(murmurHash('', 1), seedPlusOneDefault);
      t.deepEqual(murmurHash(new Buffer(''), 1), seedPlusOneDefault);

      t.end();
    });

    if ( isNode010 ) {
      t.test('should create hex hash from empty data', function(t) {
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

        t.end();
      });
    }


    if ( isNode010 ) {
      t.test('should utilize different string input encodings', function(t) {
        var string = "\u1220łóżko"
          , base64 = 'IELzfGtv'
          , hex = '2042f37c6b6f'
          , hash = murmurHash(string, 0, 'hex');
        t.strictEqual(hash,
           murmurHash(new Buffer(string, 'binary'), 'hex'));
        t.strictEqual(murmurHash(string, 'ascii', 0, 'hex'),
           murmurHash(new Buffer(string, 'ascii'), 'hex'));
        t.strictEqual(murmurHash(string, 'ascii', 0, 'hex'), hash);
        t.strictEqual(murmurHash(string, 'binary', 0, 'hex'),
           murmurHash(new Buffer(string, 'binary'), 'hex'));
        t.strictEqual(murmurHash(string, 'binary', 0, 'hex'), hash);
        t.strictEqual(murmurHash(string, 'utf8', 0, 'hex'),
           murmurHash(new Buffer(string, 'utf8'), 'hex'));
        t.strictEqual(murmurHash(string, 'utf-8', 0, 'hex'),
           murmurHash(new Buffer(string, 'utf-8'), 'hex'));
        t.strictEqual(murmurHash(string, 'ucs2', 0, 'hex'),
           murmurHash(new Buffer(string, 'ucs2'), 'hex'));
        t.strictEqual(murmurHash(string, 'ucs-2', 0, 'hex'),
           murmurHash(new Buffer(string, 'ucs-2'), 'hex'));
        t.strictEqual(murmurHash(string, 'utf16le', 0, 'hex'),
           murmurHash(new Buffer(string, 'utf16le'), 'hex'));
        t.strictEqual(murmurHash(string, 'utf-16le', 0, 'hex'),
           murmurHash(new Buffer(string, 'utf-16le'), 'hex'));
        t.strictEqual(murmurHash(base64, 'base64', 0, 'hex'), hash);
        t.strictEqual(murmurHash(base64, 'base64', 0, 'hex'),
           murmurHash(new Buffer(base64, 'base64'), 'hex'));
        t.strictEqual(murmurHash(hex, 'hex', 0, 'hex'), hash);
        t.strictEqual(murmurHash(hex, 'hex', 0, 'hex'),
           murmurHash(new Buffer(hex, 'hex'), 'hex'));

        t.end();
      });
    }


    t.test('should create hash from some random data', function(t) {
      var data = '';
      for (var i = 0; i < 1000; ++i) data += String.fromCharCode((Math.random()*32768)|0);
      var buffer = new Buffer(data, 'binary');
      t.equal(murmurHash(data, 0, 'buffer').length, size);
      t.equal(murmurHash(buffer, 'buffer').length, size);
      t.deepEqual(murmurHash(data, 'utf8'), murmurHash(new Buffer(data, 'utf8')));
      t.deepEqual(murmurHash(data), murmurHash(buffer));
      t.deepEqual(murmurHash(data, -1), murmurHash(buffer, -1));
      t.deepEqual(murmurHash(data, -1), murmurHash(buffer, 4294967295));
      t.deepEqual(murmurHash(data, 4294967295), murmurHash(buffer, -1));
      if ( isNode010 ) {
        t.strictEqual(murmurHash(data, 0, 'hex'), murmurHash(buffer, 'buffer').toString('hex'));
        t.strictEqual(murmurHash(data, 0, 'base64'), murmurHash(buffer, 'buffer').toString('base64'));
        t.strictEqual(murmurHash(data, 0, 'ucs2'), murmurHash(buffer, 'buffer').toString('ucs2'));
      }
      t.strictEqual(murmurHash(data, 0, 'ascii'), murmurHash(buffer, 'buffer').toString('ascii'));
      t.strictEqual(murmurHash(data, 0, 'binary'), murmurHash(buffer, 'buffer').toString('binary'));
      t.strictEqual(murmurHash(data, 0, 'utf8'), murmurHash(buffer, 'buffer').toString('utf8'));
      var seed = (Math.random()*4294967296)|0;
      t.deepEqual(murmurHash(data, seed), murmurHash(buffer, seed));

      t.end();
    });

    t.test('should not crash with utf8 characters in encoding string', function(t) {
      var match = murmurHash("łabądź", "binary")
        , hash = murmurHash("łabądź",
                 "\u1010\u1111\u1212\u1313\u1414\u1515\u1616\u1717",
                 "\u1010\u1111\u1212\u1313\u1414\u1515\u1616\u1717");
      t.deepEqual(hash, match);
      if ('number' === typeof seedZeroDefault) {
        t.type(hash, 'number', 'hash is number');
        t.deepEqual(hash, new Int32Array(new Int32Array(new Int8Array(new Buffer(crashTestHex, 'hex')).buffer))[0]);
      } else {
        t.type(hash, Buffer, 'hash is buffer');
        t.deepEqual(hash, new Buffer(crashTestHex, 'hex'));
      }
      t.end();
    });

    t.test('should interpret 1 argument properly', function(t) {
      t.deepEqual(murmurHash(''), seedZeroDefault);
      t.deepEqual(murmurHash(new Buffer(0)), seedZeroDefault);

      t.end();
    });

    t.test('should interpret 2[+2] arguments properly', function(t) {
      t.deepEqual(murmurHash('', 0), seedZeroDefault);
      t.deepEqual(murmurHash('', -1), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), 0), seedZeroDefault);
      t.deepEqual(murmurHash(new Buffer(0), -1), seedMinusOneDefault);
      t.deepEqual(murmurHash('\u1234', 'utf8'), murmurHash(new Buffer('\u1234', 'utf8')));
      t.deepEqual(murmurHash('\u1234', 'ascii'), murmurHash(new Buffer('\u1234', 'ascii')));
      t.deepEqual(murmurHash('\u1234', 'binary'), murmurHash(new Buffer('\u1234', 'binary')));
      t.strictEqual(murmurHash(new Buffer([0xFF]), 'utf8'),
                    murmurHash(new Buffer('\u12FF', 'binary'), 'buffer').toString('utf8'));
      t.strictEqual(murmurHash(new Buffer([0xFF]), 'ascii'),
                    murmurHash(new Buffer('\u12FF', 'binary'), 'buffer').toString('ascii'));
      t.strictEqual(murmurHash(new Buffer([0xFF]), 'binary'),
                    murmurHash(new Buffer('\u12FF', 'binary'), 'buffer').toString('binary'));

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

      var buf3 = new Buffer(size - 1); buf.fill(-1);
      t.strictEqual(murmurHash('', buf3, -size), buf3);
      t.deepEqual(buf3, new Buffer(seedZeroHex, 'hex').slice(1));
      buf.fill(-1);
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
      t.deepEqual(murmurHash('', -1, 0), seedZeroDefault);
      t.deepEqual(murmurHash('', -1, null), seedMinusOneDefault);
      t.deepEqual(murmurHash('', -1, 'number'), seedMinusOneDefault);
      t.deepEqual(murmurHash('', -1, 'number', 1), seedMinusOneDefault);
      t.deepEqual(murmurHash('', -1, 'utf8'), new Buffer(seedMinusOneHex, 'hex').toString('utf8'));
      t.deepEqual(murmurHash('', -1, 'utf8', 1), new Buffer(seedMinusOneHex, 'hex').toString('utf8'));
      t.deepEqual(murmurHash('', 1, -1), seedMinusOneDefault);
      t.deepEqual(murmurHash('', null, -1), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), -1, 0), seedZeroDefault);
      t.deepEqual(murmurHash(new Buffer(0), -1, null), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), -1, 'number'), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), -1, 'number', 1), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), -1, 'utf8'), new Buffer(seedMinusOneHex, 'hex').toString('utf8'));
      t.deepEqual(murmurHash(new Buffer(0), -1, 'utf8', 1), new Buffer(seedMinusOneHex, 'hex').toString('utf8'));
      t.deepEqual(murmurHash(new Buffer(0), 1, -1), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), null, -1), seedMinusOneDefault);
      t.deepEqual(murmurHash('\u1234', 'utf8', 100), murmurHash(new Buffer('\u1234', 'utf8'), 100));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', 100),
                  murmurHash(new Buffer('\u1234', 'binary'), 100));
      t.strictEqual(murmurHash('\u1234', 'utf8', 'utf8'),
                    murmurHash(new Buffer('\u1234', 'utf8'), 0, 'buffer').toString('utf8'));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', 'utf8'),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer').toString('utf8'));
      t.strictEqual(murmurHash('\u1234', 'utf8', 'utf8', -1),
                    murmurHash(new Buffer('\u1234', 'utf8'), 0, 'buffer').toString('utf8'));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', 'utf8', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer').toString('utf8'));
      t.strictEqual(murmurHash('\u1234', null, 'utf8'),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer').toString('utf8'));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 'utf8'),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer').toString('utf8'));
      t.strictEqual(murmurHash('\u1234', null, 'utf8', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer').toString('utf8'));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 'utf8', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 0, 'buffer').toString('utf8'));
      t.deepEqual(murmurHash('\u1234', null, null),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), null, null),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));
      t.deepEqual(murmurHash('\u1234', null, null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), null, null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));
      t.deepEqual(murmurHash('\u1234', 'utf8', null),
                  murmurHash(new Buffer('\u1234', 'utf8'), 0));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', null),
                  murmurHash(new Buffer('\u1234', 'binary'), 0));
      t.deepEqual(murmurHash('\u1234', 'utf8', null, -1),
                  murmurHash(new Buffer('\u1234', 'utf8'), 0));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', null, -1),
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
      t.deepEqual(murmurHash('', 'utf8', -1, 0), seedZeroDefault);
      t.deepEqual(murmurHash('', 'utf8', -1, null), seedMinusOneDefault);
      t.deepEqual(murmurHash('', 'utf8', -1, null, 1), seedMinusOneDefault);
      t.deepEqual(murmurHash('', 'utf8', -1, 'number'), seedMinusOneDefault);
      t.deepEqual(murmurHash('', 'utf8', -1, 'number', 1), seedMinusOneDefault);
      t.deepEqual(murmurHash('', 'utf8', -1, 'utf8'), new Buffer(seedMinusOneHex, 'hex').toString('utf8'));
      t.deepEqual(murmurHash('', 'utf8', -1, 'utf8', 1), new Buffer(seedMinusOneHex, 'hex').toString('utf8'));
      t.deepEqual(murmurHash('', 'utf8', 1, -1), seedMinusOneDefault);
      t.deepEqual(murmurHash('', 'utf8', null, -1), seedZeroDefault);
      t.deepEqual(murmurHash(new Buffer(0), 'utf8', -1, 0), seedZeroDefault);
      t.deepEqual(murmurHash(new Buffer(0), 'utf8', -1, null), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), 'utf8', -1, null, 1), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), 'utf8', -1, 'number'), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), 'utf8', -1, 'number', 1), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), 'utf8', -1, 'utf8'), new Buffer(seedMinusOneHex, 'hex').toString('utf8'));
      t.deepEqual(murmurHash(new Buffer(0), 'utf8', -1, 'utf8', 1), new Buffer(seedMinusOneHex, 'hex').toString('utf8'));
      t.deepEqual(murmurHash(new Buffer(0), 'utf8', 1, -1), seedMinusOneDefault);
      t.deepEqual(murmurHash(new Buffer(0), 'utf8', null, -1), seedZeroDefault);
      t.strictEqual(murmurHash('\u1234', 'utf8', 100, 'utf8'),
                    murmurHash(new Buffer('\u1234', 'utf8'), 100, 'utf8'));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', 100, 'utf8'),
                    murmurHash(new Buffer('\u1234', 'binary'), 100, 'utf8'));
      t.strictEqual(murmurHash('\u1234', 'utf8', 100, 'utf8', -1),
                    murmurHash(new Buffer('\u1234', 'utf8'), 100, 'utf8'));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', 100, 'utf8', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 100, 'utf8'));
      t.strictEqual(murmurHash('\u1234', 'utf8', 0, 'utf8'),
                    murmurHash(new Buffer('\u1234', 'utf8'), 'buffer').toString('utf8'));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', 0, 'utf8'),
                    murmurHash(new Buffer('\u1234', 'binary'), 'buffer').toString('utf8'));
      t.strictEqual(murmurHash('\u1234', 'utf8', 0, 'utf8', -1),
                    murmurHash(new Buffer('\u1234', 'utf8'), 'buffer').toString('utf8'));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', 0, 'utf8', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 'buffer').toString('utf8'));
      t.strictEqual(murmurHash('\u1234', null, 1, 'utf8'),
                    murmurHash(new Buffer('\u1234', 'binary'), 1, 'buffer').toString('utf8'));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 1, 'utf8'),
                    murmurHash(new Buffer('\u1234', 'binary'), 1, 'buffer').toString('utf8'));
      t.strictEqual(murmurHash('\u1234', null, 1, 'utf8', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 1, 'buffer').toString('utf8'));
      t.strictEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 1, 'utf8', -1),
                    murmurHash(new Buffer('\u1234', 'binary'), 1, 'buffer').toString('utf8'));
      t.deepEqual(murmurHash('\u1234', null, 1, null),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 1, null),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));
      t.deepEqual(murmurHash('\u1234', null, 1, null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), null, 1, null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));
      t.deepEqual(murmurHash('\u1234', 'utf8', 1, null),
                  murmurHash(new Buffer('\u1234', 'utf8'), 1));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', 1, null),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));
      t.deepEqual(murmurHash('\u1234', 'utf8', 1, null, -1),
                  murmurHash(new Buffer('\u1234', 'utf8'), 1));
      t.deepEqual(murmurHash(new Buffer('\u1234', 'binary'), 'utf8', 1, null, -1),
                  murmurHash(new Buffer('\u1234', 'binary'), 1));

      var buf = new Buffer(size); buf.fill(-1);
      t.strictEqual(murmurHash('', '', -1, buf), buf);
      t.deepEqual(buf, new Buffer(seedMinusOneHex, 'hex'));
      buf.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), '', -1, buf), buf);
      t.deepEqual(buf, new Buffer(seedMinusOneHex, 'hex'));

      var buf2 = new Buffer(size + 2); buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash('', '', -1, buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedMinusOneHex, 'hex')]));
      buf2.fill(0, 0, 2); buf2.fill(-1, 2);
      t.strictEqual(murmurHash(new Buffer(0), '', -1, buf2, 2), buf2);
      t.deepEqual(buf2, Buffer.concat([new Buffer([0,0]), new Buffer(seedMinusOneHex, 'hex')]));

      var buf3 = new Buffer(size - 1); buf3.fill(-1);
      t.strictEqual(murmurHash('', '', -1, buf3, -size), buf3);
      t.deepEqual(buf3, new Buffer(seedMinusOneHex, 'hex').slice(1));
      buf3.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), '', -1, buf3, -size), buf3);
      t.deepEqual(buf3, new Buffer(seedMinusOneHex, 'hex').slice(1));

      var bufpad = new Buffer(size - 3); bufpad.fill(-1);

      var buf4 = new Buffer(size + 2); buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash('', '', -1, buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                       new Buffer(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));
      buf4.fill(0, 0, 2); buf4.fill(-1, 2);
      t.strictEqual(murmurHash(new Buffer(0), '', -1, buf4, 2, 3), buf4);
      t.deepEqual(buf4, Buffer.concat([new Buffer([0,0]),
                                       new Buffer(seedMinusOneHex, 'hex').slice(0, 3),
                                       bufpad]));

      var buf5 = new Buffer(size - 1); buf5.fill(-1);
      t.strictEqual(murmurHash('', '', -1, buf5, -size, -3), buf5);
      t.deepEqual(buf5, Buffer.concat([new Buffer(seedMinusOneHex, 'hex').slice(size - 3 + 1),
                                       bufpad]));
      buf5.fill(-1);
      t.strictEqual(murmurHash(new Buffer(0), '', -1, buf5, -size, -3), buf5);
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

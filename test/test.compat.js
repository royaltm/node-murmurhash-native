"use strict";

var test = require("tap").test
  , hash = require('..')
  , incr = require('../incremental')
  , hash3js = require("murmurhash3js")
;

var TEST_STRINGS = [
  "My hovercraft is full of eels.",
  "I will not buy this tobacconist's, it is scratched.",
  "Mój poduszkowiec jest pełen węgorzy",
  "Мээң ховеркрафтым иштинде чылан ышкаш балык долу",
  "ჩემი ხომალდი საჰაერო ბალიშზე სავსეა გველთევზებით",
  "私のホバークラフトは鰻でいっぱいです",
  "എന്‍റെ പറക്കും-പേടകം നിറയെ വ്ളാങ്കുകളാണ്",
  "මාගේ වායු පා යානයේ ආඳන් පිරී ඇත",
  ""
];

[
  {hash3js: hash3js.x86.hash32,  hash: hash.murmurHash32    , incr: incr.MurmurHash,
   serial: 'QmKeaK22XaIAAAJOAi0y', hex: 'ad3e539d'},
  {hash3js: hash3js.x86.hash128, hash: hash.murmurHash128x86, incr: incr.MurmurHash128x86,
   serial: 'sxzPmSzltfMCih+J0+iHa7u24JIgk7fg4Ie24K22dP4AAAJO857u', hex: '0f2e9b58f3c8452ede465001eaa2308a'},
  {hash3js: hash3js.x64.hash128, hash: hash.murmurHash128x64, incr: incr.MurmurHash128x64,
   serial: 'pN18VmaZIWFi5XnFQVX5oSCTt+C7tuCSrbbgh7bg3F4AAAJOglRY', hex: 'e49c0577f67e999b841d202f03c5e88d'}
]
.forEach(function(o) {

  test(o.hash.name + " should be compatible with murmurhash3js", function(t) {
    t.plan((9 + 10)*(57*3));
    TEST_STRINGS.forEach(testHash);

    for(var i = 10; i-- > 0; ) {
      var s = '';
      var len = (1 + Math.random()*10000)|0;
      for(var n = len; n-- > 0; ) {
        s += String.fromCharCode(Math.random()*0x3fff);
      }

      testHash(s);
    }

    function testStrings(s) {
      var s1 = new Buffer(s, 'utf8').toString('binary');
      var args1 = [s1].concat([].slice.call(arguments, 1));
      var args2 = [s, 'utf-8'].concat(args1.slice(1));
      t.strictEqual( o.hash3js.apply(o, args1), o.hash.apply(o, args2) );
      args1[0] = new Buffer(s, 'binary').toString('binary');
      args2[1] = 'binary';
      t.strictEqual( o.hash3js.apply(o, args1), o.hash.apply(o, args2) );
      args2.splice(1, 1);
      t.strictEqual( o.hash3js.apply(o, args1), o.hash.apply(o, args2) );
    }

    function testHash(s) {
      
      testStrings(s);
      testStrings(s, 0);
      testStrings(s, 1);
      testStrings(s, -1);
      testStrings(s, 0x7ffffff);
      testStrings(s, 0x8000000);
      testStrings(s, 0xfffffff);
      for(var i = 50; i-- > 0; ) {
        var seed = (Math.random()*0x100000000)>>>0;
        testStrings(s, seed);
      }
    }

  });

  test("should be comatible with older serialized data", function(t) {
    var hash0 = o.incr(42);
    TEST_STRINGS.forEach(function(text) { hash0.update(text); });
    t.strictEqual(hash0.serialize(), o.serial);
    t.strictEqual(hash0.digest('hex'), o.hex);
    var hash1 = o.incr(o.serial);
    t.strictEqual(hash1.serialize(), o.serial);
    t.strictEqual(hash1.digest('hex'), o.hex);
    t.end();
  });

});

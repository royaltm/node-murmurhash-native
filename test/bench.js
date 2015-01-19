#!/usr/bin/env node
var ben       = require('ben')
,   hash      = require('..')
,   assert    = require('assert')
,   iters     = 100000
;

var functs = [
  [hash.murmurHash,       'murmurHash      '],
  [hash.murmurHash64x86,  'murmurHash64x86 '],
  [hash.murmurHash64x64,  'murmurHash64x64 '],
  [hash.murmurHash128x86, 'murmurHash128x86'],
  [hash.murmurHash128x64, 'murmurHash128x64'],
];

functs.forEach(function(args) {
  var fun = args[0], name = args[1]
    , size = 80
    , string = new Buffer(size).toString('utf8');
  measure("string", fun, name, iters*50, size, string);
})

functs.forEach(function(args) {
  var fun = args[0], name = args[1]
    , size = 16384
    , string = new Buffer(size).toString('utf8');
  measure("string", fun, name, iters, size, string);
})

functs.forEach(function(args) {
  var fun = args[0], name = args[1]
    , size = 16384
    , buffer = new Buffer(size);
  measure("buffer", fun, name, iters*10, size, buffer);
})


function measure(label, fun, name, iters, size, arg) {
  ben(iters, function(){ fun(arg) }); // warm-up
  var ms = ben(iters, function(){ fun(arg) });
  console.log(name + "(" + label + "[" + size + "]): %s", ((1 / ms / 1000) * size).toFixed(4) + 'MB/s');
}

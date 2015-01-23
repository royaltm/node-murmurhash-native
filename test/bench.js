#!/usr/bin/env node
var ben            = require('ben')
,   hash           = require('..')
,   assert         = require('assert')
,   iters          = 100000
,   createHash     = require('crypto').createHash
,   stringEncoding = process.argv[2]

if (stringEncoding)
  console.log('string encoding: %s', stringEncoding);

function hasher(name, data, encoding) {
  var sum = createHash(name);
  sum.update(data, encoding);
  return sum.digest();
}

function md5(data, encoding) { return hasher('md5', data, encoding) }
function sha1(data, encoding) { return hasher('sha1', data, encoding) }

var functs = [
  [hash.murmurHash,       'murmurHash      '],
  [hash.murmurHash64x86,  'murmurHash64x86 '],
  [hash.murmurHash64x64,  'murmurHash64x64 '],
  [hash.murmurHash128x86, 'murmurHash128x86'],
  [hash.murmurHash128x64, 'murmurHash128x64'],
  [md5,                   'md5             '],
  [sha1,                  'sha1            '],
];

function fillrandom(buffer) {
  for(var i = 0; i < buffer.length; ++i)
    buffer[i] = (Math.random()*0x100)|0;
  return buffer;
}

function randomstring(length) {
  var s = '';
  for(var i = 0; i < length; ++i)
    s += String.fromCharCode((Math.random()*0x100)|0);
  return s;
}

functs.forEach(function(args) {
  var fun = args[0], name = args[1]
    , size = 80
    , string = randomstring(size);
  measure("string", fun, name, iters*5, size, string);
})

functs.forEach(function(args) {
  var fun = args[0], name = args[1]
    , size = 16384
    , string = randomstring(size);
  measure("string", fun, name, iters, size, string);
})

functs.forEach(function(args) {
  var fun = args[0], name = args[1]
    , size = 16384
    , buffer = fillrandom(new Buffer(size));
  measure("buffer", fun, name, iters, size, buffer);
})

function measure(label, fun, name, iters, size, arg) {
  ben(iters, function(){ fun(arg) }); // warm-up
  var ms = ben(iters, function(){ fun(arg, stringEncoding, 0) });
  console.log(name + "(" + label + "[" + size + "]): %s", ((1 / ms / 1000) * size).toFixed(4) + 'MB/s');
}

#!/usr/bin/env node
var os             = require('os')
,   ben            = require('ben')
,   parben         = require('./parben')
,   hash           = require('..')
,   assert         = require('assert')
,   iters          = 40000
,   stringEncoding = process.argv[2]

if (stringEncoding)
  console.log('string encoding: %s', stringEncoding);

var funmatrix = [
  [hash.murmurHash,       'murmurHash          '],
  [hash.murmurHash64x86,  'murmurHash64x86     '],
  [hash.murmurHash64x64,  'murmurHash64x64     '],
  [hash.murmurHash128x86, 'murmurHash128x86    '],
  [hash.murmurHash128x64, 'murmurHash128x64    '],
];

var queued = [];

function fillrandom(buffer) {
  for(var i = 0; i < buffer.length; ++i)
    buffer[i] = (Math.random()*0x100)|0;
  return buffer;
}

function randomstring(length) {
  var buffer = fillrandom(new Buffer(length));
  return buffer.toString('binary');
}

funmatrix.forEach(function(args) {
  var fun = args[0], name = args[1]
    , size = 80
    , string = randomstring(size);
  queue(measure, "string", fun, name, iters*5, size, string);
})

funmatrix.forEach(function(args) {
  var fun = args[0], name = args[1]
    , size = 64*1024
    , string = randomstring(size);
  queue(measure, "string", fun, name, iters, size, string);
})

funmatrix.forEach(function(args) {
  var fun = args[0], name = args[1]
    , size = 64*1024
    , buffer = fillrandom(new Buffer(size));
  queue(measure, "buffer", fun, name, iters, size, buffer);
})

next();

function measure(label, fun, name, iters, size, arg) {
  ben(iters, function(){ fun(arg) }); // warm-up
  parben(iters, os.cpus().length, function(cb) { fun(arg, stringEncoding, 0, cb) }, function(ms, msavg) {
    console.log(name + "(" + label + "[" + size + "]): single: %s avg: %s %s",
      ((1 / ms / 1000) * size).toFixed(4) + 'MB/s',
      ((1 / msavg / 1000) * size).toFixed(4) + 'MB/s',
      fun(arg, stringEncoding, 0));
    next();
  });
}

function queue() {
  queued.push([].slice.call(arguments, 0));
}

function next() {
  if (queued.length > 0) setImmediate.apply(null, queued.shift());
}

#!/usr/bin/env node
var os             = require('os')
,   crypto         = require('crypto')
,   ben            = require('./parben')
,   incr           = require('../incremental')
,   assert         = require('assert')
,   duration       = 1000
,   stringEncoding = 'binary'
,   outputType     = 'hex';

var program = require('commander');

program
  .version(JSON.parse(require('fs').readFileSync(__dirname + '/../package.json')).version)
  .usage('[options] [seconds=1]')
  .option('-n, --no-crypto', 'do not benchmark crypto hashers')
  .option('-l, --large <kilobytes>', 'large string/buffer size in kilos', 128)
  .option('-o, --output [type]', 'output type')
  .option('-e, --encoding [enc]', 'string encoding')
  .parse(process.argv);

if (program.args.length > 0) duration = 1000*program.args[0]>>>0;

if (program.encoding) {
  stringEncoding = program.encoding;
  console.log('string encoding: %s', stringEncoding);
}

if (program.output) {
  outputType = program.output;
  console.log('output type: %s', outputType);
}

if (program.multiplier) {
  smallmult = program.multiplier;
  console.log('small multiplier: %d', smallmult);
}

console.log('test duration: %d ms', duration);

var funmatrix = [
  [incr.MurmurHash,       'MurmurHash          '],
  [incr.MurmurHash128x86, 'MurmurHash128x86    '],
  [incr.MurmurHash128x64, 'MurmurHash128x64    '],
];

if (program.crypto) {
  crypto.getHashes().forEach(function(cipher) {
    var pad = '                        ';
    funmatrix.push([
        function() { return new crypto.createHash(cipher); },
        cipher + pad.substr(0, pad.length - cipher.length)
      ]);
  });
}

function fillrandom(buffer) {
  for(var i = 0; i < buffer.length; ++i)
    buffer[i] = (Math.random()*0x100)|0;
  return buffer;
}

function randomstring(length) {
  var buffer = fillrandom(new Buffer(length));
  return buffer.toString('binary');
}

function bench(size, inputStr, duration) {
  var input = inputStr
            ? randomstring(size)
            : fillrandom(new Buffer(size));
  funmatrix.forEach(function(args) {
    var Hash = args[0], name = args[1];
    [1, 3, 4, 8, 16, 17, 32, 64, 101, 128, 1009, 1024, size / 4>>>0, size / 2>>>0].forEach(function(chunksize) {
      measure(inputStr ? "string" : "buffer", chunksize,
        function fun(stringEncoding, outputType) {
          var hash = new Hash();
          for(var i = 0; i < size; i += chunksize) {
            hash.update(input.slice(i, i + chunksize),stringEncoding);
          }
          return hash.digest(outputType);
        }, name, duration, size, input);
    });
    measure(inputStr ? "string" : "buffer", size, function fun(stringEncoding, outputType) {
      return new Hash().update(input, stringEncoding).digest(outputType);
    }, name, duration, size, input);
  });
}

bench(program.large*1024, true, duration);
bench(program.large*1024, false, duration);

function measure(label, chunk, fun, name, duration, size) {
  var padstr = '           ';
  var pad = function(str,pad) { return padstr.substr(0, (pad || padstr.length) - (''+str).length) + str; };

  var cb = function(){ fun(stringEncoding, outputType); };
  var iters = ben.calibrate(duration, cb);
  var ms = ben(iters, cb);
  console.log(name + label + " (%s of %s): %s %s",
    pad(chunk, size.toString().length), size,
    pad((size / ms / 1000).toFixed(1) + 'MB/s'),
    fun(stringEncoding, outputType));
}

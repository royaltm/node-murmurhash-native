#!/usr/bin/env node
var ben            = require('./parben')
,   assert         = require('assert')
,   crypto         = require('crypto')
,   createHash     = crypto.createHash
,   hash           = require('..')
,   incr           = require('../incremental')
,   duration       = 1000
,   stringEncoding = 'binary'
,   outputType     = 'number';

var program = require('commander');

program
  .version(JSON.parse(require('fs').readFileSync(__dirname + '/../package.json')).version)
  .usage('[options] [seconds=1]')
  .option('-o, --output [type]', 'output type')
  .option('-s, --small <chars>', 'small string size in chars', 80)
  .option('-l, --large <kilobytes>', 'large string/buffer size in kilos', 128)
  .option('-e, --encoding [enc]', 'input string encoding')
  .option('-n, --no-crypto', 'do not benchmark crypto hashers')
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
console.log('test duration: %d ms', duration);

function cryptohasher(name, data, encoding) {
  var sum = createHash(name);
  sum.update(data, encoding);
  return sum.digest('hex');
}

function incremental(constr) {
  return function(data, encoding, outputType) {
    return new constr().update(data, encoding).digest(outputType);
  }
}

var funmatrix = [
  [hash.murmurHash,                    'murmurHash              '],
  [hash.murmurHash64x86,               'murmurHash64x86         '],
  [hash.murmurHash64x64,               'murmurHash64x64         '],
  [hash.murmurHash128x86,              'murmurHash128x86        '],
  [hash.murmurHash128x64,              'murmurHash128x64        '],
  [incremental(incr.MurmurHash),       'MurmurHash              '],
  [incremental(incr.MurmurHash128x86), 'MurmurHash128x86        '],
  [incremental(incr.MurmurHash128x64), 'MurmurHash128x64        ']
];

if (program.crypto) {
  crypto.getHashes().forEach(function(cipher) {
    var pad = '                        ';
    funmatrix.push([
        function(data, encoding) { return cryptohasher(cipher, data, encoding) },
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
    var fun = args[0], name = args[1]
    measure(inputStr ? "string" : "buffer", fun, name, duration, size, input);
  });
}

bench(program.small, true, duration);
bench(program.large*1024, true, duration);
bench(program.large*1024, false, duration);

function measure(label, fun, name, duration, size, arg) {
  var cb = function(){ fun(arg, stringEncoding, outputType) };
  var iters = ben.calibrate(duration, cb);
  var ms = ben(iters, cb);
  console.log(name + "(" + label + "[" + size + "]): %s %s",
    (size / ms / 1000).toFixed(4) + 'MB/s',
    fun(arg, stringEncoding, outputType));
}

#!/usr/bin/env node
var os             = require('os')
,   assert         = require('assert')
,   parben         = require('./parben').parallel
,   hash           = require('..')
,   duration       = 1000
,   parallel       = os.cpus().length
,   stringEncoding = 'binary'
,   outputType     = 'number';

var program = require('commander');

program
  .version(JSON.parse(require('fs').readFileSync(__dirname + '/../package.json')).version)
  .usage('[options] [seconds=1]')
  .option('-p, --parallel <n>', 'number of parallel threads', parseInt)
  .option('-s, --small <chars>', 'small string size in chars', 80)
  .option('-l, --large <kilos>', 'large string/buffer size in kilos', 128)
  .option('-o, --output [type]', 'output type')
  .option('-e, --encoding [enc]', 'input string encoding')
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

if (program.parallel) {
  parallel = Math.max(0, program.parallel>>>0);
}

console.log('parallel threads: %d', parallel);
console.log('test duration: %d ms', duration);

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

function bench(size, inputStr, duration) {
  var input = inputStr
            ? randomstring(size)
            : fillrandom(new Buffer(size));
  funmatrix.forEach(function(args) {
    var fun = args[0], name = args[1]
    queue(measure, inputStr ? "string" : "buffer", fun, name, duration, parallel, size, input);
  });
}

bench(+program.small, true, duration);
bench(program.large*1024, true, duration);
bench(program.large*1024, false, duration);

next();

function measure(label, fun, name, duration, parallel, size, arg) {
  var cb = function(next) { fun(arg, stringEncoding, outputType, next) };
  parben.calibrate(duration, parallel, cb)
  .then(function(iters) {
    return parben(iters, parallel, cb);
  })
  .then(function(res) {
    console.log(name + "(" + label + "[" + size + "]): single: %s avg: %s %s",
      (size / res.single / 1000).toFixed(4) + 'MB/s',
      (size / res.avg / 1000).toFixed(4) + 'MB/s',
      fun(arg, stringEncoding, outputType));
    next();
  });
}

function queue() {
  queued.push([].slice.call(arguments, 0));
}

function next() {
  if (queued.length > 0) setImmediate.apply(null, queued.shift());
}

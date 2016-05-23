#!/usr/bin/env node
// jshint eqnull:true
"use strict";

var os                = require('os')
  , fs                = require('fs')
  , crypto            = require('crypto')
  , stream            = require('stream')
  , util              = require('util')
  , parben            = require('./parben').parallel
  , strm              = require('../stream')
  , pipes             = 1
  , parallel          = os.cpus().length
;
var Readable = stream.Readable;
util.inherits(RandomStream, Readable);

var program = require('commander');

program
  .version(require(__dirname + '/../package.json').version)
  .usage('[options] [pipes=1]')
  .option('-n, --no-crypto', 'do not benchmark crypto hashers')
  .option('-p, --parallel <n>', 'number of parallel streams', parseInt)
  .option('-r, --random <mb>', 'size of random streams in megabytes', 64)
  .option('-f, --file <mb>', 'file size in megabytes', 2048)
  .option('-s, --small <bytes>', 'smallest random chunk', 1)
  .option('-l, --large <bytes>', 'largest random chunk', 16384)
  .parse(process.argv);

if (program.args.length > 0) pipes = program.args[0]>>>0;

if (program.parallel) {
  parallel = Math.max(0, program.parallel>>>0);
}

console.log('parallel streams: x%d', parallel);
console.log('parallel   pipes: x%d', pipes);
console.log('smallest random chunk: %d', +program.small);
console.log(' largest random chunk: %d', +program.large);

var funmatrix = [
  ['murmurhash',        'MurmurHash          ', strm],
  ['murmurhash128x86',  'MurmurHash128x86    ', strm],
  ['murmurhash128x64',  'MurmurHash128x64    ', strm],
];

if (program.crypto) {
  crypto.getHashes().forEach(function(cipher) {
    var pad = '                    ';
    funmatrix.push([cipher, cipher + pad.substr(0, pad.length - cipher.length), crypto]);
  });
}

var queued = [];

function RandomStream(options) {
  this.size = +options.size;
  this.minchunk = null == options.minchunk ? 65536 : options.minchunk;
  var maxchunk = null == options.maxchunk ? 65536 : options.maxchunk;
  this.topchunk = maxchunk - this.minchunk + 1;
  this.pending = 0;
  Readable.call(this, options);
}

RandomStream.prototype._read = function() {
  var self = this;
  var chunksize = Math.min(this.size, this.topchunk > 1 ? (Math.random()*this.topchunk|0) + this.minchunk : this.minchunk);
  if (!chunksize) return;
  this.size -= chunksize;
  this.pending += chunksize;
  crypto.randomBytes(chunksize, function(err, data) {
    if (err) throw err;
    var okmore = self.push(data);
    self.pending -= chunksize;
    if (!self.pending && !self.size) {
      self.push(null);
    } else if (okmore) {
      self._read();
    }
  });
};

function benchRandomChunks(fun, name, hash, size, maxchunk, minchunk) {
  measure('rndchunks', name, size, parben(parallel, parallel, function(next) {
    var chunks = new RandomStream({maxchunk: maxchunk, minchunk: minchunk, size: size});
    for(var i = 0; i < pipes; ++i) {
      chunks.pipe(hash.createHash(fun, {encoding: 'hex'})).once('readable', cb);
    }
    function cb() { if (!--i) next(); }
  }));
}

function createRandomFile(file, size, next) {
  fs.stat(file, function(err, stat) {
    var oldsize = err ? 0 : stat.size;
    if (oldsize < size) {
      new RandomStream({size: size - oldsize}).pipe(fs.createWriteStream(file, {start: oldsize})).on('finish', next);
    } else {
      next();
    }
  });
}

function benchBigfile(file, fun, name, hash, size) {
  measure('bigfile', name, size, parben(parallel, parallel, function(next) {
    var fstrm = fs.createReadStream(file, {encoding:null});
    for(var i = 0; i < pipes; ++i) {
      fstrm.pipe(hash.createHash(fun, {encoding: 'hex'})).once('readable', cb);
    }
    function cb() { if (!--i) next(); }
  }));
}

function benchRandomStream(fun, name, hash, size) {
  measure('bigchunks', name, size, parben(parallel, parallel, function(next) {
    var rstrm = new RandomStream({size: size});
    for(var i = 0; i < pipes; ++i) {
      rstrm.pipe(hash.createHash(fun, {encoding: 'hex'})).once('readable', cb);
    }
    function cb() { if (!--i) next(); }
  }));
}

queue(createRandomFile, 'tmp-bigone.tmp', +program.file*1024*1024, next);

funmatrix.forEach(function(row) {
  queue(benchBigfile, 'tmp-bigone.tmp', row[0], row[1], row[2], program.file*1024*1024);
});

funmatrix.forEach(function(row) {
  queue(benchRandomChunks, row[0], row[1], row[2], +program.random*1024*1024, +program.large, +program.small);
});

funmatrix.forEach(function(row) {
  queue(benchRandomStream, row[0], row[1], row[2], +program.random*1024*1024);
});

next();

function measure(label, name, size, promise) {
  promise.then(function(res) {
    console.log(name + "(" + label + "[" + size + "]): single: %s avg: %s %s",
      (size / res.single / 1000).toFixed(4) + 'MB/s',
      (size / res.avg / 1000).toFixed(4) + 'MB/s');
    next();
  });
}

function queue() {
  queued.push([].slice.call(arguments, 0));
}

function next() {
  if (queued.length > 0) setImmediate.apply(null, queued.shift());
}

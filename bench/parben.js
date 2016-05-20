"use strict";

var Promise = require('bluebird');

var now = Date.now;
var ben = module.exports = function(times, cb) {
  if ('function' === typeof times) {
    cb = times;
    times = 10000;
  }
    
  var t0 = now();
  for(var i = times; i-- > 0; cb());
  var elapsed = now() - t0;
  return elapsed / times;
};

ben.sync = ben;

ben.calibrate = function(duration, cb) {
  var times = 5;
  var elapsed = 100;
  do {
    times = (elapsed > 0 ? (100/elapsed)*times+times : 2*times) >>> 0;
    var t0 = now();
    for(var i = times; i-- > 0; cb());
    elapsed = now() - t0;
  } while(elapsed < 100);

  return Math.max(1, duration * times / elapsed) >>> 0;
};

var parben = ben.parallel = function(times, parallel, cb) {
  return new Promise(function(resolve) {
    if (times < parallel) parallel = times;
    var pending = times>>>0;
    var start = now();
    var elapsed = 0;

    function spawn() {
      var t = now();
      cb(function fn () {
        var fin = now();
        elapsed += fin - t;

        if (--pending === 0) {
          resolve({elapsed: elapsed, single: elapsed / times,
                   wall: (fin - start), avg: (fin - start) / times});
        }
        else if (pending >= parallel) {
          t = now();
          cb(fn);
        }
      });
    }

    for(var i = parallel; i-- >  0; spawn());

  });
};

ben.parallel.calibrate = function(duration, parallel, cb) {
  return new Promise(function(resolve) {
    var times = 5*parallel;
    var elapsed = 100;
    var calib = function() {
      times = elapsed > 0 ? (100/elapsed)*times+times : 2*times;
      parben(times, parallel, cb).then(function(res) {
        elapsed = res.wall;
        if (elapsed < 100) calib();
        else {
          resolve(Math.max(1, duration * times / elapsed) >>> 0);
        }
      });
    };
    calib();
  });
};

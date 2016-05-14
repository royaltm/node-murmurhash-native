module.exports = function parben(times, parallel, cb, resultCb) {
  var now = Date.now;
  if (times < parallel) parallel = times;
  var pending = times;
  var start = now();
  var elapsed = 0;

  function spawn() {
    var t = now();
    cb(function fn () {
      var fin = now();
      elapsed += fin - t;

      if (--pending === 0) {
        resultCb(elapsed / times, (fin - start) / times);
      }
      else if (pending >= parallel) {
        t = now();
        cb(fn);
      }
    });
  }

  for(var i = parallel; i-- >  0; spawn());
}

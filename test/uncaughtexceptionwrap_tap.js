"use strict";
/*
  Patches tap to allow expecting an uncaught exception with t.throwsUncaughtException(wanted)
*/
var assert = require('assert');

var tap = require("tap");
if (module === require.main) {
  tap.pass('ok')
  return;
}

var originalThrew = tap.threw;
assert.strictEqual(typeof originalThrew, 'function', 'tap.threw should be a function');

tap.threw = threw.bind(tap);
tap.Test.prototype.threw = threw;

var uncaughtExceptionHandler;

function threw(error) {
  if (uncaughtExceptionHandler == null) {
    originalThrew(error);
  }
  else {
    try {
      uncaughtExceptionHandler(error);
    }
    catch(e) {
      originalThrew(e);
    }
  }
}

tap.Test.prototype.throwsUncaughtException = function throwsUncaughtException(wanted, message, extra) {
  var t = this;
  message = message || 'should throw uncaught exception';

  if (uncaughtExceptionHandler != null) {
    throw new Error('Only one throwsUncaughtException guard may be active at a time!');
  }

  var teardownError = new Error(message);
  Error.captureStackTrace(teardownError, throwsUncaughtException);

  t.teardown(function() {
    if (uncaughtExceptionHandler != null) {
      uncaughtExceptionHandler = null;
      throw teardownError;
    }
  });

  uncaughtExceptionHandler = function(error) {
    uncaughtExceptionHandler = null;
    t.assertStack = error.stack;
    t.throws(function() {
      throw error
    }, wanted, message, extra);
  };
};

module.exports = tap;

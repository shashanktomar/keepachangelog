'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.co = co;
exports.when = when;
exports.token = token;
exports.any = any;
exports.tryParse = tryParse;
exports.takeTill = takeTill;
exports.takeWhile = takeWhile;

var _parsimmon = require('parsimmon');

var _parsimmon2 = _interopRequireDefault(_parsimmon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var P = _parsimmon2.default;

function co(gen) {
  return P.succeed().chain(function () {
    var it = gen();
    return next();

    function next(x) {
      var _it$next = it.next(x),
          done = _it$next.done,
          value = _it$next.value;

      if (done) return P.succeed(value);else return wrapParser(value).chain(next);
    }
  });
}

function when(predicate) {
  return P.custom(function (success, failure) {
    return function (stream, i) {
      if (stream.length <= i) return failure(i, 'unexpected eof');
      var token = stream[i];
      if (predicate(token)) return success(i + 1, token);else return failure(i, predicate);
    };
  });
}

function token(expected) {
  return when(function (token) {
    return token === expected;
  });
}

function any() {
  return when(function () {
    return true;
  });
}

function tryParse(parser) {
  return P.custom(function (success) {
    return function (stream, i) {
      var result = parser.parse(stream.slice(i));
      if (result.status) return result;else return success(i, null);
    };
  });
}

function takeTill(predicate) {
  return takeWhile(function (x) {
    return !predicate(x);
  });
}

function takeWhile(predicate) {
  return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return when(predicate);

          case 2:
            return _context.abrupt('return', _context.sent);

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  })).many();
}

var Parser = P.succeed().constructor;
function wrapParser(value) {
  if (value instanceof Parser) return value;else return P.succeed(value);
}
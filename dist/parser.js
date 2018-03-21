'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseChangelog;

var _markdown = require('markdown');

var _lodashNode = require('lodash-node');

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _builder = require('./builder');

var _parsimmon = require('parsimmon');

var _parsimmon2 = _interopRequireDefault(_parsimmon);

var _parsec = require('./parsec');

var PS = _interopRequireWildcard(_parsec);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var P = _parsimmon2.default;

var UNRELEASED_RE = /^(unreleased|upcoming)$/i;

function parseChangelog(string) {
  var md = _markdown.markdown.parse(string);
  md.shift();

  var parser = PS.co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var _ref, references, prelude, releases, epilogue;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return optReferences;

          case 2:
            _ref = _context.sent;
            references = _ref.references;
            _context.next = 6;
            return parsePrelude;

          case 6:
            prelude = _context.sent;
            _context.next = 9;
            return parseRelease.many();

          case 9:
            releases = _context.sent;
            _context.next = 12;
            return P.all;

          case 12:
            epilogue = _context.sent;
            return _context.abrupt('return', { prelude: prelude, releases: releases, epilogue: epilogue, references: references });

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  var res = parser.parse(md);
  if (res.status === true) return res.value;else throw new Error('Could not parse changelog');
}

var optReferences = PS.when(function (o) {
  return 'references' in o;
}).or(P.succeed({}));

var parsePrelude = PS.takeTill(isReleaseHeader);

function innerParser(parser) {
  return PS.co( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var element, res;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return PS.any();

          case 2:
            element = _context2.sent;
            res = parser.parse(element);

            if (res.status) {
              _context2.next = 7;
              break;
            }

            _context2.next = 7;
            return P.fail('inner parser failed');

          case 7:
            return _context2.abrupt('return', res.value);

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
}

var parseHeader = PS.co( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
  var _ref2, level, content;

  return regeneratorRuntime.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return PS.token('header');

        case 2:
          _context3.next = 4;
          return PS.any();

        case 4:
          _ref2 = _context3.sent;
          level = _ref2.level;
          _context3.next = 8;
          return P.all;

        case 8:
          content = _context3.sent;
          return _context3.abrupt('return', { content: content, level: level });

        case 10:
        case 'end':
          return _context3.stop();
      }
    }
  }, _callee3, this);
}));

var parseRelease = PS.co( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
  var header, titleElements, title, release, changeSections;
  return regeneratorRuntime.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return PS.when(isReleaseHeader);

        case 2:
          header = _context4.sent;
          titleElements = header.slice(2);
          title = (0, _builder.elementText)(header);
          release = (0, _lodashNode.extend)({
            title: titleElements
            // prelude: prelude,
          }, extractReleaseTitleInfo(title));
          _context4.next = 8;
          return sectionParser(3).many();

        case 8:
          changeSections = _context4.sent;


          (0, _lodashNode.forEach)(changeSections, function (_ref3) {
            var title = _ref3.title,
                content = _ref3.content;

            release[title] = extractBulletList(content);
          });
          return _context4.abrupt('return', release);

        case 11:
        case 'end':
          return _context4.stop();
      }
    }
  }, _callee4, this);
}));

function isReleaseHeader(el) {
  if (!isHeaderLevel(el, 2)) return false;

  var text = (0, _builder.elementText)(el);
  return text.match(/^v?\d+\.\d+\.\d+/) || text.match(UNRELEASED_RE);
}

/**
 * Takes a release title string and returns an object with the release
 * version and date.
 *
 * @example
 *   extractReleaseTitleInfo('v1.0.0 - 2014-01-01')
 *   // => {version: '1.0.0', date: '2014-01-01'}
 */
function extractReleaseTitleInfo(str) {
  if (str.match(UNRELEASED_RE)) return { version: 'upcoming' };

  var versionMatch = str.match(/^v?(\d+\.\d+\.\d+)/);
  if (!versionMatch) return null;

  var version = _semver2.default.valid(versionMatch[1]);
  if (!version) return null;

  var dateMatch = str.match(/\d\d\d\d-\d\d-\d\d$/);
  var date = dateMatch && dateMatch[0] || null;

  return { version: version, date: date };
}

function sectionParser(sectionLevel) {
  return PS.co( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var _ref4, level, title, content;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return innerParser(parseHeader);

          case 2:
            _ref4 = _context5.sent;
            level = _ref4.level;
            title = _ref4.content;

            if (!(level !== sectionLevel)) {
              _context5.next = 8;
              break;
            }

            _context5.next = 8;
            return P.fail();

          case 8:
            _context5.next = 10;
            return PS.takeTill(isHeader);

          case 10:
            content = _context5.sent;
            return _context5.abrupt('return', { title: title, content: content });

          case 12:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));
}

function extractBulletList(md) {
  var list = md[0];
  if (!(list && list[0] === 'bulletlist')) return null;

  return (0, _lodashNode.map)(list.slice(1), function (item) {
    return item.slice(1);
  });
}

function isHeader(el) {
  return el && el[0] === 'header';
}

function isHeaderLevel(el, level) {
  return isHeader(el) && el[1].level === level;
}
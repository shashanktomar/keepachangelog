'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.init = init;
exports.parse = parse;
exports.read = read;

require('babel/polyfill');

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _builder = require('./builder');

var _builder2 = _interopRequireDefault(_builder);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var fs = require('fs');

var _require = require('lodash-node'),
  find = _require.find;

var _require2 = require('bluebird'),
  promisify = _require2.promisify;

var readFile = promisify(fs.readFile);
var writeFile = promisify(fs.writeFile);

function init(path) {
  path = path || 'CHANGELOG.md';

  return parse(
    [
      '# Change Log',
      'All notable changes to this project will be documented in this file.',
      ''
    ].join('\n')
  ).write(path);
}

function parse(content) {
  return new Changelog((0, _parser2.default)(content));
}

function read(path) {
  path = path || 'CHANGELOG.md';
  return readFile(path, { encoding: 'utf8' }).then(function(content) {
    return new Changelog((0, _parser2.default)(content));
  });
}

function Changelog(_ref) {
  var prelude = _ref.prelude,
    epilogue = _ref.epilogue,
    releases = _ref.releases,
    references = _ref.references;

  this.prelude = prelude;
  this.epilogue = epilogue;
  this.releases = releases;
  this.references = references;
}

Changelog.prototype.write = function(path) {
  path = path || 'CHANGELOG.md';
  return writeFile(path, this.build());
};

Changelog.prototype.build = function() {
  return (0, _builder2.default)(this);
};

Changelog.prototype.getRelease = function(version) {
  return find(this.releases, function(r) {
    return r.version === version;
  });
};

Changelog.prototype.addUpcomingChange = function(desc) {
  this.addUpcoming('Changed', desc);
};

Changelog.prototype.addUpcoming = function(type, desc) {
  var upcoming = this.getRelease('upcoming');
  if (!upcoming) {
    upcoming = { version: 'upcoming' };
    this.releases.unshift(upcoming);
  }

  var changes = upcoming[type];
  if (!changes) {
    upcoming[type] = changes = [];
  }

  changes.push([desc]);
};

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderChangelog;
exports.elementText = elementText;

var _lodashNode = require('lodash-node');

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a markdown string from a changelog structure.
 */
function renderChangelog(cl) {
  var rendered = [buildElementList(cl.prelude), '\n', buildReleases(cl.releases), buildElementList(cl.epilogue), '\n', buildReferences(cl.references)].join('');
  return rendered.trim() + '\n';
}

function buildElementList(md, sep) {
  sep = sep || '';
  if (md) return (0, _lodashNode.map)(md, buildElement).join(sep);else return '';
}

/**
 * Build a JsonML Markdown element
 *
 * element
 *    = [ tag-name , attributes , element-list ]
 *    | [ tag-name , attributes ]
 *    | [ tag-name , element-list ']
 *    | [ tag-name ]
 *    | string
 *    ;
 */
function buildElement(el) {
  if (typeof el == 'string') return el;

  var tagName = el[0];
  el = el.slice(1);

  switch (tagName) {
    case 'header':
      return buildHeader(el);
    case 'para':
      return buildPara(el);
    case 'inlinecode':
      return buildAndSurroundElementList('`', el);
    case 'em':
      return buildAndSurroundElementList('*', el);
    case 'link':
      return buildLink(el);
    case 'link_ref':
      return buildLinkRef(el);
    default:
      throw new Error('Unknown tag ' + tagName);
  }
}

/**
 * Returns only the text content of a Markdown element.
 *
 * For example, if the markdown is a link contained in em tags, the
 * function only returns the actual text.
 */
function elementText(el) {
  if (typeof el == 'string') return el;

  var tagName = el[0];

  switch (tagName) {
    case 'header':
    case 'link_ref':
      return multiElementsText(el.slice(2));
    default:
      throw new Error('Unknown tag ' + tagName);
  }
}

function multiElementsText(els) {
  return (0, _lodashNode.map)(els, elementText).join(' ');
}

function buildLink(el) {
  return '[' + el[1] + '](' + el[0].href + ')';
}

function buildLinkRef(el) {
  return el[0].original;
}

function buildReferences(refs) {
  return (0, _lodashNode.map)(refs, function (_ref, anchor) {
    var href = _ref.href;

    return '[' + anchor + ']: ' + href;
  }).join('\n');
}

function buildHeader(el) {
  var _el$shift = el.shift(),
      level = _el$shift.level;

  var title = buildElementList(el);
  var header = repeat(level, '#');
  return header + ' ' + title + '\n';
}

function buildPara(el) {
  return buildElementList(el) + '\n';
}

function buildAndSurroundElementList(marker, els) {
  return marker + buildElementList(els) + marker;
}

function buildReleases(releases) {
  return (0, _lodashNode.map)(releases, function (release) {
    var title = getReleaseTitle(release);
    return buildHeader([{ level: 2 }].concat(title)) + buildVersionLog('Added', release) + buildVersionLog('Changed', release) + buildVersionLog('Removed', release) + buildVersionLog('Deprecated', release) + buildVersionLog('Fixed', release) + buildVersionLog('Security', release);
  }).join('');
}

function getReleaseTitle(_ref2) {
  var title = _ref2.title,
      version = _ref2.version;

  if (title) return title;

  if (_semver2.default.valid(version)) return 'v' + version;

  return (0, _lodashNode.capitalize)(version);
}

function buildVersionLog(name, release) {
  var log = release[name];
  if (!log) return '';

  var header = buildHeader([{ level: 3 }, name]);
  var list = (0, _lodashNode.map)(log, function (entry) {
    return '- ' + indent(buildElementList(entry), 2).trim();
  });
  return header + list.join('\n') + '\n\n';
}

function indent(str, width) {
  return (0, _lodashNode.map)(str.split('\n'), function (line) {
    return repeat(width, ' ') + line;
  }).join('\n');
}

function repeat(n, x) {
  return (0, _lodashNode.map)(new Array(n), function () {
    return x;
  }).join('');
}
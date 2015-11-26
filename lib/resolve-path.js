var async = require('async');
var extend = require('lodash/object/extend');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

function exists(filePath, callback) {
  fs.stat(filePath, function (err) {
    callback(err === null);
  });
}

module.exports = function (to, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = extend({
    basePath: '.',
    loadPaths: []
  }, options);

  var filePaths = options.loadPaths.map(function (loadPath) {
    return path.resolve(options.basePath, loadPath, to);
  });

  filePaths.unshift(path.resolve(options.basePath, to));

  return new Promise(function (resolve, reject) {
    async.detectSeries(filePaths, exists, function (resolvedPath) {
      if (resolvedPath) return resolve(resolvedPath);
      reject(new Error('Asset not found or unreadable: ' + to));
    });
  }).nodeify(callback);
};
// Generated by CoffeeScript 1.10.0

/*
Storing our imge file cache in the system tmpdir has some advantages.
In some cases utilities like tmpwatch will automatically clear out files which
haven't been accessed in a long time which helps with file cache growth.
Also when the server is rebooted the cache will automatically be cleared.
Of course that is not always what you want, which is just one reason why one
caching solution won't work for every image server.
 */

(function() {
  var config, log, os, path, path_for_cache_file, resolve_base_cache_path;

  path = require('path');

  os = require('os');

  log = require('../index').log;

  config = require('config');

  resolve_base_cache_path = require('./resolve-base-cache-path');

  path_for_cache_file = function(filepath) {
    return path.join(resolve_base_cache_path(), filepath);
  };

  module.exports = path_for_cache_file;

}).call(this);

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
  var config, os, path, path_for_image_cache_file;

  path = require('path');

  os = require('os');

  config = require('config');

  path_for_image_cache_file = function(filepath) {
    var base_path;
    base_path = config.get('cache.image.base_path');
    base_path = base_path === 'tmpdir' ? os.tmpdir() : base_path === 'public' ? path.join(__dirname, '/../public') : base_path;
    return path.join(base_path, filepath);
  };

  module.exports = path_for_image_cache_file;

}).call(this);
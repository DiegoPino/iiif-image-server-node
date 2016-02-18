// Generated by CoffeeScript 1.10.0

/*
Simple file resolver!
This could be changed to find images split across directories based on the id
or look up the path to the image in a database. In this case we know all the
images are going to be JP2s.
 */

(function() {
  var path, resolve_image_path;

  path = require('path');

  resolve_image_path = function(id) {
    return path.join(__dirname, "/../images/" + id + ".jp2");
  };

  exports.resolve_image_path = resolve_image_path;

}).call(this);
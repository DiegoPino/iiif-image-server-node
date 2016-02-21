// Generated by CoffeeScript 1.10.0
(function() {
  var InfoJSONCreator, Informer, _, config, fs, iiif, info_json_response, jp2_binary, resolve_image_path;

  fs = require('fs');

  _ = require('lodash');

  config = require('config');

  jp2_binary = config.get('jp2_binary');

  iiif = require('iiif-image');

  InfoJSONCreator = iiif.InfoJSONCreator;

  Informer = iiif.Informer(jp2_binary);

  resolve_image_path = require('./resolver').resolve_image_path;

  info_json_response = function(req, res, info_cache) {

    /*
    Information requests are easy to parse, so we just take the next to the
    last element to make our id. Note that this image server does not
    decodeURIComponent as our implementation of a file resolver in
    resolve_image_path is not robust enough to defend against a directory
    traversal attack.
     */
    var id, image_path, url, url_parts;
    url = req.url;
    url_parts = url.split('/');
    id = url_parts[url_parts.length - 2];
    image_path = resolve_image_path(id);

    /*
    Check to see if the image exists. If not return a 404. If the image exists
    return the information about the image.
     */
    return fs.stat(image_path, function(err, stats) {
      var cache_info, info_cb, informer, scheme, server_info;
      if (err) {
        return res.state(404).send('404');
      } else {
        scheme = req.connection.encrypted != null ? 'https' : 'http';
        server_info = {
          id: scheme + "://" + req.headers.host + "/" + id,
          level: 1
        };
        info_cb = function(info) {
          var info_json_creator;
          if (!info_cache.get(id)) {
            info_cache.set(id, info);
          }
          info_json_creator = new InfoJSONCreator(info, server_info);
          return res.send(info_json_creator.info_json);
        };
        cache_info = info_cache.get(id);
        if (cache_info) {
          return info_cb(_.cloneDeep(cache_info));
        } else {
          informer = new Informer(image_path, info_cb);
          return informer.inform();
        }
      }
    });
  };

  module.exports = info_json_response;

}).call(this);
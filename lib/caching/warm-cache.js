// Generated by CoffeeScript 1.10.0
(function() {
  var _, async, clear_cache_for_id, clear_cache_from_profile, config, http, log, path, profiles, warm_cache;

  _ = require('lodash');

  config = require('config');

  http = require('http');

  async = require('async');

  path = require('path');

  profiles = _.values(config.get('profile'));

  clear_cache_for_id = require('./clear-cache').clear_cache_for_id;

  clear_cache_from_profile = require('./clear-cache').clear_cache_from_profile;

  log = require('../index').log;

  warm_cache = function(req, res) {
    var clear_with, identifier, process_profiles, request_info_json, warm_profile;
    identifier = req.params.id;
    warm_profile = function(url_part, callback) {
      var full_path, full_url, scheme;
      full_path = path.join(req.headers.host, config.get('prefix'), identifier, url_part);
      scheme = req.connection.encrypted != null ? 'https' : 'http';
      full_url = scheme + "://" + full_path;
      return http.get(full_url, function(res) {
        if (res.statusCode === 200) {
          return callback();
        } else {
          return callback(true);
        }
      }).on('error', function(e) {
        return callback(true);
      });
    };
    process_profiles = function() {
      return async.each(profiles, warm_profile, function(err) {
        if (err) {
          return res.status(400).send('unable to warm cache');
        } else {
          return res.status(200).send(profiles);
        }
      });
    };
    request_info_json = function(id) {
      var info_json_path, info_json_url, scheme;
      info_json_path = path.join(req.headers.host, config.get('prefix'), identifier, 'info.json');
      scheme = req.connection.encrypted != null ? 'https' : 'http';
      info_json_url = scheme + "://" + info_json_path;
      log.info("INFOJSONURL " + info_json_url);
      return http.get(info_json_url, function(response) {
        console.log(config.get('profile'));
        if (config.get('profile')) {
          return process_profiles();
        } else {
          return res.status(200).send(info_json_url);
        }
      });
    };
    clear_with = config.get('cache.warm.clear_with');
    if (clear_with === 'id') {
      return clear_cache_for_id(identifier, request_info_json);
    } else if (clear_with === 'profile') {
      return clear_cache_from_profile(identifier, request_info_json);
    } else {
      return request_info_json(req.params.id);
    }
  };

  module.exports = warm_cache;

}).call(this);

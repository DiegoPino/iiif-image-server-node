fs = require 'fs' # Used to test presence of files

config = require 'config' # Configuration from config directory

# The iiif-image pieces the image response needs. Note that image-extraction
# includes other extraction related modules.
iiif = require 'iiif-image'
Parser = iiif.ImageRequestParser
Validator = iiif.Validator

# Helpers
resolve_image_path = require('./resolver').resolve_image_path
path_for_image_cache_file = require './path-for-image-cache-file'
# TODO: Allow for selecting a custom implementation of image_extraction
image_extraction = require('./image-extraction')

ttl = config.get('cache.image.ttl')

image_response = (req, res, info_cache, image_cache) ->
  url = req.url
  ###
  If the image exists just serve that up. This allows cached images
  to be used across instances of the application, but will still not handle
  cache expiration in a unified way. This is why we check for the status of the
  file rather than relying on the memory cache to know whether this is an
  image_cache hit or not.
  ###
  image_temp_file = path_for_image_cache_file(url)
  fs.stat image_temp_file, (err, stats) ->
    if !err
      console.log "cache image hit: #{url} #{image_temp_file}"
      # Since this is a cache hit expand the time to live in the cache.
      image_cache.ttl url, ttl
      res.sendFile image_temp_file
    else
      console.log "cache image miss: #{url} #{image_temp_file}"

      ###
      First we parse the URL to extract all the information we'll need from the
      request to choose the correct image.
      ###
      parser = new Parser url
      params = parser.parse()
      image_path = resolve_image_path(params.identifier)

      ###
      Check to see if the source image exists. If not return a 404.
      ###
      fs.stat image_path, (err, stats) ->
        if err
          res.status(404).send('404')
        else
          ###
          We do a quick check whether the parameters of the request are valid
          before trying the extraction. If we do not have the image information
          yet, the check here is not able to check whether the request is
          completely valid.

          In cases where we do have the image information from the
          info_cache (say when we've already responded to an info.json request)
          we do a fuller validation of the request (is it in bounds?).
          ###
          image_info = info_cache.get params.identifier
          valid_request = if image_info
            validator = new Validator params, image_info
            validity = validator.valid()
            if validity
              console.log "valid with info: #{url}"
            else
              console.log "invalid with info: #{url}"
            validity
          else
            validator = new Validator params
            validity = validator.valid_params()
            if validity
              console.log "valid with params: #{url}"
            else
              console.log "invalid with params: #{url}"
            validity
          # If we have a valid request we try to return an image.
          if valid_request
            # This is where most of the work happens!!!
            image_extraction(res, url, params, info_cache, image_cache)
          else
            console.log "invalid request: #{url}"
            res.status(400).send('400 error')

module.exports = image_response
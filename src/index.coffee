express = require('express')
app = express()
_ = require 'lodash'
path = require 'path'
iiif = require 'iiif-image'
Informer = iiif.IIIFImageInformer
Extractor = iiif.IIIFImageExtractor
Parser = iiif.IIIFImageRequestParser
InfoJSONCreator = iiif.IIIFInfoJSONCreator

app.get '/index.html', (req, res) ->
  res.send('This ought to deliver a pan-zoom viewer or something.')

app.get '*info.json', (req, res) ->
  url = req.url
  url_parts = url.split('/')
  id = url_parts[url_parts.length - 2]
  image_path = path.join __dirname, "/../images/#{id}.jp2"

  scheme = if req.connection.encrypted? then 'https' else 'http'
  server_info =
    id: "#{scheme}://#{req.headers.host}/#{id}"
    level: 1
  info_cb = (info) ->
    info_json_creator = new InfoJSONCreator info, server_info
    res.send info_json_creator.info_json
  informer = new Informer image_path, info_cb
  informer.inform(info_cb)

# This image server will only accept requests for jpg and png images.
app.get '*.(jpg|png)', (req, res) ->
  url = req.url

  # First we parse the URL to extract all the information we'll need from the
  # request to choose the correct image, extract information from it, and
  # create the requested image.
  parser = new Parser url
  params = parser.parse()
  console.log params

  # Here's the simplest resolver ever:
  image_path = path.join __dirname, "/../images/#{params.identifier}.jp2"
  console.log image_path

  # Usually you'd want to do some image information caching, but in this case
  # we'll just look up the information every request.

  # This will be the last method called once the extractor has created the
  # image to return.
  extractor_cb = (output_image_path) ->
    # res.setHeader "Content-Type", 'image/jpeg'
    res.sendFile output_image_path

  # Once the informer finishes its work it calls this callback with the information.
  # The extractor then uses it to create the image.
  info_cb = (info) ->
    options =
      path: image_path
      params: params # from IIIFImageRequestParser
      info: info
    extractor = new Extractor options, extractor_cb
    extractor.extract()

  # The informer runs first
  informer = new Informer image_path, info_cb
  informer.inform(info_cb)

app.get '*', (req, res) ->
  res.send('This route catches anything else that does not match.')

app.listen 3000, () ->
  console.log('Example app listening on port 3000!')
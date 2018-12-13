fs = require('fs')


_template = do ->
  settings =
    evaluate: /<%([\s\S]+?)%>/g
    interpolate: /<%=([\s\S]+?)%>/g
    escape: /<%-([\s\S]+?)%>/g
  noMatch = /.^/
  escapes =
    '\\': '\\'
    '\'': '\''
    'r': '\u000d'
    'n': '\n'
    't': '\u0009'
    'u2028': '\u2028'
    'u2029': '\u2029'
  for p of escapes
    escapes[escapes[p]] = p
  escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g
  unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g

  (text, data, objectName) ->
    settings.variable = objectName
    source = '__p+=\'' + text.replace(escaper, (match) ->
      '\\' + escapes[match]
    ).replace(settings.escape or noMatch, (match, code) ->
      '\'+\n_.escape(' + unescape(code) + ')+\n\''
    ).replace(settings.interpolate or noMatch, (match, code) ->
      '\'+\n(' + unescape(code) + ')+\n\''
    ).replace(settings.evaluate or noMatch, (match, code) ->
      '\';\n' + unescape(code) + '\n;__p+=\''
    ) + '\';\n'
    if !settings.variable
      source = 'with(obj||{}){\n' + source + '}\n'
    source = 'var __p=\'\';var print=function(){__p+=Array.prototype.join.call(arguments, \'\')};\n' + source + 'return __p;\n'
    render = new Function(settings.variable or 'obj', source)
    if data
      return render(data)
    template = (data) ->
      render.call this, data
    template.source = 'function(' + (settings.variable or 'obj') + '){\n' + source + '}'
    template


config = {}

module.exports.config = (c)-> config = c
module.exports.config_get = -> config

module.exports.js_get = js_get = (platform, development = false)->
  js = config.javascripts.all.concat(config.javascripts[if development then 'development' else 'master'])
  if platform
    js = js.concat(config.javascripts[platform])
  return js

template_read = (params)->
  fs.readFileSync("#{params.dir or config.dirname}#{params.template}.#{params.extension or 'html'}", 'utf8')

template_read_block = (params)->
  dir = "#{params.dir or config.dirname}block/"
  if !fs.existsSync(dir)
    return {}
  return fs.readdirSync(dir).reduce (acc, file)->
    if file.substr(0, 1) is '.'
      return acc
    acc[file.split('.')[0]] = fs.readFileSync("#{dir}#{file}", 'utf8')
    acc
  , {}

_template_include_js = (params)->
  if params.development
    return js_get(params.platform, params.development).map (js)->
      t = js.substr(-3)
      if t is 'css'
        return "<link rel='stylesheet' href='/#{js}' />"
      if t is '.js'
        return "<script src='/#{js}'></script>"
      return "<script>#{js}</script>"
    .join "\n"
  if params.platform is 'cordova'
    return """
      <script src='cordova.js'></script>
      <script src='d/j-#{params.platform}.js?#{params.version}'></script>
    """
  return """
    #{if 'standalone' isnt params.platform then """

      <script>
          if (!(function () {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
          })()) {
              window.location = '/g';
          }
      </script>

    """ else ''}

    <script src='/d/j-#{params.platform}.js?#{params.version}'></script>
  """

_template_include_css = (params)->
  if params.development
    return "<link rel='stylesheet' href='/client/browser/css/screen.css' />"
  if params.platform is 'cordova'
    return "<link rel='stylesheet' href='d/c.css?#{params.version}' />"
  return "<link rel='stylesheet' href='/d/c.css?#{params.version}' />"


module.exports.generate = (tmp_params)->
  params = Object.assign {}, config, tmp_params
  if params.platform
    params.javascripts = _template_include_js(params)
    params.css = _template_include_css(params)
  params.block = template_read_block(tmp_params)
  Object.keys(params.block).forEach (block)-> params.block[block] = _template(params.block[block])
  _template(template_read(tmp_params))(params)

module.exports.generate_local = (template)->
  _template(template_read({template, dir: "#{__dirname}/../templates/"}))

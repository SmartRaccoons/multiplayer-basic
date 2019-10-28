mysql = require('mysql')


module.exports.Mysql = class Mysql
  constructor: (@config, @max=1)->
    for i in [1..@max]
      @_connect(i)
    @

  _connect: (i)->
    @['connection' + i] = mysql.createConnection(@config)
    @['connection' + i].on 'error', (err)=>
      if not err.fatal
        return null
      if err.code isnt 'PROTOCOL_CONNECTION_LOST'
        throw err
      console.log('Re-connecting lost connection: ' + err.stack)
      @_connect(i)
    @

  query: ->
    connection_id = 1
    for i in [1..@max]
      if !@['connection' + i]._busy
        connection_id = i
        break
    connection = @['connection' + connection_id]
    connection._busy = true
    args = Array.prototype.slice.call(arguments)
    callback = args[args.length - 1]
    args[args.length - 1] = ->
      connection._busy = false
      callback.apply(@, arguments)
    connection.query.apply(connection, args)
    @

  _escape: (value)->
    @connection1.escape(value)

  _where: (where)->
    where_str = []
    for key, value of where
      where_str.push("`#{key}`=#{@_escape(value)}")
    where_str

  _parse: (parse, data, to_db = true)->
    parse.forEach (parse)->
      if data[parse[0]]
        data[parse[0]] = parse[1][if to_db then 'to' else 'from'](data[parse[0]])
    data

  select_raw: (query, data, callback)->
    @query query, data, (err, rows)->
      if err
        console.info query, data
        throw err
      callback(rows)

  select: (data, callback)->
    fn =
      default: (field, value)-> ["s.`#{field}` = ?", value]
      sign: (field, value)-> ["s.`#{field}` #{value.sign[0]} ?", value.sign[1]]
      date: (field, value)-> ["DATE(s.`#{field}`) >= DATE( ? )", new Date(new Date().getTime() - 1000*60*60*24 * value.date)]
    fn_get = (value)->
      if value and typeof value is 'object'
        for method in Object.keys(fn)
          if method of value
            return method
      return 'default'
    where = Object.keys(data.where).map (field)->
      fn[fn_get(data.where[field])](field, data.where[field])
    @select_raw """
      SELECT
        #{if data.select then data.select.map( (v)->
            "s.`#{v}`"
          ).join(', ') else 's.*'}
        #{if data.join then """,
          #{if data.join.select then data.join.select.map( (v)->
            "j.`#{v}`"
          ).join(', ') else 'j.*'}
        """ else ''}
      FROM
        `#{data.table}` AS s
      #{if data.join then """
        LEFT JOIN
          `#{data.join.table}` AS j
        ON
          #{Object.keys(data.join.on).map( (k)->
            "s.`#{k}`=j.`#{data.join.on[k]}`"
          ).join(' AND ')}
      """ else ''}
      WHERE
        #{where.map( (v)-> v[0] ).join(' AND ')}
      #{if data.order then """
        ORDER BY
          #{data.order.map (v)->
            if v.substr(0, 1) is '-' then "s.`#{v.substr(1)}` DESC" else "s.`#{v}` ASC"}
      """ else ''}
      LIMIT #{data.limit or '1000'}
    """, where.map( (v)-> v[1] ), (rows)=>
      if data.parse
        rows = rows.map (v)=> @_parse(data.parse, v, false)
      callback(rows)

  select_one: (data, callback)->
    @select Object.assign({limit: 1}, data), (rows)=>
      callback(if rows then rows[0] else null)

  update: (data, callback=->)->
    Object.keys(data.data).forEach (key)->
      if data.data[key] and data.data[key].increase?
        v = data.data[key].increase
        data.data[key] = {toSqlString: -> "`#{key}` #{if v < 0 then '-' else '+'} #{Math.abs(v)}"}
    @query "UPDATE `#{data.table}` SET ? WHERE  #{@_where(data.where).join(' AND ')}", (if data.parse then @_parse(data.parse, data.data, true) else data.data), (err, result)->
      if err
        console.info data
        throw err
      callback(result)

  insert: (data, callback=->)->
    @query "INSERT INTO `#{data.table}` SET ?", (if data.parse then @_parse(data.parse, data.data, true) else data.data), (err, result)->
      if err
        console.info data
        if not data.ignore
          throw err
        else
          return
      callback(result.insertId)

  delete: (data, callback=->)->
    @query "DELETE FROM `#{data.table}` WHERE #{(@_where(data.where)).join(' AND ')}", (err, result)->
      if err
        console.info data
        throw err
      callback(result)

// TODO move to WebWorker/utils/requests.js
import {DetailedError} from './utils'

export function make_url (path) {
  if (path.match(/^https?:\//)) {
    return path
  } else {
    if (!path.startsWith('/')) {
      throw Error('path must start with "/"')
    }

    if (process.env.REACT_APP_DOMAIN === 'localhost') {
      return `http://localhost:8000/${path}`
    } else if (process.env.REACT_APP_DOMAIN) {
      return `https://${process.env.REACT_APP_DOMAIN}${path}`
    } else {
      return path
    }
  }
}

export function build_query (args) {
  const arg_list = []
  const add_arg = (n, v) => arg_list.push(encodeURIComponent(n) + '=' + encodeURIComponent(v))
  for (let [name, value] of Object.entries(args)) {
    if (Array.isArray(value)) {
      for (let value_ of value) {
        add_arg(name, value_)
      }
    } else if (value !== null && value !== undefined) {
      add_arg(name, value)
    }
  }
  if (arg_list.length > 0) {
    return '?' + arg_list.join('&')
  }
  return ''
}

export function headers2obj (r) {
  const h = r.headers
  const entries = Array.from(h.entries())
  if (entries.length !== 0) {
    return Object.assign(...Array.from(h.entries()).map(([k, v]) => ({[k]: v})))
  }
}

export async function request (method, path, config={}) {
  const make_url_ = config.make_url || make_url
  let url = make_url_(path, config)

  config = config || {}
  if (config.args) {
    url += build_query(config.args)
  }

  if (Number.isInteger(config.expected_status)) {
    config.expected_status = [config.expected_status]
  } else {
    config.expected_status = config.expected_status || [200]
  }

  const headers = config.headers || {}
  headers['Accept'] = headers['Accept'] || 'application/json'
  if (method !== 'GET') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  const init = {method, headers, credentials: 'include'}
  if (config.send_data) {
    init.body = JSON.stringify(config.send_data)
  }
  let r
  try {
    r = await fetch(url, init)
  } catch (error) {
    // generally TypeError: failed to fetch
    throw DetailedError(error.message, {error: error.toString(), status: 0, url, init})
  }
  if (config.expected_status.includes(r.status)) {
    if (config.raw_response) {
      // e.g. you might want to use a stream and process one line of nd-json at a time or something
      return r
    } else {
      return {
        data: await r.json(),
        status: r.status,
      }
    }
  } else {
    let response_data = {}
    try {
      response_data = await r.json()
    } catch (e) {
      // ignore and use normal error
    }
    let message = `Unexpected response ${r.status}`
    if (response_data.message) {
      message += ` response message: ${response_data.message}`
    }
    throw DetailedError(message, {status: r.status, url, init, response_data, headers: headers2obj(r)})
  }
}

export class Requests {
  constructor (config={}) {
    this.config = config
    this.get = this.get.bind(this)
    this.post = this.post.bind(this)
    this.put = this.put.bind(this)
    this.patch = this.patch.bind(this)
    this.delete = this.delete.bind(this)
  }

  async get (path, args, config={}) {
    const c = Object.assign({}, this.config, config, {args})
    return await request('GET', path, c)
  }

  async post (path, send_data, config={}) {
    const c = Object.assign({}, this.config, config, {send_data})
    return await request('POST', path, c)
  }

  async put (path, send_data, config={}) {
    const c = Object.assign({}, this.config, config, {send_data})
    return await request('PUT', path, c)
  }

  async patch (path, send_data, config={}) {
    const c = Object.assign({}, this.config, config, {send_data})
    return await request('PATCH', path, c)
  }

  async delete (path, send_data, config={}) {
    const c = Object.assign({}, this.config, config, {send_data})
    return await request('DELETE', path, c)
  }
}

const axios = require('axios')
const shortid = require('shortid')

class Registrator {
  constructor (host, aclToken) {
    const headers = {}
    if (aclToken) {
      headers['X-Consul-Token'] = aclToken
    }
    this.agent = axios.create({ baseURL: `http://${host}/v1/`, headers })
    this.id = shortid.generate()
  }

  async register (name, tags, port, checks) {
    return this.agent.put('/agent/service/register', { name, id: `${name}-${this.id}`, tags, port, checks })
  }

  async unregister (name) {
    return this.agent.put(`/agent/service/deregister/${name}-${this.id}`)
  }
}

module.exports = Registrator

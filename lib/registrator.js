const axios = require('axios');

class Registrator {
  constructor (host, aclToken) {
    this.host = host
    this.aclToken = aclToken
  }

  async register (name, id, tags, port, checks) {

  }

  async unRegister (name, id) {

  }
}

module.exports = Registrator

const Middleware = require('./base.middleware')
const ua = require('universal-analytics')

class Track extends Middleware {
  constructor (name, version, environment, trackingKey) {
    super()
    this.name = name
    this.version = version
    this.environment = environment
    this.trackingKey = trackingKey
  }

  async exec (req) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    let uid
    if (req.account) {
      uid = req.account.id
    }
    if (req.headers['CF-Connecting-IP']) {
      ip = req.headers['CF-Connecting-IP']
    }
    const ipList = ip.split(',')
    if (ipList.length > 0) {
      ip = ipList[0]
    }
    const visitor = ua(this.trackingKey, uid, {https: true, strictCidFormat: false})
    const trackingData = {
      uid,
      uip: ip,
      ua: req.headers['user-agent'],
      dl: fullUrl,
      an: `${this.name}_${this.environment}`,
      av: this.version
    }
    if (req.account) {
      const extraData = {
        cd1: req.account.discordUserId,
        cd2: req.account.id,
        cd3: req.account.name
      }
      Object.assign(trackingData, extraData)
    }
    visitor.pageview(trackingData, (err) => {
      if (err) {
        console.log(err)
      }
    })
    return {status: 200}
  }
}

module.exports = Track

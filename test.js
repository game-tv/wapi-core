// Set up winston
const winston = require('winston')
winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, {
  timestamp: true,
  colorize: true,
})

try {
  const pkg = require('./package.json')
  const fs = require('fs')

  const files = fs.readdirSync('./tests')
  const tests = []
  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'base.test.js') tests.push(require(`./tests/${files[i]}`))
  }
  winston.info('Tests loaded.')

  winston.info(`Testing wapi-core@${pkg.version}`)

  let successful = 0
  let failed = 0

  const runTests = async () => {
    for (let i = 0; i < tests.length; i++) {
      const test = new tests[i]()
      winston.info(`Running test for ${test.name}`)
      try {
        await test.run()
        successful++
      } catch (e) {
        failed++
        return winston.error(`Test failed: ${e}`)
      }
    }
  }

  runTests()
    .then(() => {
      winston.info(`Done. Completed ${successful} test(s) successfully, failed ${failed} test(s).`)
    })
    .catch(e => {
      winston.error(`Failed to run tests: ${e}`)
    })
} catch (e) {
  winston.error(`Failed to run tests: ${e}`)
}

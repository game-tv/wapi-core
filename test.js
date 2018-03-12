// Set up logger
const logger = require('./index').Logger

try {
  const pkg = require('./package.json')
  const fs = require('fs')

  const files = fs.readdirSync('./tests')
  const tests = []
  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'base.test.js') tests.push(require(`./tests/${files[i]}`))
  }
  logger.info('Tests loaded.')

  logger.info(`Testing wapi-core@${pkg.version}`)

  let successful = 0
  let failed = 0

  const runTests = async () => {
    for (let i = 0; i < tests.length; i++) {
      const test = new tests[i]()
      logger.info(`Running test for ${test.name}`)
      try {
        await test.run()
        successful++
      } catch (e) {
        failed++
        return logger.error(`Test failed: ${e}`)
      }
    }
  }

  runTests()
    .then(() => {
      logger.info(`Done. Completed ${successful} test(s) successfully, failed ${failed} test(s).`)
    })
    .catch(e => {
      logger.error(`Failed to run tests: ${e}`)
    })
} catch (e) {
  logger.error(`Failed to run tests: ${e}`)
}

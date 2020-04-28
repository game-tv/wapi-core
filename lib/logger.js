const winston = require('winston')
const alignedWithColorsAndTime = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
)
module.exports = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: alignedWithColorsAndTime
})

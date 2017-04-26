"use strict"


const logger = require('winston');
const strftime = require('strftime');

const tsFormat = () => strftime('%b %d, %Y %H:%M:%S.%L');
logger.remove(logger.transports.Console);  
logger.add(logger.transports.Console, {
  timestamp: tsFormat,
  colorize: true,
  level: 'info'
});
logger.add(logger.transports.File, {
  filename: 'activity.log',
  timestamp: tsFormat,
  level: 'debug',
  json: false
});


module.exports=logger;
"use strict"

const logger = require('winston');
const strftime = require('strftime');

const config = require('config');

const tsFormat = () => strftime('%b %d, %Y %H:%M:%S.%L');
logger.remove(logger.transports.Console);  
logger.add(logger.transports.Console, {
	timestamp : tsFormat,
	colorize : true,
	level : config.get('Logger.consoleLevel')
});
logger.add(logger.transports.File, {
	filename : 'logs/activity.log',
	timestamp : tsFormat,
	level : config.get('Logger.fileLevel'),
	json : false,
	datePattern: '.yyyy-MM-dd',
	maxsize : 12500000	// 100 Mb
});


module.exports = logger;
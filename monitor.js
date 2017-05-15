"use strict"

const logger = require('./logger.js');
const sub = require('./subProcessor.js');
const db = require("./dbhandler.js");

const config = require('config');
const subs = config.get('subreddits');
const subCount = subs.length;
const cycleTime = config.get('Monitor.cycleTime');
const offset = cycleTime / subCount;

logger.info("Starting monitor. subCount: " + subCount + ', offset: ' + offset);

const process = function() {
	logger.info("Beginning main processing loop");
	for (let i = 0; i < subCount; i++) {
		setTimeout(sub.processSub, i * offset * 1000, subs[i])
	}
};

process();
setInterval(process, cycleTime * 1000);

//	TODO when shutting down...
//	db.closeConnectionPool(); // TODO connection should not be managed here
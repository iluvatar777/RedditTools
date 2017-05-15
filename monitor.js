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

const simpleProcess = function() {
	logger.info("simpleProcess");
	for (let i = 0; i < subCount; i++) {
		setTimeout(sub.processSub, i * offset * 1000, subs[i])
	}
	//sub.processSub('boardgames')
	//setTimeout(sub.processSub, 5 * 60 * 1000, 'hockey')
	//setTimeout(sub.processSub, 10 * 60 * 1000, 'aww')
};

simpleProcess();

setInterval(simpleProcess, cycleTime * 1000);

// TODO when shutting down...
//	db.closeConnectionPool(); // TODO connection should not be managed here
"use strict"

const sub = require('./subProcessor.js');
const db = require("./dbhandler.js");


const simpleProcess = function() {
	sub.processSub('boardgames')
	setTimeout(sub.processSub, 5 * 60 * 1000, 'hockey')
	setTimeout(sub.processSub, 10 * 60 * 1000, 'aww')
};

simpleProcess();

setInterval(simpleProcess, 15 * 60 * 1000);

// TODO when shutting down...
//	db.closeConnectionPool(); // TODO connection should not be managed here
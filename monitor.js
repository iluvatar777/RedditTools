"use strict"

const processor = require("./pageProcessor.js");
const pageRetriever = require("./pageRetriever.js");

const Promise = require('bluebird');
const Queue = require('promise-queue');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const logger = require('winston');
const strftime = require('strftime');


let commentsPageQueue = new Queue(10, Infinity);

let queueMonitor = '';
let queueMonitorCount = 0;


// Initialize default Winston logger. Other modules can just use default logger. TODO move to standalone file
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

// called on interval.
const checkQueues = function() {
	queueMonitorCount += 1 ;
	const cpQ = commentsPageQueue.getQueueLength();
	const cpP = commentsPageQueue.getPendingLength();

	((queueMonitorCount % 50 == 0) ? logger.info : logger.debug)('QueueMonitor ' + queueMonitorCount + ': commentsPageQueue ' + cpP + '/' + cpQ);

	if (cpQ + cpP == 0) {
		logger.info('Queues are empty, stopping queue monitor');
		clearInterval(queueMonitor);
	}
};


const subr = 'boardgames';

pageRetriever.getSubrPage(subr, 2)
.then(function($) {
	const posts = processor.processSubrPage($);
	logger.debug(JSON.stringify(posts));

	for (let i = 0; i < posts.length; i++) {
		const post = posts[i];

		commentsPageQueue.add(function() {
			logger.debug('Adding to commentsPageQueue: ' + post.fullname);
			return pageRetriever.getCommentsPage(subr, post.fullname); 
		})
		.then(function($post) {
			const postObj = processor.processCommentsPage($post);

			logger.debug(JSON.stringify(postObj));
		})				
		.catch(function(err) {
			logger.warn("commentsPageQueue Error: " + err);
		});
	};

})
.then(function() {
	logger.info('Starting Queue Monitor');
	queueMonitor = setInterval(checkQueues, 100); // TODO decide how often to ping
});



/*
const html =	'<ul id="fruits">\
				  <li class="fruit apple">nono<div class="thing">Apple</div></li>\
				  <li class="fruit orange">nope<div class="thing">Orange</div></li>\
				  <li class="fruit pear">no<div class="thing">Pear</div></li>\
				</ul>'

const $ = cheerio.load(html)

let test = [];

$('.fruit').each(function(i, elem) {
	test[i] = $(this).children('.thing').text();
});

console.log(test);*/

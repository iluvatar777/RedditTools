"use strict"

const logger = require('./logger.js');
const processor = require("./pageProcessor.js");
const pageRetriever = require("./pageRetriever.js");

const Promise = require('bluebird');
const Queue = require('promise-queue');
const cheerio = require('cheerio');


let commentsPageQueue = new Queue(10, Infinity);


let queueMonitor = '';
let queueMonitorCount = 0;

// called on interval.
const checkQueues = function() {
	queueMonitorCount += 1 ;
	const level = (queueMonitorCount % 50 == 0) ? 'info' : 'debug';

	const cpQ = commentsPageQueue.getQueueLength();
	const cpP = commentsPageQueue.getPendingLength();

	logger.log(level, 'QueueMonitor ' + queueMonitorCount + ': commentsPageQueue ' + cpP + '/' + cpQ);

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
			logger.verbose('Adding to commentsPageQueue: ' + post.fullname);
			return pageRetriever.getCommentsPage(subr, post.fullname); 
		})
		.then(function($post) {
			const postObj = processor.processCommentsPage($post);

			logger.debug(JSON.stringify(postObj));
		})				
		.catch(function(response) {
			logger.warn("commentsPageQueue Error: " + JSON.tostring(response));
		});
	};

})
.then(function() {
	logger.info('Starting Queue Monitor');
	queueMonitor = setInterval(checkQueues, 100); // TODO decide how often to ping
});
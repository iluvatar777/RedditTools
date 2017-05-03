"use strict"

const logger = require('./logger.js');
const processor = require("./pageProcessor.js");
const pageRetriever = require("./pageRetriever.js");
const db = require("./dbhandler.js");

const Promise = require('bluebird');
const Queue = require('promise-queue');
const cheerio = require('cheerio');
const arrayUnion = require('array-union');


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

		db.closeConnectionPool();			// TODO connection should not be managed here
	}
};

const retrieveSubr = function(subr) {
	return Promise.join(
		pageRetriever.getSubrPage(subr, 1),
		pageRetriever.getSubrPage(subr, 1, 'new'),
		function($hot, $new) {
			const posts = arrayUnion(processor.processSubrPage($hot), (processor.processSubrPage($new)));
			logger.verbose('Finished retrieving /r/' + subr + '. ' + posts.length + 'unique posts');
			return posts;
	})
};


const processSub = function(subr) {
	db.initConnectionPool();			// TODO connection should not be managed here

	return retrieveSubr(subr)
	.then(function(posts) {

		for (let i = 0; i < posts.length; i++) {								//TODO replace with .map() with concurrency
			const post = posts[i];

			commentsPageQueue.add(function() {
				logger.verbose('Adding to commentsPageQueue: ' + post);
				return pageRetriever.getCommentsPage(subr, post); 
			})
			.then(function($post) {
				const postObj = processor.processCommentsPage($post);
				logger.debug(JSON.stringify(postObj));

				return db.commentsResultInsert(postObj);
			})
			.then(function(rows, fields) {
				logger.debug("Insert success");
			})				
			.catch(function(response) {
				logger.warn("commentsPageQueue Error: " + JSON.stringify(response));
			});
		};
		logger.info('Starting Queue Monitor');
		queueMonitor = setInterval(checkQueues, 100); // TODO decide how often to ping
	});
};

const subr = 'boardgames';

processSub(subr);

setInterval(processSub, 300000, subr);
"use strict"

const logger = require('./logger.js');
const processor = require("./pageProcessor.js");
const pageRetriever = require("./pageRetriever.js");
const db = require("./dbhandler.js");

const Promise = require('bluebird');
const Queue = require('promise-queue');
const cheerio = require('cheerio');
const arrayUnion = require('array-union');


let postQueue = new Queue(10, Infinity);


let queueMonitor = '';
let queueMonitorCount = 0;

// called on interval.
const checkQueues = function() {
	queueMonitorCount += 1 ;
	const level = (queueMonitorCount % 60 == 0) ? 'info' : 'silly';

	const cpQ = postQueue.getQueueLength();
	const cpP = postQueue.getPendingLength();

	logger.log(level, 'QueueMonitor ' + queueMonitorCount + ': postQueue ' + cpP + '/' + cpQ);

	if (cpQ + cpP == 0) {
		logger.info('Queues are empty, stopping queue monitor');
		clearInterval(queueMonitor);

		db.closeConnectionPool();			// TODO connection should not be managed here
	}
};

// given a subreddit, retrieves list of hot, new, and [TODO] monitored post fullnames
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

// given a post fulllname, retrieves, processes and INSERTs to db
// uses a queue to manage concurrency
const processPost = function(subr, fullname) {
	return postQueue.add(function() {
		logger.verbose('Adding to postQueue: ' + subr + '/' + fullname);
		return pageRetriever.getPostPage(subr, fullname); 
	})
	.then(function($post) {
		const postObj = processor.processPostPage($post);
		logger.debug(JSON.stringify(postObj));

		return db.postResultInsert(postObj);
	})
	.then(function(rows, fields) {
		logger.debug("Insert success"); //  rows: " + JSON.stringify(rows));
	})				
	.catch(function(response) {
		logger.warn("postQueue Error: " + JSON.stringify(response));
	});

};


const processSub = function(subr) {
	db.initConnectionPool();			// TODO connection should not be managed here

	return retrieveSubr(subr)
	.then(function(posts) {
		for (let i = 0; i < posts.length; i++) {								//TODO replace with .map() with concurrency
			processPost(subr, posts[i])
		};

		logger.info('Starting Queue Monitor');
		queueMonitor = setInterval(checkQueues, 1000); 
	});
};

const subr = 'boardgames';

processSub(subr);

//setInterval(processSub, 300000, subr);
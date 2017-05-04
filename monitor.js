"use strict"

const logger = require('./logger.js');
const processor = require("./pageProcessor.js");
const pageRetriever = require("./pageRetriever.js");
const db = require("./dbhandler.js");

const Promise = require('bluebird');
const arrayUnion = require('array-union');


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
	return pageRetriever.getPostPage(subr, fullname)
	.then(function($post) {
		const postObj = processor.processPostPage($post);
		logger.debug(JSON.stringify(postObj));

		return db.postResultInsert(postObj);
	})
	.timeout(60000)
	.then(function(rows, fields) {
		logger.debug("Insert success"); //  rows: " + JSON.stringify(rows));
	})				
	.catch(function(response) {
		logger.warn("postQueue Error: " + JSON.stringify(response));
	});

};

// given a subreddit, find post, retrieve, process, and INSERT them to db.
const processSub = function(subr) {
	db.initConnectionPool();			// TODO connection should not be managed here

	return retrieveSubr(subr)
	.map(function(post) {
		return processPost(subr, post);
	}, {concurrency : 15}
	)
	.finally(function() {
		logger.verbose('Finished prosessing sub /r/' + subr);
		db.closeConnectionPool(); // TODO connection should not be managed here
	}); 
};


const subr = 'boardgames';

processSub(subr);

//setInterval(processSub, 300000, subr);
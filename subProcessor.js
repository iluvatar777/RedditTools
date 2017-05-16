"use strict"

const logger = require('winston');
const processor = require("./pageProcessor.js");
const pageRetriever = require("./pageRetriever.js");
const db = require("./dbhandler.js");

const Promise = require('bluebird');
const arrayUnion = require('array-union');

const config = require('config');
const httpTimeout = config.get('httpTimeout');
const dbTimeout = config.get('dbTimeout');


// given a subreddit, retrieves list of hot, new, and [TODO] monitored post fullnames
const retrieveSubr = function(subr) {
	return Promise.join(
		pageRetriever.getSubrPage(subr, 1),
		pageRetriever.getSubrPage(subr, 1, 'new'),
		function($hot, $new) {
			const posts = arrayUnion(processor.processSubrPage($hot), (processor.processSubrPage($new)));
			logger.debug('Finished retrieving /r/' + subr + '. ' + posts.length + ' unique posts');
			return posts;
	})
};

// given a post fulllname, retrieves, processes and INSERTs to db
// uses a queue to manage concurrency
const processPost = function(subr, fullname) {
	return pageRetriever.getPostPage(subr, fullname).timeout(httpTimeout, 'pageRetriever for ' + fullname + ' timed out') 
	.catch(Promise.TimeoutError, function(err) {
		logger.verbose(err + '  Retrying...');
		return pageRetriever.getPostPage(subr, fullname).timeout(httpTimeout, 'pageRetriever retry for ' + fullname + ' timed out')
	})
	.then(function($post) {
		const postObj = processor.processPostPage($post);
		logger.debug(JSON.stringify(postObj));

		return db.postResultInsert(postObj);
	}).timeout(dbTimeout, ['db timeout for ' + fullname])
	.then(function(result) {
		logger.debug('Insert success: ' + result.handle); //  rows: " + JSON.stringify(rows));
	})				
	.catch(function(err) {
		logger.error('ProcessPost Error: ' + err);
	});

};

// given a subreddit, find post, retrieve, process, and INSERT them to db.
const processSub = function(subr) {
	logger.verbose('subProcessor processing /r/' + subr);
	return retrieveSubr(subr)
	.map(function(post) {
		return processPost(subr, post);
	}, {concurrency : 15}
	)
	.finally(function() {
		logger.verbose('subProcessor finished prosessing sub /r/' + subr);
	}); 
};

//const subr = 'boardgames';
//processSub(subr);
//setInterval(processSub, 300000, subr);

exports.processSub = processSub;
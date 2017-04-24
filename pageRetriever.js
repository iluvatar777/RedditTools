"use strict"

const Promise = require('bluebird');
const request = require('request');
const cheerio = require('cheerio');
const logger = require('winston');

const getPage = function(url) {
	return new Promise(function(resolve, reject) { 
		logger.debug("getSubrPage attempt for " + url);
		request.get({
			    url: url
			}, 
			function(err, response, body) {
				logger.debug("getSubrPage Success for " + url);
				if (!err && response.statusCode == 200) {
					resolve(cheerio.load(body));
				} else {
					reject(err);
				}
			}
		);
	})
};


const getSubrPage = function(subr, page) {
	const fullUrl = 'https://www.reddit.com/r/' + subr + 
					'/?limit=100' + (page=0 ? '' : ('&count=' + ((page - 1) * 100)));
	return getPage(fullUrl);
};

const getCommentsPage = function(fullname, page) {
	fullname = (fullname.substring(0,3) = 't3_' ? fullname.substring(3) : fullname)
	const fullUrl = 'https://www.reddit.com/r/worldnews/comments/' + fullname
	return getPage(fullUrl);
};


exports.getPage = getPage;
exports.getSubrPage = getSubrPage;
exports.getCommentsPage = getCommentsPage;
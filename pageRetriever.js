"use strict"

const Promise = require('bluebird');
const request = require('request');
const cheerio = require('cheerio');
const logger = require('winston');

const getPage = function(url) {
	return new Promise(function(resolve, reject) { 
		logger.debug("getPage attempt for " + url);
		request.get({
			    url: url
			}, 
			function(err, response, body) {
				if (!err && response.statusCode == 200) {
					logger.debug("getPage Success for " + url);
					resolve(cheerio.load(body));
				} else {
					logger.debug("getPage Failure for " + url + '\n     ' + response.statusCode + ' ' + response.statusLine);
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

const getCommentsPage = function(subr, fullname) {
	fullname = (fullname.substring(0,3) == 't3_' ? fullname.substring(3) : fullname)
	const fullUrl = 'https://www.reddit.com/r/' + subr + '/comments/' + fullname
	return getPage(fullUrl);
};

exports.getPage = getPage;
exports.getSubrPage = getSubrPage;
exports.getCommentsPage = getCommentsPage;
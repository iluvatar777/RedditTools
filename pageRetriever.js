"use strict"

const Promise = require('bluebird');
const request = require('request');
const cheerio = require('cheerio');
const logger = require('winston');

const getPage = function(url) {
	return new Promise(function(resolve, reject) { 
		logger.verbose("getPage attempt for " + url);
		request.get({
			    url: url
			}, 
			function(err, response, body) {
				if (!err && response.statusCode == 200) {
					logger.verbose("getPage Success for " + url);
					resolve(cheerio.load(body));
				} else {
					logger.warn('getPage Failure (' + err + ')  + for ' +  url);
					reject(response);
				}
			}
		);
	})
};

const getSubrPage = function(subr, page, sort) {
	if (typeof(sort) === 'undefined') { sort = ''; }
	else { sort = '/' + sort; }

	if (page > 1) { page = ''; }
	else { page = '/?limit=100&count=' + ((page - 1) * 100); }

	const fullUrl = 'https://www.reddit.com/r/' + subr + sort + page;
	//				'/?limit=100' + (page == 0 ? '' : ('&count=' + ((page - 1) * 100)));
	logger.debug('get subr: ' + subr + '|' + page + '|' + sort + '   ' + fullUrl);
	return getPage(fullUrl);
};

const getPostPage = function(subr, fullname) {
	fullname = (fullname.substring(0,3) == 't3_' ? fullname.substring(3) : fullname)
	const fullUrl = 'https://www.reddit.com/r/' + subr + '/comments/' + fullname
	return getPage(fullUrl);
};

exports.getPage = getPage;
exports.getSubrPage = getSubrPage;
exports.getPostPage = getPostPage;
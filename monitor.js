"use strict"

const Promise = require('bluebird');
const Queue = require('promise-queue');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const strftime = require('strftime');

//const subrURL = 'https://www.reddit.com/r/boardgames/';


//let itemQueue = new Queue(5, Infinity);

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



const tsFormat = () => strftime('%b %d, %Y %H:%M:%S.%L');
const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: 'info'
    }),
    new (winston.transports.File)({
      filename: 'activity.log',
      timestamp: tsFormat,
      level: 'debug',
      json: false
    })
  ]
});



getSubrPage('boardgames', 2)
.then(function($) {
	let posts = [];

	$('.thing').each(function (i, elem) {
		let post = {
			score : $(this).find('.score.unvoted').text(),
			title : $(this).find('.title').text(),
			link : $(this).find('.first > a').attr('href')
		};

		posts[i] = post;
	});

	logger.debug(JSON.stringify(posts));

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

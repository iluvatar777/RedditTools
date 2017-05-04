"use strict"

const moment = require('moment');


const processSubrPage = function($) {
	let posts = [];
	$('.thing').each(function (i, elem) {
		/*let post = {
			score : $(this).find('.score.unvoted').text(),
			title : $(this).find('.title').text(),
			link : $(this).find('.first > a').attr('href'),
			fullname : $(this).data('fullname')
		};*/

		posts[i] = $(this).data('fullname');
	});
	return posts;
};

const processPostPage = function($) {

	const submitTime = + new Date($('.date').find('time').attr('datetime'));
	const now = Date.now();
	const nowM = moment().format();

	//const totalVotes = parseInt($('.totalvotes').find('.number').text());		// This appears to only work when logged in
	const score = parseInt($('.score').find('.number').text())
	const percentUp = parseInt($('.score').text().split('%')[0].split('(')[1])  // TODO deal with score = 0. can't know how many votes
	const up = Math.round(score / (2 * percentUp / 100 - 1));

	const post = {
		fullname : $('.thing').first().data('fullname'),
		subreddit : $('.thing').first().data('subreddit'),
		score : score,					
		up : up,													// score = up - down
		down : up - score,											// redundant - score and percentUp are the raw data.
		percentUp : percentUp,										
		author : $('.thing').first().data('author'), //$('.entry').first().find('a.author').text(),
		title : $('a.title').text(),
		domain : $('.thing').first().data('domain'), // $('.domain').find('a').text(),
		comments : parseInt($('.bylink.comments').text().split(' ')[0]),
		sSincePost : Math.floor((now - submitTime) / 1000),
		time : nowM,
		isNSFW : ($('.entry').find('.nsfw-stamp.stamp').length > 0),
		isSpoiler : ($('.entry').find('.spoiler-stamp.stamp').length >0)
	};
	return post;
};

exports.processSubrPage = processSubrPage;
exports.processPostPage = processPostPage;
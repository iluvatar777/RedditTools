"use strict"

const processSubrPage = function($) {
	let posts = [];
	$('.thing').each(function (i, elem) {
		let post = {
			//score : $(this).find('.score.unvoted').text(),
			title : $(this).find('.title').text(),
			//link : $(this).find('.first > a').attr('href'),
			fullname : $(this).data('fullname')
		};

		posts[i] = post;
	});
	return posts;
};

const processCommentsPage = function($) {

	const submitTime = $('.linkinfo').find('time').attr('datetime')


	const post = {
		score : $('.score').find('.number').text(),
		author: $('.entry').first().find('a.author').text(),
		title: $('a.title').text(),
		domain: $('.domain').find('a').text(),
		comments: $('.bylink.comments').text().split(' ')[0],
		timeSincePost: 'TODO'
	};
	return post;
};

exports.processSubrPage = processSubrPage;
exports.processCommentsPage = processCommentsPage;
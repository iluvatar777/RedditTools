"use strict"

const processSubrPage = function($) {
	let posts = [];
	$('.thing').each(function (i, elem) {
		let post = {
			score : $(this).find('.score.unvoted').text(),
			title : $(this).find('.title').text(),
			link : $(this).find('.first > a').attr('href'),
			fullname : $(this).data('fullname')
		};

		posts[i] = post;
	});
	return posts;
};

const processCommentsPage = function($) {
	let post = {
		//score : $(this).find('.score.unvoted').text(),
		//title : $(this).find('.title').text(),
		//link : $(this).find('.first > a').attr('href'),
		//fullname : $(this).data('fullname')
	};
	return post;
};

exports.processSubrPage = processSubrPage;
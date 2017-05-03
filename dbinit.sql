CREATE DATABASE IF NOT EXISTS redditTools;

USE redditTools;

CREATE TABLE IF NOT EXISTS post (
	fullname varchar(15),											# id of the thread
	subreddit varchar(255),
	author varchar(255), 
	title varchar(255),
	domain varchar(255),
	isNSFW boolean,
	isSpoiler boolean,
	firstProcessed timestamp,
	CONSTRAINT PK_post PRIMARY KEY (fullname)
);

CREATE TABLE IF NOT EXISTS postData (
	fullname varchar(15),											# id of the thread
	processTime timestamp,
	sSincePost int,													# seconds since original post
	score int,
	up int,
	down int,
	percentUp int,													# number of miliseconds since origionally posted
	comments int,													# number of comments on the thread
	CONSTRAINT PK_postData PRIMARY KEY (fullname, sSincePost),
	FOREIGN KEY (fullname) REFERENCES post(fullname)
);

DELIMITER //
CREATE PROCEDURE CommentPageInsert (		
		IN fullname varchar(15),
		IN subreddit varchar(255),		# post only
		IN author varchar(255), 
		IN title varchar(255),
		IN domain varchar(255),
		IN isNSFW boolean,
		IN isSpoiler boolean,
	#	IN firstProcessed timestamp,
		IN processTime timestamp,		# postData
		IN sSincePost int,
		IN score int,
		IN up int,
		IN down int,
		IN percentUp int,
		IN comments int
	)
	BEGIN
		INSERT IGNORE INTO post(fullname, subreddit, author, title, domain, isNSFW, isSpoiler, firstProcessed)
		VALUES (fullname, subreddit, author, title, domain, isNSFW, isSpoiler, processTime);

		INSERT INTO postData(fullname, score, up, down, percentUp, comments, processTime, sSincePost)
		VALUES (fullname, score, up, down, percentUp, comments, processTime, sSincePost);
	END //
DELIMITER ;
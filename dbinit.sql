CREATE DATABASE redditTools;

CREATE TABLE post (
	fullname varchar(15),											# id of the thread
	subreddit varchar(255),
	author varchar(255), 
	title varchar(255),
	domain varchar(255),
	firstProcessed timestamp,
	CONSTRAINT PK_post PRIMARY KEY (fullname)
);

CREATE TABLE postData (
	fullname varchar(15),											# id of the thread
	processTime timestamp,
	sSincePost int,													# seconds since original post
	score int,
	up int,
	down int,
	percentUp int,													# number of miliseconds since origionally posted
	comments int,													# number of comments on the thread
	CONSTRAINT PK_postData PRIMARY KEY (fullname, msSincePost),
	FOREIGN KEY (fullname) REFERENCES post(fullname)
);
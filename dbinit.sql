CREATE DATABASE redditTools;

CREATE TABLE Persons (
	fullname varchar(15),	# id of the thread
    score int,
    author varchar(255), 
    title varchar(255),
    domain varchar(255),
    delta int,				# number of seconds since origionally posted
    comments int			# number of comments on the thread
);
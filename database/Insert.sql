use Socialnetwork;

insert into StudentAccount values (1, 'jay1', 'jay@123');
insert into StudentAccount values (2, 'gloroia', 'mk@123');
insert into StudentAccount values (3, 'mike', 'dv@123');
insert into StudentAccount values (4, 'mitches', 'mi@123');
insert into StudentAccount values (5, 'claire', 'cl@123');
insert into StudentAccount values (6, 'luke', 'lk@123');
insert into StudentAccount values (7, 'phil', 'pl@123');
insert into StudentAccount values (8, 'alex', 'ax@123');

insert into StudentProfile values (1, 'Jay Street', 'alx@nyu,.edu', 'male', 22, 'New York', '2019-04-5 10:00:00');
insert into StudentProfile values (2, 'Gloroia Williamsburg', 'mk@nyu,.edu', 'female', 32, 'California', '2019-04-5 10:00:00');
insert into StudentProfile values (3, 'Mike Ingham', 'pw@nyu,.edu', 'female', 42, 'Minessota', '2019-04-5 10:00:00');
insert into StudentProfile values (4, 'Mitches Douglas', 'mgs@nyu,.edu', 'male', 25, 'Dover', '2019-04-5 10:00:00');
insert into StudentProfile values (5, 'Claire Peters', 'cgs@nyu,.edu', 'female', 27, 'Dover', '2019-04-5 10:00:00');
insert into StudentProfile values (6, 'Luke Peters', 'cgsf@nyu,.edu', 'female', 27, 'Dover', '2019-04-5 10:00:00');
insert into StudentProfile values (7, 'Phil Bolder', 'pgs@nyu,.edu', 'male', 28, 'New York', '2019-04-5 10:00:00');
insert into StudentProfile values (8, 'Alex Douglas', 'ags@nyu,.edu', 'male', 21, 'New York', '2019-04-5 10:00:00');

update StudentProfile set city = 'Washington' where UID = 1;

insert into StudentRelations values (1, 2, 'requested', '2019-04-5 11:00:00');
insert into StudentRelations values (2, 1, 'received', '2019-04-5 11:00:00');
insert into StudentRelations values (3, 2, 'requested', '2019-04-5 11:00:00');
insert into StudentRelations values (2, 3, 'received', '2019-04-5 11:00:00');
insert into StudentRelations values (3, 4, 'friends', '2019-04-5 11:00:00');
insert into StudentRelations values (4, 3, 'friends', '2019-04-5 11:00:00');
insert into StudentRelations values (3, 5, 'friends', '2019-04-5 11:00:00');
insert into StudentRelations values (5, 3, 'friends', '2019-04-5 11:00:00');
insert into StudentRelations values (5, 6, 'friends', '2019-04-5 11:00:00');
insert into StudentRelations values (6, 5, 'friends', '2019-04-5 11:00:00');
insert into StudentRelations values (5, 7, 'friends', '2019-04-5 11:00:00');
insert into StudentRelations values (7, 5, 'friends', '2019-04-5 11:00:00');
insert into StudentRelations values (7, 8, 'friends', '2019-04-5 11:00:00');
insert into StudentRelations values (8, 7, 'friends', '2019-04-5 11:00:00');

insert into Location values (1, 40.7128, 74.0060, 'Pizza Hut', 'New York City', 'New York', 'USA');
insert into Location values (2, 43.7128, 78.0060, 'New York University', 'New York City', 'New York', 'USA');
insert into Location values (3, 30.8734, 50.1210, 'Chipotle', 'San Francisco', 'California', 'USA');
insert into Location values (4, 38.7128, 71.0060, 'Reading Market', 'Philadelphia', 'Pennsylvania', 'USA');
insert into Location values (5, 40.7128, 74.0060, 'IKEA', 'New York City', 'New York', 'USA');

insert into Posts values (1, 1, 1, '2019-04-5 10:00:00', 2);
insert into PostContent values (1, 1, 'text', 'Hello Everyone. How are you? Please read my latest book.');
insert into PostContent values (2, 1, 'pdf', 'https://www.blogpost.com/alex.pdf');

insert into Posts values (2, 2, 2, '2019-04-5 10:00:00', 1);
insert into PostContent values (3, 2, 'text', 'Hello all.');

insert into Posts values (3, 3, 2, '2019-04-5 10:00:00', 1);
insert into PostContent values (4, 3, 'text', 'University Selection');

insert into Photos values (1, 1, LOAD_FILE('/Users/ujjwalchadha/Documents/Pics/IMG_0203.CR2.jpg'));

insert into Comments values (1, 1, 1, "This is very good. Thanks", now());
insert into Comments values (2, 2, 1, "Interesting", now());
insert into Comments values (3, 3, 2, "I'm in!", now());

insert into restrictions values(1,'public',null);
insert into restrictions values(2,'private',null);
insert into restrictions values(3,'friends-of-friends',null);


insert into Posts values (4, 4, 2, now(), 1);
insert into PostContent values (6, 4, 'text', 'welcome to NYU!!');

insert into Posts values (5, 5, 2, now(), 1);
insert into PostContent values (7, 5, 'text', 'Graduated!!');

insert into Posts values (6, 6, 1, now(), 3);
insert into PostContent values (9, 6, 'text', 'Should go to Gracehopper conference');

insert into Posts values (7, 5, 2, now(), 2);
insert into PostContent values (7, 5, 'text', 'Did you do Db project');

insert into Posts values (8, 3, 2, now(), 1);
insert into PostContent values (10, 8, 'text', 'This is kiran');






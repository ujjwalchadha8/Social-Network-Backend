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

insert into Posts values (1, 1, 1, '2019-04-5 10:00:00', 2,"My first post");
insert into PostContent values (1, 1, 'text', 'Hello Everyone. How are you? Please read my latest book.');
insert into PostContent values (2, 1, 'pdf', 'https://www.blogpost.com/alex.pdf');

insert into Posts values (2, 2, 2, '2019-04-5 10:00:00', 1,"welcome post");
insert into PostContent values (3, 2, 'text', 'Hello all.');

insert into Posts values (3, 3, 2, '2019-04-5 10:00:00', 1,"selection done");
insert into PostContent values (4, 3, 'text', 'University Selection');

-- insert into Photos values (1, 1, LOAD_FILE('/Users/ujjwalchadha/Documents/Pics/nyu.jpg'));

insert into Comments values (1, 1, 1, "This is very good. Thanks", now());
insert into Comments values (2, 2, 1, "Interesting", now());
insert into Comments values (3, 3, 2, "I'm in!", now());

insert into restrictions values(1,'public',null);
insert into restrictions values(2,'private',null);
insert into restrictions values(3,'friends-of-friends',null);


insert into Posts values (4, 4, 2, now(), 1,"My first post");
insert into PostContent values (6, 4, 'text', 'welcome to NYU!!');

insert into Posts values (5, 5, 2, now(), 1,"Graduated");
insert into PostContent values (7, 5, 'text', 'Graduated!!');

insert into Posts values (6, 6, 1, now(), 3,"Conference");
insert into PostContent values (9, 6, 'text', 'Should go to Gracehopper conference');

insert into Posts values (7, 5, 2, now(), 2,"Project update");
insert into PostContent values (8, 5, 'text', 'Did you do Db project');

insert into Posts values (8, 3, 2, now(), 1,"Introduction");
insert into PostContent values (10, 8, 'text', 'This is kiran');

-- insert into Photos values (2, 4, LOAD_FILE('/Users/ujjwalchadha/Documents/Pics/IMG_0203.CR2.jpg'));


insert into events (location_id,Type,Event_date,timestamp,Title,Description)
values(2,"Seminar","2019-05-08 13:00:00",now(),"AI in Robotics","Explore how Ai and computer vision change the world of automation");

insert into events (location_id,Type,Event_date,timestamp,Title,Description)
values(2,"Commencement","2019-05-22 13:00:00",now(),"NYU 2019 Commencement","NYU Tnadon commencement for 2019 class");

insert into events (location_id,Type,Event_date,timestamp,Title,Description)
values(1,"AD","2019-05-11 13:00:00",now(),"Free Pizza","Get NYU card!! get Pizza!!");

insert into events (location_id,Type,Event_date,timestamp,Title,Description)
values(4,"Fests","2019-04-22 13:00:00",now(),"Cherry Blossom","Visit Philly!!");

insert into events (location_id,Type,Event_date,timestamp,Title,Description)
values(2,"OSARC","2019-05-15 13:00:00",now(),"Stress Buster","come LC223 to relieve strees!!");

insert into events (location_id,Type,Event_date,timestamp,Title,Description)
values(5,"AD","2019-05-22 13:00:00",now(),"IKEA Student","New student Discount");

alter table SGroups AUTO_INCREMENT=100;
	
insert into SGroups(timestamp,Title,Description) 
values(now(),"Data Science", "Updates on Data Science in Industry");

insert into SGroups(timestamp,Title,Description) 
values(now(),"DB project Group", "Updates on Project");

insert into SGroups(timestamp,Title,Description) 
values(now(),"NYU class of 2019", "Only 2019 Graduates");

insert into SGroups(timestamp,Title,Description) 
values(now(),"ONCampus Jobs", "Updates on oncampus job postings");

insert into SGroups(timestamp,Title,Description) 
values(now(),"Computer Science career", "Job postings for CS students");

insert into studentgroup values(100,1,now());
insert into studentgroup values(200,2,now());
insert into studentgroup values(200,1,now());
insert into studentgroup values(300,7,now());
insert into studentgroup values(300,3,now());
insert into studentgroup values(300,2,now());
insert into studentgroup values(300,1,now());
insert into studentgroup values(400,1,now());
insert into studentgroup values(400,1,now());
insert into studentgroup values(400,2,now());
insert into studentgroup values(400,3,now());
insert into studentgroup values(400,4,now());
insert into studentgroup values(400,5,now());
insert into studentgroup values(500,2,now());
insert into studentgroup values(500,1,now());
insert into studentgroup values(500,4,now());

insert into restrictions(type,group_id) values("group", 100);
insert into restrictions(type,group_id) values("group", 200);
insert into restrictions(type,group_id) values("group", 300);
insert into restrictions(type,group_id) values("group", 400);
insert into restrictions(type,group_id) values("group", 500);

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (1, 2, now(), 4, "Group");
insert into PostContent(post_id,content_type,content_data) values (9, 'text', 'welcome to Group!!');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (2, 2, now(), 5,"welcome");
insert into PostContent(post_id,content_type,content_data) values (10, 'text', 'Hello!!');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (1, 2, now(), 5,"update");
insert into PostContent(post_id,content_type,content_data) values (11, 'text', 'back end is Node and front end is React');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (7, 2, now(), 6,"kudos");
insert into PostContent(post_id,content_type,content_data) values (12, 'text', 'Congrats');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (3, 2, now(), 6,"Graduation");
insert into PostContent(post_id,content_type,content_data) values (13, 'text', 'commencement on May 22');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (2, 2, now(), 6,"Graduation");
insert into PostContent(post_id,content_type,content_data) values (14, 'text', 'need commencement tickets of ALL NYU yankee stadium');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (1, 2, now(),7,"job");
insert into PostContent(post_id,content_type,content_data) values (15, 'text', 'NYU IT oncampus job. Interested ping me!!');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (5, 2, now(), 7,"job");
insert into PostContent(post_id,content_type,content_data) values (16, 'text', 'Need Graduate Assistant in CS department front desk');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (8, 2, now(), 5,"job");
insert into PostContent(post_id,content_type,content_data) values (17, 'text', 'I set up the backend and some one should work on front end');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (4, 2, now(), 8,"job");
insert into PostContent(post_id,content_type,content_data) values (18, 'text', 'Google openings 2019. Apply on website');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (4, 2, now(), 7,"job");
insert into PostContent(post_id,content_type,content_data) values (19, 'text', 'Research assistantship in AI');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (3, 2, now(), 7,"job");
insert into PostContent(post_id,content_type,content_data) values (20, 'text', 'Graduate Assistant for NYU Graduates front desk');

insert into Posts (user_id,location_id,timestamp,restriction_id,title) values (2, 2, now(), 7,"survey");
insert into PostContent(post_id,content_type,content_data) values (21, 'text', 'Need help for survey');


insert into Comments(user_id,post_id,text,timestamp)
values(2,1,"Hello",now());

insert into Comments(user_id,post_id,text,timestamp)
values(2,3,"Yes",now());
insert into Comments(user_id,post_id,text,timestamp)
values(3,4,"Interesting",now());
insert into Comments(user_id,post_id,text,timestamp)
values(2,7,"I am curious",now());
insert into Comments(user_id,post_id,text,timestamp)
values(7,8,"yeah",now());
insert into Comments(user_id,post_id,text,timestamp)
values(5,4,"Hi",now());
insert into Comments(user_id,post_id,text,timestamp)
values(3,2,"Interesting",now());






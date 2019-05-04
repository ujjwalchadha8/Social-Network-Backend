use SocialNetwork;
drop table if exists StudentAccount;
create table StudentAccount(
	 UID integer primary key auto_increment,
 	 username varchar(50) unique not null,
     password varchar(50) not null,
     check (char_length(password) >= 6)
);
	

drop table if exists StudentProfile; 
create table StudentProfile (
	UID integer primary key references StudentAccount(UID)
	on delete cascade,
    displayname varchar(100) not null,
    email varchar(255) unique not null,
    gender varchar(10),
	check (gender in ('male', 'female', 'other')),
    age integer(2),
    city varchar(15),
    timestamp datetime not null
);



drop table if exists StudentRelations;
create table StudentRelations(
	user_id integer not null references StudentAccount(UID)
	on delete cascade,
    friend_id integer not null references StudentAccount(UID)
	on delete cascade,
    status varchar(15) not null,
    timestamp datetime,
    check (status in ('friends', 'requested', 'received', 'blocked')),
    constraint primary key (user_id, friend_id)
);


drop table if exists Location;
create table Location (
	LID integer primary key auto_increment,
    latitude float not null,
    longitude float not null,
    name varchar(100) not null,
    city varchar(100),
    state varchar(100),
    country varchar(100)
);
    
ALTER TABLE posts
  ADD title VARCHAR(50);
drop table if exists Posts;
create table Posts (
	PID integer primary key auto_increment,
    user_id integer not null references StudentAccount(UID),
    location_id integer references Location(LID),
    timestamp datetime not null,
	title varchar(50);
    restriction_id integer not null references restriction(RID)
    );


drop table if exists PostContent;
create table PostContent (
	PCID integer primary key auto_increment,
    post_id integer not null references Posts(PID),
	content_type varchar(20) not null,
    content_data longtext not null
);

drop table if exists Events;
create table Events (
    EID integer primary key auto_increment,
    location_id integer not null references Location(LID),
    Type varchar(15) not null,
    Event_date datetime not null,
    timestamp datetime not null,
    Title varchar(35) not null,
    Description Text not null
);


drop table if exists Photos;
create table Photos (
	PHID integer primary key auto_increment,
	post_id integer not null references Posts(PID),
    photo blob not null
);

drop table if exists Comments;
create table Comments (
	CID integer primary key auto_increment,
    user_id integer not null references StudentAccount(UID),
    post_id integer not null references Posts(PID),
    text varchar(1000) not null,
    timestamp datetime not null
);

drop table if exists Likes;
create table Likes (
	user_id integer not null references StudentAccount(UID),
    post_id integer not null references Posts(PID),
    timestamp datetime not null,
    constraint primary key (user_id, post_id)
);

drop table if exists PostTags;
create table PostTags (
	user_id integer not null references StudentAccount(UID),
    post_id integer not null references Posts(PID),
    constraint primary key (user_id, post_id)
);

drop table if exists Restrictions;
create table Restrictions (
    RID integer primary key auto_increment,
    type varchar(40) not null,
    group_id integer references sgroups(GID) ,
    check (type in ('public', 'private', 'friends-of-friends',’group’))

);

drop table if exists SGroups;
create table SGroups (
    GID integer primary key auto_increment,
    timestamp datetime not null,
    Title varchar(35) not null,
    Description Text not null
);

drop table if exists StudentGroup;
create table StudentGroup (
    GID integer not null references SGroups(GID),
    UID integer not null references Student(UID),
    timestamp datetime not null
)

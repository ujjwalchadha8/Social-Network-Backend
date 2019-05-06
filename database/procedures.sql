drop procedure if exists get_friends;
DELIMITER //
Create PROCEDURE get_friends(IN id INT)
BEGIN
select studentrelations.friend_id,studentprofile.displayname,studentaccount.username
from studentrelations inner join studentprofile 
on studentrelations.friend_id = studentprofile.UID
inner join studentaccount on studentrelations.friend_id = studentaccount.UID
where user_id = id and status = 'friends'
union
select distinct UR2.friend_id,studentprofile.displayname,studentaccount.username
from studentrelations UR1 inner join studentrelations UR2 
on UR1.friend_id = UR2.user_id
inner join studentprofile on UR2.friend_id = studentprofile.UID
inner join studentaccount on UR2.friend_id = studentaccount.UID
where UR1.user_id = id and UR2.friend_id != id and UR2.status = 'friends';
END//
delimiter ;

-- --------------------------------

drop procedure if exists get_post_content_latest;
delimiter //
create procedure get_post_content_latest(IN id int)
BEGIN
select distinct posts.PID,posts.user_id,studentaccount.username,studentprofile.displayname,postcontent.content_type,postcontent.content_data,photos.photo,restrictions.type,location.name locationName,
location.city,location.state,location.country,posts.title,posts.timestamp time from posts 
inner join postcontent on posts.PID = postcontent.post_id 
inner join studentprofile on posts.user_id = studentprofile.UID
inner join studentaccount on posts.user_id = studentaccount.UID
inner join restrictions on posts.restriction_id = restrictions.RID
left outer join photos on posts.PID = photos.post_id
left outer join location on posts.location_id = location.LID
where posts.restriction_id in (1,3)
and posts.user_id in (
select friend_id
from studentrelations 
where user_id = id and status = 'friends'
union
select distinct UR2.friend_id
from studentrelations UR1 inner join studentrelations UR2 
on UR1.friend_id = UR2.user_id
where UR1.user_id = id and UR2.friend_id != id and UR2.status = 'friends')
order by time;
END //
delimiter ;
-- --------------------------------------------

drop procedure if exists get_post_user;
delimiter //
create procedure get_post_user(IN id int)
BEGIN
select distinct posts.PID,posts.user_id,studentaccount.username,studentprofile.displayname,postcontent.content_type,postcontent.content_data,photos.photo,restrictions.type,location.name locationName,
location.city,location.state,location.country,posts.title,posts.timestamp time from posts 
inner join postcontent on posts.PID = postcontent.post_id 
inner join studentprofile on posts.user_id = studentprofile.UID
inner join studentaccount on posts.user_id = studentaccount.UID
inner join restrictions on posts.restriction_id = restrictions.RID
left outer join photos on posts.PID = photos.post_id
left outer join location on posts.location_id = location.LID
where posts.user_id = id and posts.restriction_id in (1,2,3)
order by time;
END //
delimiter ;
-- ---------------------------------------------------------------

drop procedure if exists get_group_posts;
Delimiter //
create procedure get_group_posts(IN group_id INT)
begin
select p.PID,p.user_id,p.timestamp,p.restriction_id,p.title,G.content_type,G.content_data,ph.photo,l.name locationName,l.city,l.state,l.country,s.displayname,sc.username,r.type restrictionType,r.group_id,sg.Title grouptitle,sg.Description groupdesc from posts p 
inner join postcontent G on p.PID = G.post_id
left outer join photos ph on p.PID = ph.post_id
inner join location l on p.location_id = l.LID
inner join studentprofile s on p.user_id = s.UID
inner join studentaccount sc on p.user_id = sc.UID
inner join restrictions r on p.restriction_id = r.RID
inner join sgroups sg on r.group_id = sg.GID
where r.group_id = group_id
order by timestamp;
end//
delimiter ;
-- ------------------------------------------------------------

drop procedure if exists get_user_groups;
delimiter //
create procedure get_user_groups(IN id INT)
begin
select distinct s.UID,s.username,p.displayname,sg.GID,sg.timestamp,g.Title,g.Description FROM studentaccount s
inner join studentprofile p on s.UID = p.UID
inner join studentgroup sg on sg.UID = s.UID
inner join sgroups g on sg.GID = g.GID
where s.UID = id
order by g.Title;
END//
delimiter ;
-- --------------------------------------------------------------

drop procedure if exists get_groups_can_subscribe;
delimiter //
create procedure get_groups_can_subscribe(IN id INT)
begin
select distinct sg.GID,g.Title,g.Description from
studentgroup sg
inner join sgroups g on sg.GID = g.GID
where sg.GID not in (select studentgroup.GID from studentgroup where studentgroup.UID = id )
order by g.Title;
END//
delimiter ;

-- --------------------------------------------------------------------------

drop procedure if exists get_direct_friends;
delimiter //
create procedure get_direct_friends(IN id INT)
BEGIN
select distinct r.friend_id ,p.displayname,sc.username
from studentrelations r 
inner join studentprofile p on r.friend_id = p.UID
inner join studentaccount sc on r.friend_id = sc.UID
where user_id = id and status = 'friends';
END//
delimiter ;
-- -------------------------------------------------

drop procedure if exists get_comments;
delimiter //
create procedure get_comments(IN id INT)
BEGIN
select comments.CID,comments.user_id,comments.text,comments.timestamp,studentprofile.displayname,studentaccount.username 
from comments inner join studentprofile on comments.user_id = studentprofile.UID
inner join studentaccount on comments.user_id = studentaccount.UID
where comments.post_id = id;
END//
delimiter ;
-- -------------------------------------------------------------

drop procedure if exists get_status_friend_requests;
delimiter //
create procedure get_status_friend_requests(IN id INT)
BEGIN
select r.friend_id,r.status,p.displayname,sc.username from studentrelations r
inner join studentaccount sc on r.friend_id = sc.UID
inner join studentprofile p on r.friend_id = p.UID
where r.status <> "friends" and r.user_id = id;
end//
delimiter ;
-- ------------------------------------------------------------

drop procedure if exists send_friend_request;
delimiter //
create procedure send_friend_request(IN uid int, IN fid int)
BEGIN
insert into studentrelations values(uid,fid,"requested", now());
insert into studentrelations values(fid,uid,"received",now());
END//
delimiter ;
-- --------------------------------------------------------

drop procedure if exists accept_friend_request;
delimiter //
create procedure accept_friend_request(IN id int, IN fid int)
BEGIN
update studentrelations set status = "friends", timestamp = now() where user_id = id and friend_id = fid;
update studentrelations set status = "friends", timestamp = now() where user_id = fid and friend_id = id;
END//
delimiter ;
-- ------------------------------------------------------------

drop procedure if exists block_friend_request;
delimiter //
create procedure block_friend_request(IN id int, IN fid int)
BEGIN
update studentrelations set status = "blocked", timestamp = now() where user_id = id and friend_id = fid;
update studentrelations set status = "blocked", timestamp = now() where user_id = fid and friend_id = id;
END//
delimiter ;
-------------------------------------------------------
drop procedure if exists checkfriend;
delimiter //
create procedure checkfriend(IN uid int, IN fid int)
BEGIN
declare isFriend int;
declare isBlocked int;
select count(*) into isFriend from studentrelations where user_id = uid and friend_id = fid and status = "friends";
select count(*) into isBlocked from studentrelations where user_id = uid and friend_id = fid and status = "blocked";
if isblocked =0 and isFriend = 0 THEN call get_post_any_user_not_friend(fid);
elseif isblocked =0 and isFriend >0 THEN call get_post_user(fid);
end if;
end//
delimiter ;
-------------------------------------------------------------------------
drop procedure if exists get_post_any_user_not_friend;
delimiter //
create procedure get_post_any_user_not_friend(IN id int)
BEGIN
select distinct posts.PID,posts.user_id,posts.title,studentaccount.username,studentprofile.displayname,postcontent.content_type,postcontent.content_data,photos.photo,restrictions.type,location.name locationName,
location.city,location.state,location.country,posts.timestamp time from posts 
inner join postcontent on posts.PID = postcontent.post_id 
inner join studentprofile on posts.user_id = studentprofile.UID
inner join studentaccount on posts.user_id = studentaccount.UID
inner join restrictions on posts.restriction_id = restrictions.RID
left outer join photos on posts.PID = photos.post_id
left outer join location on posts.location_id = location.LID
where posts.user_id = id and posts.restriction_id =1
order by time;
END//
delimiter;
-------------------------------------------------------------------------
delimiter //
create procedure checkuseringroup(IN user_id int, IN group_id int)
BEGIN
declare isInGroup INT;
select count(*) into isInGroup from studentgroup where studentgroup.GID = group_id and studentgroup.UID = user_id;
if isInGroup >0 then call get_group_posts(group_id);
end if;
end//
delimiter ;
-----------------------------------------------------------------------

drop procedure if exists search_post_content_latest;
delimiter //
create procedure search_post_content_latest(IN id int,IN word varchar(50))
BEGIN
select distinct posts.PID,posts.user_id,studentaccount.username,studentprofile.displayname,postcontent.content_type,postcontent.content_data,photos.photo,restrictions.type,location.name locationName,
location.city,location.state,location.country,posts.title,posts.timestamp time from posts 
inner join postcontent on posts.PID = postcontent.post_id 
inner join studentprofile on posts.user_id = studentprofile.UID
inner join studentaccount on posts.user_id = studentaccount.UID
inner join restrictions on posts.restriction_id = restrictions.RID
left outer join photos on posts.PID = photos.post_id
left outer join location on posts.location_id = location.LID
where posts.restriction_id in (1,3) and posts.title like word
and posts.user_id in (
select friend_id
from studentrelations 
where user_id = id and status = 'friends'
union
select distinct UR2.friend_id
from studentrelations UR1 inner join studentrelations UR2 
on UR1.friend_id = UR2.user_id
where UR1.user_id = id and UR2.friend_id != id and UR2.status = 'friends')
order by time;
END //
delimiter ;
----------------------------------------------------------------
delimiter //
create function add_post(user_id int,restrictionId int,locationName varchar(50),title varchar(100))
returns BIGINT
BEGIN
declare locationID varchar(50);
select location.LID into locationID from location where location.name = locationName;
insert into Posts (user_id,location_id,restriction_id,title,timestamp) values(user_id,locationID,restrictionId,title,now());
return LAST_INSERT_ID();
end //
delimiter ;
------------------------------------------------------------------------
delimiter //
create function add_post_to_group_func(user_id int, group_id int,locationName varchar(50),title varchar(100))
returns BIGINT
BEGIN
declare restrictionID int;
declare locationID varchar(50);
select rid into restrictionID from restrictions where restrictions.group_id = group_id;
select location.LID into locationID from location where location.name = locationName;
insert into Posts (user_id,location_id,restriction_id,title,timestamp) values(user_id,locationID,restrictionID,title,now());
return LAST_INSERT_ID();
END //
delimiter ;
---------------------------------------------------------------------------------------
drop procedure if exists search_groups;
delimiter //
create procedure search_groups(IN id int,IN word varchar(50))
begin
select distinct s.UID,s.username,p.displayname,sg.GID,sg.timestamp,g.Title,g.Description FROM studentaccount s
inner join studentprofile p on s.UID = p.UID
inner join studentgroup sg on sg.UID = s.UID
inner join sgroups g on sg.GID = g.GID
where s.UID = id and g.Title like word
order by g.Title;
END//
delimiter ;








































Misc:

select postcontent.content_data, posts.user_id, posts.restriction_id from posts 
inner join postcontent on posts.PID = postcontent.post_id 
where posts.restriction_id in (1,3)
and posts.user_id in (
select friend_id
from studentrelations 
where user_id = 3 and status = 'friends'
union
select distinct UR2.friend_id
from studentrelations UR1 inner join studentrelations UR2 
on UR1.friend_id = UR2.user_id
where UR1.user_id = 3 and UR2.friend_id != 3 and UR2.status = 'friends')
union 
select postcontent.content_data, posts.user_id, posts.restriction_id from posts 
inner join postcontent on posts.PID = postcontent.post_id and posts.user_id = 3;



-------------------------------------------

select postcontent.content_data, postcontent.content_type,posts.user_id,studentprofile.displayname,photos.photo,posts.timestamp time from posts 
inner join postcontent on posts.PID = postcontent.post_id 
inner join studentprofile on posts.user_id = studentprofile.UID
left outer join photos on posts.PID = photos.post_id
where posts.restriction_id in (1,3)
and posts.user_id in (
select friend_id
from studentrelations 
where user_id = 3 and status = 'friends'
union
select distinct UR2.friend_id
from studentrelations UR1 inner join studentrelations UR2 
on UR1.friend_id = UR2.user_id
where UR1.user_id = 3 and UR2.friend_id != 3 and UR2.status = 'friends')
union 
select postcontent.content_data,postcontent.content_type, posts.user_id,studentprofile.displayname,photos.photo,posts.timestamp time from posts 
inner join postcontent on posts.PID = postcontent.post_id and posts.user_id = 3
inner join studentprofile on posts.user_id = studentprofile.UID
left outer join photos on posts.PID = photos.post_id
----------------------------------------------------------


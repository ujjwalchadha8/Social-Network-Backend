DELIMITER //
Create PROCEDURE get_friends(IN id INT)
BEGIN
select friend_id
from studentrelations 
where user_id = id and status = 'friends'
union
select distinct UR2.friend_id
from studentrelations UR1 inner join studentrelations UR2 
on UR1.friend_id = UR2.user_id
where UR1.user_id = id and UR2.friend_id != id and UR2.status = 'friends';
END//
delimiter ;

--------------------------------

delimiter //
create procedure get_post_content_latest(IN id int)
BEGIN
select posts.PID,posts.user_id,studentaccount.username,studentprofile.displayname,postcontent.content_type,postcontent.content_data,photos.photo,restrictions.type,location.name locationName,
location.city,location.state,location.country,posts.timestamp time from posts 
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
--------------------------------------------
delimiter //
create procedure get_post_user(IN id int)
BEGIN
select posts.PID,posts.user_id,studentaccount.username,studentprofile.displayname,postcontent.content_type,postcontent.content_data,photos.photo,restrictions.type,location.name locationName,
location.city,location.state,location.country,posts.timestamp time from posts 
inner join postcontent on posts.PID = postcontent.post_id 
inner join studentprofile on posts.user_id = studentprofile.UID
inner join studentaccount on posts.user_id = studentaccount.UID
inner join restrictions on posts.restriction_id = restrictions.RID
left outer join photos on posts.PID = photos.post_id
left outer join location on posts.location_id = location.LID
where posts.user_id = id
order by time;
END //
delimiter ;
---------------------------------------------------------------





































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
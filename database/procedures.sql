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
select postcontent.content_data, posts.user_id, posts.restriction_id,posts.timestamp time from posts 
inner join postcontent on posts.PID = postcontent.post_id 
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
union 
select postcontent.content_data, posts.user_id, posts.restriction_id, posts.timestamp time from posts 
inner join postcontent on posts.PID = postcontent.post_id and posts.user_id = id
order by time;
END //
delimiter ;
--------------------------------------------




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
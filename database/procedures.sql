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
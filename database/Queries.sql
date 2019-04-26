use Socialnetwork;

select * from StudentAccount;

select * from StudentRelations;

select friend_id from UserRelations where user_id = 1 and status = 'friends';

select * from Posts;

select * from PostContent;

select * from Comments;

select distinct UR2.friend_id
	from UserRelations UR1 inner join UserRelations UR2 on UR1.friend_id = UR2.user_id
    where UR1.user_id = 1 and UR2.friend_id != 1;


select * from UserProfile where UID = 3;


select * from 
	Posts left outer join PostContent on Posts.PID = PostContent.post_id 
			left outer join Photos on Photos.post_id = Posts.PID
            left outer join PostTags on PostTags.post_id = Posts.PID where Posts.user_id = 1
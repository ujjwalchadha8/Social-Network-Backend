create trigger on_group_added
after insert 
on sgroups
for each row
begin	
	insert into restrictions(group_id,type) values (NEW.GID,"group");
end
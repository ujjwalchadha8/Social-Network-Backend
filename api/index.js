const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const assert = require('assert');
const cors = require('cors');
const fs = require("fs");
const fileUpload = require('express-fileupload');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', cookie: { secure: false, httpOnly: false, maxAge: 600000 }, resave: false, saveUninitialized: false}));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'SocialNetwork',
	multipleStatements: true
});
  
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to DB!");
});

app.get('/posts', (req, res) => {
    let sortBy = req.body.sortBy;
    let offset = req.body.offset;
    let limit = req.body.limit;
})

app.get('/get-profile', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
        let sql;
        let args;
        if (req.query.username) {
            sql = "select StudentAccount.uid, username, displayName, email, gender, age, city, timestamp from StudentProfile inner join StudentAccount on StudentProfile.uid = StudentAccount.uid where StudentAccount.username = ?";            
            args = [req.query.username]
        } else {
            sql = "select StudentAccount.uid, username, displayName, email, gender, age, city, timestamp from StudentProfile inner join StudentAccount on StudentProfile.uid = StudentAccount.uid where StudentAccount.uid = ?";
            args = [req.session.uid]
        }
        con.query(sql, args, (err, sqlResult) => {
            if (err) {
                console.error(err);
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Profile does not exist',
                    reason: 'PROFILE_NOT_FOUND',
                })
            } else if (sqlResult.length == 1) {
                let profile = sqlResult[0];
                if (req.session.uid === profile.uid) {
                    profile.data = {
                        relation: 'me'
                    }
                    res.status(200).send({
                        body: {
                            profile: profile
                        }
                    })
                } else {
                    getFriendshipStatus(req.session.uid, profile.uid, (response) => {
                        console.log(response);
                        profile.data = {
                            relation: response
                        }
                        res.status(200).send({
                            body: {
                                profile: profile
                            }
                        })
                    }, (err) => console.error(err))
                }
                console.log(JSON.stringify(profile));
                
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

function getFriendshipStatus(uidFrom, uidTo, successCallback, errorCallback) {
    let sql = "select status from StudentRelations where user_id = ? and friend_id = ?";
    console.log(uidFrom, uidTo);
    con.query(sql, [uidFrom, uidTo], (err, sqlResult) => {
        if (err) {
            errorCallback(err);
        } else {
            if (sqlResult.length == 0) {
                successCallback('unknown')
            } else if (sqlResult.length == 1){
                successCallback(sqlResult[0].status)
            } else {
                throw new assert.AssertionError("Cannot have more than 1 records for this request");
            }
        }
    })
}

app.post('/update-profile', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
        let uid = req.session.uid;
        let email = req.body.email;
        let gender = req.body.gender;
        let city = req.body.city;
        let sql = "update StudentProfile set displayName = ?, email = ?, gender = ?, age = ?, city = ? where uid = ?";
        let vars = [req.body.displayName, email, gender, req.body.age, city, uid]
        con.query(sql, vars, (err, sqlResult) => {
            if (err) {
                console.error(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            } else {
                res.status(200).send({
                    body: 'success'
                })
            }
        })
    }
})

app.post('/create-profile', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
        return;
    }
    let sql = "insert into StudentProfile(UID, displayName, email, gender, age, city, timestamp) values(?, ?, ?, ?, ?, ?, now())";
    let vars = [req.session.uid, req.body.displayName, req.body.email, req.body.gender, req.body.age, req.body.city];
    if (!isEmailValid(req.body.email)) {
        res.status(500).send({
            body: 'Invalid Email',
            reason: 'INVALID_EMAIL'
        });
        return;
    }
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'EMAIL_TAKEN'
                })
            } else {
                console.error(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            res.status(200).send({
                body: 'success'
            })
        }
    });
})

app.post('/register', (req, res) => {
    let sql = "insert into StudentAccount(username, password) values(?, MD5(?))";
    let vars = [req.body.username, req.body.password];
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'USER_TAKEN'
                })
            } else {
                console.error(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            res.status(200).send({
                body: 'success'
            })
        }
    });
})


app.post('/login', (req, res) => {
    let sql = "select UID, username, password from StudentAccount where username = ? and password = MD5(?)";
    let vars = [req.body.username, req.body.password];
    con.query(sql, vars, (err, sqlResult) => {
        if (err) {
            console.error(err)
            res.status(500).send({
                body: 'Couldn`t proceed with request',
                reason: 'SERVER_ERROR'
            })
        } else {
            if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Invalid username and/or password',
                    reason: 'INVALID_USER',
                })
            } else if (sqlResult.length == 1) {
                req.session.uid = sqlResult[0].UID
                res.status(200).send({
                    body: 'success',
                    userId: req.session.uid
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        }
    })
})

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (!err) {
            res.status(200).send({
                body: 'success'
            })
        } else {
            console.error(err)
            res.status(500).send({
                body: 'Cannot logout',
                reason: 'SERVER_ERROR'
            })
        }
    })
})

app.get('/session', (req, res) => {
    if (req.session.uid) {
        res.status(200).send({
            body: 'success',
            uid: req.session.uid
        });
    } else {
        res.status(500).send({
            body: 'Invalid session',
            reason: 'SESSION_EXPIRED'
        })
    }
})



app.get('/get_post_content', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
		
        let sql = "CALL get_post_content_latest(?);";
        con.query(sql,[req.session.uid],(err, sqlResult) => {
			
            if (err) {
				console.log(err);
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: {
						posts:sqlResult
					}
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

app.get('/get_posts_user', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
		let sql;
		let vars;
		if(req.query.userID && req.query.userID != req.session.uid){
			sql = "call checkfriend(?,?);";
			vars = [req.session.uid,req.query.userID]
		}
		else {
			sql = "CALL get_post_user(?);";
			vars = [req.session.uid]
		}
		
        
        con.query(sql,vars,(err, sqlResult) => {
			
            if (err) {
				console.log(err);
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: {
						posts:sqlResult
					}
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

app.get('/get_events', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {       
        let sql = "select events.EID,events.Description,events.Event_date,events.Type,events.Title,events.timestamp,location.name,location.name,location.city,location.state,location.country from events inner join location on events.location_id = location.LID order by timestamp ;";
        
        con.query(sql,[],(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: {
                        events: sqlResult
                    }
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

app.post('/get_group_posts', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "call checkuseringroup(?,?);";
	//let sql = "call get_group_posts(?);";
    let vars = [req.session.uid,req.body.groupID];
    con.query(sql, vars, (err, sqlResult) => {
        if (err) {
            console.error(err)
            res.status(500).send({
                body: 'Couldn`t proceed with request',
                reason: 'SERVER_ERROR'
            })
        } else {
            res.status(200).send({
                    body: sqlResult
                })
        }
    })
	}
})

app.get('/get_user_groups', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else { 
        	
        let sql = "call get_user_groups(?);";
        let args;
        if (req.query.userID) {        
            args = [req.query.userID]
        } else {       
            args = [req.session.uid]
        }
        
        con.query(sql,args,(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: {
                        events: sqlResult
                    }
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

app.get('/get_groups_can_subscribe', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {       
        let sql = "call get_groups_can_subscribe(?);";
		let args;
        if (req.query.userID) {        
            args = [req.query.userID]
        } else {       
            args = [req.session.uid]
        }
        
        con.query(sql,args,(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: {
                        events: sqlResult
                    }
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

app.get('/get_direct_friends', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {       
        let sql = "call get_direct_friends(?);";
		let args;
        if (req.query.userID) {        
            args = [req.query.userID]
        } else {       
            args = [req.session.uid]
        }
        
        con.query(sql,args,(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: {
                        events: sqlResult
                    }
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

app.get('/get_friends', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {       
        let sql = "call get_friends(?);";
		let args;
        if (req.query.userID) {        
            args = [req.query.userID]
        } else {       
            args = [req.session.uid]
        }
        
        con.query(sql,args,(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: {
                        events: sqlResult
                    }
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

app.get('/get_comments', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "call get_comments(?);";
    let vars = [req.query.postID];
    con.query(sql, vars, (err, sqlResult) => {
        if (err) {
            console.error(err)
            res.status(500).send({
                body: 'Couldn`t proceed with request',
                reason: 'SERVER_ERROR'
            })
        } else {
            if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: sqlResult
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        }
    })
	}
})

app.get('/get_friends_status_requests', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {       
        let sql = "call get_status_friend_requests(?);";
        
        con.query(sql,[req.session.uid],(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            }else if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: {
                        events: sqlResult
                    }
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})
app.post('/send_request', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "call send_friend_request(?,?);";
    let vars = [req.session.uid,req.body.friendID];
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'USER_TAKEN'
                })
            } else {
                console.error(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            res.status(200).send({
                body: 'success'
            })
        }
    });
	}
})

app.post('/accept_request', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "call accept_friend_request(?,?);";
    let vars = [req.session.uid,req.body.friendID];
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'USER_TAKEN'
                })
            } else {
                console.error(err);
				console.log(sql);
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            res.status(200).send({
                body: 'success'
            })
        }
    });
	}
})
app.post('/block_request', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "call block_friend_request(?,?);";
    let vars = [req.session.uid,req.body.friendID];
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'USER_TAKEN'
                })
            } else {
                console.error(err);
				console.log(sql);
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            res.status(200).send({
                body: 'success'
            })
        }
    });
	}
})

app.post('/add_event', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "insert into events(Description,Event_date,location_id,Title,Type,timestamp) values(?,?,?,?,?,now())";
    let vars = [req.body.description, req.body.eventDate,req.body.locationID,req.body.title,req.body.type];    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.error(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            res.status(200).send({
                body: result
            })
        }
    });
	}
})

app.post('/add_comment', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
	let eventType = "add_comment"
    let sql = "insert into Comments(user_id,post_id,text,timestamp) values(?,?,?,now());";
	sql+="insert into timeline(user_id,eventType,eventId,timestamp) values(?,?,?,now());";
    let vars = [req.session.uid, req.body.postID,req.body.commentText,req.session.uid,eventType,req.body.postID];    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.error(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            res.status(200).send({
                body: result
            })
        }
    });
	}
})

app.post('/add_like', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
	let eventType = "add_like";
    let sql = "insert into likes(user_id,post_id,timestamp) values(?,?,now());";	
	sql+="insert into timeline(user_id,eventType,eventId,timestamp) values(?,?,?,now());";
    let vars = [req.session.uid, req.body.postID,req.session.uid, eventType,req.body.postID];    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.error(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            res.status(200).send({
                body: result
            })
        }
    });
	}
});

app.post('/delete_like', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "delete from likes where user_id = ? and post_id = ?";
    let vars = [req.session.uid, req.body.postID];    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.error(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            res.status(200).send({
                body: result
            })
        }
    });
	}
});

app.post('/add_group', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "insert into SGroups(timestamp,Title,Description) values(?,?,now())";
    let vars = [req.session.uid, req.body.postID];    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.error(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            res.status(200).send({
                body: result
            })
        }
    });
	}
})
// To get PID , use body.ID
app.post('/add_post', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
	let sql;
	let vars;
	if(req.body.GroupID){
	   sql = "select add_post_to_group_func(?,?,?,?) as ID;";
       vars = [req.session.uid,req.body.GroupID, req.body.locationID, req.body.title];   
		
	}
	else {
		sql = "select add_post(?,?,?,?) as ID;";
        vars = [req.session.uid,req.body.restrictionID, req.body.locationID, req.body.title]; 
		
	}
    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.log(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            console.log(result.insertId);		
            res.status(200).send({
				
                body: result
            })
        }
    });
	}
})
app.post('/add_post_content', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "insert into PostContent(post_id,content_type,content_data) values(?,?,?);";
    let vars = [req.body.PostID, req.body.type,req.body.data];    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.log(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {		
            res.status(200).send({
				
                body: result
            })
        }
    });
	}
})
app.post('/add_location', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "insert into location(latitude,longitude,name,city,state,country) values(?,?,?,?,?,?);";
    let vars = [req.body.latitude,req.body.longitude,req.body.name,req.body.city,req.body.state,req.body.country];    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.log(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {		
            res.status(200).send({
				
                body: result
            })
        }
    });
	}
})
app.get('/search_location', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "select LID,latitude,longitude,name,city,state,country from location where lower(name) like lower(?)";
	var locationName1 = req.query.locationName.replaceAll("%", "\\%");
	var locationName = locationName1.replaceAll("_", "\\_");
    let vars = ["%"+locationName+"%"];    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.log(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {		
            res.status(200).send({
                body: result
            })
        }
    });
	}
})
app.get('/search_friends', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
    let sql = "select distinct r.friend_id ,p.displayname,sc.username from studentrelations r inner join studentprofile p on r.friend_id = p.UID inner join studentaccount sc on r.friend_id = sc.UID where user_id = ? and status = 'friends' and lower(sc.username) like lower(?)";
    var userName1 = req.query.username.replaceAll("%", "\\%");
	var userName = userName1.replaceAll("_", "\\_");
	let vars = [req.session.uid,"%"+userName+"%"];    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.log(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {		
            res.status(200).send({
				
                body: result
            })
        }
    });
	}
})
app.get('/search_post', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
		
        let sql = "CALL search_post_content_latest(?,?);";
		var title1 = req.query.title.replaceAll("%", "\\%");
	    var title = title1.replaceAll("_", "\\_");
        con.query(sql,[req.session.uid,"%"+title+"%"],(err, sqlResult) => {
			
            if (err) {
				console.log(err);
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: {
						posts:sqlResult
					}
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})
app.get('/search_groups', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
		
        let sql = "CALL search_groups(?,?);";
		var title1 = req.query.title.replaceAll("%", "\\%");
	    var title = title1.replaceAll("_", "\\_");
        con.query(sql,[req.session.uid,"%"+title+"%"],(err, sqlResult) => {
			
            if (err) {
				console.log(err);
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length >= 0) {
                res.status(200).send({
                    body: {
						events:sqlResult
					}
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})
app.get('/get_like_count', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
		
        let sql = "select count(*) likecount, posts.PID  from likes inner join posts on likes.post_id = posts.PID where posts.PID = ? group by posts.PID;";
        con.query(sql,[req.query.postID],(err, sqlResult) => {
			
            if (err) {
				console.log(err);
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length == 0) {
                res.status(200).send({
                    body: {
						posts:[
					      {
						   "likecount": 0,
						   "PID": req.body.postID
					     }
				        ]
					}
                })
            } else if (sqlResult.length > 0) {
                res.status(200).send({
                    body: {
						posts:sqlResult
					}
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

app.post('/upload-post', function(req, res) {
	
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {	
        let imagePath;
		let postID;
        //CREATE PHOTO ONLY IF IMAGE IS PRESENT
		if (req.files) {
			//STORE THIS FILE AT PATH IN BLOB
			imagePath = req.files.sampleFile.tempFilePath;			
		}
        let contentType = "text";

		//postContent contains the content_data. content_type is always 'text'
        let vars = [req.session.uid,req.body.postLocationId,
                            req.body.postRestrictionId != -1 ? req.body.postRestrictionId : null,
                            req.body.postGroupId != -1 ? req.body.postGroupId : null,
                            req.body.postTitle,contentType,req.body.postContent,imagePath]
        console.log(vars);
        
        let sql = "select upload_post(?,?,?,?,?,?,?,?) as id";
        con.query(sql,vars,(err, sqlResult) => {
			
            if (err) {
				console.log(err);
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else {
                //ALWAYS SEND THIS AS THE SUCCESS RESPONSE:
    			postID = sqlResult[0]["id"];	
                console.log(postID);
                
                if (req.files) {
                    let sampleFile = req.files.sampleFile;
                    sampleFile.mv('bucket/'+postID, function(err) {
                        if (err) {
                            console.error(err);
                        }
                    })
                }

                res.status(200).send(`
						<p>File Uploaded! Redirecting.</p>
						<script type="text/javascript">
							window.location.href = 'http://localhost:3000/'
						</script>
					`);
            }
        })
    } 
});

app.use(fileUpload());

app.post('/add_image', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
        if (Object.keys(req.files).length == 0) {
            return res.status(400).send('No files were uploaded.');
        }
        let sampleFile = req.files.sampleFile;
        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv('filename.png', function(err) {
            if (err)
            return res.status(500).send(err);

            res.send('File uploaded!');
        });
        if (!req.body.imagePath) {
            res.status(200).send({hi: "hi"}); return;
        }
        let sql = "insert into Photos(post_id,photo) values (?, ?)";
        let imagepath = fs.readFileSync(req.body.imagePath);
        let vars = [req.body.postID,imagepath];    
        con.query(sql, vars, function (err, result) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    res.status(500).send({
                        body: 'Couldn`t proceed with request',
                        reason: 'Event_TAKEN'
                    })
                } else {
                    console.log(err)
                    res.status(500).send({
                        body: 'Couldn`t proceed with request',
                        reason: 'SERVER_ERROR'
                    })
                }
            } else {		
                res.status(200).send({
                    
                    body: result
                })
            }
        });
	}
})
app.get('/remove_group', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
		
        let sql = "call remove_group(?);";
        con.query(sql,[req.query.groupID,req.query.groupID,req.query.groupID],(err, sqlResult) => {
			
            if (err) {
				
                console.log(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            
        } else {		
            res.status(200).send({
				
                body: sqlResult
            })
        }
        })
    }
})
app.get('/get_group_details', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
		
        let sql = "select GID,Description,timestamp,Title from sgroups where GID = ?";
        con.query(sql,[req.query.groupID],(err, sqlResult) => {
			
            if (err) {
				console.log(err);
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Posts does not exist',
                    reason: 'PROFILE_NOT_FOUND',
                })
            } else if (sqlResult.length > 0) {
                res.status(200).send({
                    body: {
						events:sqlResult
					}
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})
app.get('/get_users_like_post', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
		
        let sql = "select likes.user_id,likes.post_id,likes.timestamp,studentprofile.displayname,studentaccount.username from likes inner join studentprofile on likes.user_id = studentprofile.UID inner join studentaccount on likes.user_id = studentaccount.UID where likes.post_id = ?";
        con.query(sql,[req.query.postID],(err, sqlResult) => {
			
            if (err) {
				console.log(err);
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            }else if (sqlResult.length >= 0) {
                let isLiked = false;
                sqlResult.forEach(user => {
                    if (user.user_id === req.session.uid) {
                        isLiked = true
                    }
                });
                res.status(200).send({
                    body: {
                        users: sqlResult,
                        isLiked: isLiked
					}
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

app.post('/subscribe_to_group', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
	let vars = [req.session.uid,req.body.GroupID];
	let sql = "insert into studentgroup(UID,GID,timestamp) values(?,?,now()); "
	    
    con.query(sql, vars, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'Event_TAKEN'
                })
            } else {
                console.log(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            }
        } else {
            console.log(result.insertId);		
            res.status(200).send({
				
                body: result
            })
        }
    });
	}
})
app.post('/unsubscribe_group', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
        let sql = "delete from studentgroup where UID = ? and GID = ?";
        con.query(sql,[req.session.uid,req.body.groupID],(err, sqlResult) => {
            if (err) {
                console.log(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            
        } else {	
            console.log('unsubscribed');	
            res.status(200).send({
                body: sqlResult
            })
        }
        })
    }
})

app.get('/search_users', (req, res) => {
	if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
        let sql = "select s.UID,s.username,p.displayname,p.email,p.email,p.gender,p.age,p.city from studentaccount s inner join studentprofile p on s.UID = p.UID where lower(s.username) like lower(?)";
        var userName1 = req.query.username.replaceAll("%", "\\%");
        var userName = userName1.replaceAll("_", "\\_");
        let vars = ["%"+userName+"%"];    
        con.query(sql, vars, function (err, result) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    res.status(500).send({
                        body: 'Couldn`t proceed with request',
                        reason: 'Event_TAKEN'
                    })
                } else {
                    console.log(err)
                    res.status(500).send({
                        body: 'Couldn`t proceed with request',
                        reason: 'SERVER_ERROR'
                    })
                }
            } else {		
                res.status(200).send({
                    
                    body: result
                })
            }
        });
	}
})

app.get('/get_timeline', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
        let sql = "select eventType, eventId, timestamp from timeline where user_id = ? order by timestamp desc";
        con.query(sql,[req.query.uid], (err, sqlResult) => {
            if (err) {
                console.log(err)
                res.status(500).send({
                    body: 'Couldn`t proceed with request',
                    reason: 'SERVER_ERROR'
                })
            
        } else {		
            res.status(200).send({	
                body: sqlResult
            })
        }
        })
    }
})

app.get('/image', (req, res) => {
    res.sendFile('./bucket/'+req.query.imagePath, { root: __dirname });
})


String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};



function isEmailValid(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

app.listen(4000)
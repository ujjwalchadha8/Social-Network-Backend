const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const assert = require('assert');
const cors = require('cors')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', cookie: { secure: false, httpOnly: false, maxAge: 600000 }, resave: false, saveUninitialized: false}));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }))

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'SocialNetwork'
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
        let password = req.body.password;
        let gender = req.body.gender;
        let country = req.body.country;
        let state = req.body.state;
        let city = req.body.city;
        let address = req.body.address;
        let sql = "update StudentProfile set email = ?, gender = ?, city = ?, where uid = ?";
        let vars = [email, password, gender, country, state, city, address, uid]
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
    let sql = "insert into StudentAccount(username, password) values(?, ?)";
    let vars = [req.body.username, req.body.password];
    if (!isEmailValid(req.body.username)) {
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
    let sql = "select UID, username, password from StudentAccount where username = ? and password = ?";
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
            } else if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Posts does not exist',
                    reason: 'PROFILE_NOT_FOUND',
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

app.get('/get_posts_user', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
		let sql;
		let vars;
		if(req.body.userID){
			sql = "call checkfriend(?,?);";
			vars = [req.session.uid,req.body.userID]
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
            } else if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Posts does not exist',
                    reason: 'PROFILE_NOT_FOUND',
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

app.get('/get_events', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {       
        let sql = "select events.EID,events.Description,events.Event_date,events.Type,events.Title,location.name,location.name,location.city,location.state,location.country from events inner join location on events.location_id = location.LID order by timestamp;";
        
        con.query(sql,[],(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Events does not exist',
                    reason: 'Evnets_NOT_FOUND',
                })
            } else if (sqlResult.length > 0) {
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
        if (req.body.userID) {        
            args = [req.body.userID]
        } else {       
            args = [req.session.uid]
        }
        
        con.query(sql,args,(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Events does not exist',
                    reason: 'Evnets_NOT_FOUND',
                })
            } else if (sqlResult.length > 0) {
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
        if (req.body.userID) {        
            args = [req.body.userID]
        } else {       
            args = [req.session.uid]
        }
        
        con.query(sql,args,(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Events does not exist',
                    reason: 'Evnets_NOT_FOUND',
                })
            } else if (sqlResult.length > 0) {
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
        if (req.body.userID) {        
            args = [req.body.userID]
        } else {       
            args = [req.session.uid]
        }
        
        con.query(sql,args,(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Friends does not exist',
                    reason: 'Friends_NOT_FOUND',
                })
            } else if (sqlResult.length > 0) {
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
        if (req.body.userID) {        
            args = [req.body.userID]
        } else {       
            args = [req.session.uid]
        }
        
        con.query(sql,args,(err, sqlResult) => {
            if (err) {
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Friends does not exist',
                    reason: 'Friends_NOT_FOUND',
                })
            } else if (sqlResult.length > 0) {
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
    let sql = "call get_comments(?);";
    let vars = [req.body.postID];
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
                    body: 'Invalid postID',
                    reason: 'INVALID_post',
                })
            } else if (sqlResult.length > 0) {
                res.status(200).send({
                    body: sqlResult
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        }
    })
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
            } else if (sqlResult.length == 0) {
                res.status(500).send({
                    body: 'Friends does not exist',
                    reason: 'Friends_NOT_FOUND',
                })
            } else if (sqlResult.length > 0) {
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
})

app.post('/accept_request', (req, res) => {
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
})
app.post('/block_request', (req, res) => {
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
})

app.post('/add_event', (req, res) => {
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
})

app.post('/add_comment', (req, res) => {
    let sql = "insert into Comments(user_id,post_id,text,timestamp) values(?,?,?,now())";
    let vars = [req.session.uid, req.body.postID,req.body.commentText];    
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
})

app.post('/add_like', (req, res) => {
    let sql = "insert into likes(user_id,post_id,timestamp) values(?,?,now())";
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
})
app.post('/add_group', (req, res) => {
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
})
app.post('/add_post', (req, res) => {
    let sql = "insert into Posts (user_id,location_id,restriction_id,title,timestamp) values(?,?,?,?,now());";
    let vars = [req.session.uid, req.body.locationID, req.body.restrictionID,req.body.title];    
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
})
app.post('/add_post_content', (req, res) => {
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
})
app.post('/add_location', (req, res) => {
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
})
app.post('/search_location', (req, res) => {
    let sql = "select LID,latitude,longitude,name,city,state,country from location where lower(name) like lower(?)";
    let vars = ["%"+req.body.locationName+"%"];    
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
})
app.post('/search_friends', (req, res) => {
    let sql = "select s.UID,s.username,p.displayname,p.email,p.email,p.gender,p.age,p.city from studentaccount s inner join studentprofile p on s.UID = p.UID where s.username like ?";
    let vars = ["%"+req.body.username+"%"];    
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
})
app.get('/search_post', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {
		
        let sql = "CALL search_post_content_latest(?,?);";
        con.query(sql,[req.session.uid,"%"+req.body.title+"%"],(err, sqlResult) => {
			
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
						posts:sqlResult
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
        con.query(sql,[req.body.postID],(err, sqlResult) => {
			
            if (err) {
				console.log(err);
                res.status(500).send({
                    body: 'Internal server error',
                    reason: 'SERVER_ERROR',
                })
            } else if (sqlResult.length == 0) {
                res.status(500).send({
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




function isEmailValid(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

app.listen(4000)
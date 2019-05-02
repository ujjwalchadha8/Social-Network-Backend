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
            sql = "select displayName, email, gender, age, city, timestamp from StudentProfile inner join StudentAccount on StudentProfile.uid = StudentAccount.uid where StudentAccount.username = ?";            
            args = [req.query.username]
        } else {
            sql = "select displayName, email, gender, age, city, timestamp from StudentProfile where uid = ?";
            args = [req.session.uid]
        }
        con.query(sql, args, (err, sqlResult) => {
            if (err) {
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
				console.log("profile " + sqlResult[0]);
                res.status(200).send({
                    body: {
                        profile: sqlResult[0]
                    }
                })
            } else {
                new assert.AssertionError('Unique field cannot have 2 rows with same value');
            }
        })
    }
})

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
		
        let sql = "CALL get_post_user(?);";
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

app.get('/get_events', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {       
        let sql = "select events.Description,events.Event_date,events.Type,events.Title,location.name,location.name,location.city,location.state,location.country from events inner join location on events.location_id = location.LID order by timestamp;";
        
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
    let sql = "call get_group_posts(?);";
    let vars = [req.body.groupID];
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
                    body: 'Invalid GroupID',
                    reason: 'INVALID_Group',
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

app.get('/get_user_groups', (req, res) => {
    if (!req.session.uid) {
        res.status(500).send({
            body: 'Session expired',
            reason: 'SESSION_EXPIRED'
        })
    } else {       
        let sql = "call get_user_groups(?);";
        
        con.query(sql,[req.session.uid],(err, sqlResult) => {
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



function isEmailValid(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

app.listen(4000)
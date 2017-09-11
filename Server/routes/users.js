const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');

// localhost:3000/users/signup
router.post('/signup', function(req, res, next){
    pool.getConnection(function(err, conn){
        if(err){
            console.log('getConnection Error: ', err);
            res.status(500).send({
                'message': 'Get Database Connection Error'
            });
        }
        else{
            var name = req.body.name;
            var height = req.body.height;
            var weight = req.body.weight;
            var bloodtype = req.body.bloodtype;
            var phone_number = req.body.phone_number;
            var emergency_number = req.body.emergency_number;
            var password = req.body.password;
            var etc = req.body.etc;
            if(name == null || phone_number == null || emergency_number == null || password == null){
                res.status(400).send({
                    'message': 'Please input necessary contentents'
                });
                console.log("name: " + name);
                console.log("phone_number: " + phone_number);
                console.log("emergency_number: " + emergency_number);
                console.log("password: " + password);
            }
            else{
                let query1 = 'Select 1 from User where phone_number=?';
                conn.query(query1, phone_number, function(error1, data1) {
                    if(error1){
                        console.log('Select Query Error: ', error1);
                        res.status(417).send({
                            'message': 'Database Selection Error'
                        });
                    }
                    else if(data1.length > 0) {
                        console.log('Duplicate User Signup');
                        res.status(412).send({
                            'message': 'Already exists account(Phone number)'
                        });
                    }
                    else {
                        let query2 = 'Insert into User (name, height, weight, bloodtype, phone_number, emergency_number, password, etc) values (?, ?, ?, ?, ?, ?, ?, ?)';
                        conn.query(query2, [name, height, weight, bloodtype, phone_number, emergency_number, password, etc], function (error2, data2) {
                            if (error2) {
                                console.log('Insert Query Error: ', error2);
                                res.status(417).send({
                                    'message': 'Database Insertion Error'
                                });
                            }
                            else {
                                console.log('New User Signup');
                                res.status(200).send({
                                    'message': 'Successfully Signup',
                                    'user_id': data2.insertId
                                });
                            }
                        });
                    }
                    conn.release();
                });
            }
        }
    });
});

router.post('/dupcheck', function(req, res, next){
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log('getConnection Error: ', err);
            res.status(500).send({
                'message': 'Get Database Connection Error'
            });
        }
        else{
            var phone_number = req.body.phone_number;
            if(phone_number == null) {
                res.status(400).send({
                    'message': 'Please input phone number'
                });
            }
            else{
                let query1 = 'Select 1 from User where phone_number=?';
                conn.query(query1, phone_number, function(error1, data1) {
                    if (error1) {
                        console.log('Select Query Error: ', error1);
                        res.status(417).send({
                            'message': 'Database Selection Error'
                        });
                    }
                    else if (data1.length > 0) {
                        console.log('Duplicate User Signup');
                        res.status(201).send({
                            'message': 'Already exists account(Phone number)'
                        });
                    }
                    else{
                        console.log('Not a duplicate user');
                        res.status(200).send({
                            'message': 'Not a duplicate account(Phone number)'
                        });
                    }
                    conn.release();
                });
            }
        }
    });
});

router.post('/login', function(req, res, next){
    pool.getConnection(function(err, conn){
        if(err){
            console.log('getConnection Error: ', err);
            res.status(500).send({
                'message': 'Get Database Connection Error'
            });
        }
        else {
            var phonenumber = req.body.phonenumber;
            var password = req.body.password;
            if(phonenumber == null || password == null){
                res.status(400).send({
                    'message': 'Please input necessary contentents'
                });
            }
            else{
                query1 = 'Select id from User where phonenumber=? and password=?';
                conn.query(query1, [phonenumber, password], function(error1, data1){
                    if(error1){
                        console.log('Select Query Error: ', error1);
                        res.status(417).send({
                            'message': 'Database Selection Error'
                        });
                    }
                    else if(data1.length == 1){
                        console.log('User Login');
                        res.status(200).send({
                            'message': 'Login Success',
                            'user_id': data1[0].id
                        });
                        }
                        else{
                        console.log('No User Matched');
                        res.status(412).send({
                            'message': 'Wrong phone number or password'
                        });
                    }
                    conn.release();
                });
            }
        }
    });
});

router.get('/:user_id/disease', function(req, res, next){
    pool.getConnection(function(err, conn){
        if(err){
            console.log('getConnection Error: ', err);
            res.status(500).send({
                'message': 'Get Database Connection Error'
            });
        }
        else{
            var user_id = req.params.user_id;
            let query1 = 'Select * from History where user_id=?';
            conn.query(query1, user_id, function(error1, data1){
                if(error1){
                    console.log('Select Query Error: ', error1);
                    res.status(417).send({
                        'message': 'Database Selection Error'
                    });
                }
                else{
                    res.status(200).send({
                        'message': 'History of user_id: ' + user_id,
                        'history': data1
                    });
                }
            });
        }
    });
});

router.post('/:user_id/disease', function(req, res, next){
    pool.getConnection(function(err, conn){
        if(err){
            console.log('getConnection Error: ', err);
            res.status(500).send({
                'message': 'Get Database Connection Error'
            });
        }
        else{
            var user_id = req.params.user_id;
            let query1 = 'Delete from History where user_id=?';
            conn.query(query1, user_id, function(error1, data1){
                if(error1){
                    console.log('Delete Query Error: ', error1);
                    res.status(417).send({
                        'message': 'Database Deletion Error'
                    });
                }
                else{
                    var cnt = 0;
                    var diseases = req.body.diseases;
                    let query2 = 'Insert into History (user_id, disease, disease_detail) values (?, ?, ?)';
                    for(var i=0; i<diseases.length; i++){
                        conn.query(query2, [user_id, diseases[i].disease, diseases[i].disease_detail], function(error2, data2){
                           if(error2){
                               console.log('Insert Query Error: ', error2);
                               res.status(417).send({
                                   'message': 'Database Deletion Error'
                               });
                           }
                           else{
                               cnt++;
                               if(cnt==diseases.length){
                                   console.log('Insert History Success');
                                   res.status(200).send({
                                       'message': 'Database Insertion Success'
                                   });
                               }
                           }
                        });
                    }
                }
                conn.release();
            });
        }
    });
});

module.exports = router;

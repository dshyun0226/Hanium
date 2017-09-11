const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');


router.get('/:drone_id/:allow_key', function(req, res, next){
    res.render('control', { title: 'Control'});
});

router.post('/:drone_id/:allow_key', function(req, res, next){
    pool.getConnection(function(err, conn){
       if(err){
           console.log('getConnection Error: ', err);
           res.status(500).send({
               'message': 'Get Database Connection Error'
           });
       }
       else{
           var drone_id = req.params.drone_id;
           var user_id = req.body.user_id;
           var allow_key = req.params.allow_key;
           let query1 = 'Select onoff, allow_key from Drone where id=?'
           conn.query(query1, drone_id, function(error1, data1) {
               if(error1){
                   console.log('Select Query Error: ', error1);
                   res.status(417).send({
                       'message': 'Database Selection Error'
                   });
               }
               else{
                   if((data1[0].onfoff == false && user_id == -1 && allow_key == data1[0].allow_key)
                       || (data1[0].onoff == true && allow_key == data1[0].allow_key)){
                       /*
                       Drone Control Code
                        */
                       var arrow = req.body.arrow;
                       console.log('Move Drone #{} ... {}'.format(drone_id, arrow));
                       res.status(200).send({
                           'message': 'Successfully Move Drone'
                       });
                   }
                   else{
                       console.log('Access Drone Control Denied');
                       res.status(412).send({
                           'message': 'Access denied'
                       });
                   }
               }
               conn.release();
           });
       }
    });
});

module.exports = router;

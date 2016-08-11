var express = require('express');
var router = express.Router();
var prepayrequest = require('../models/prepayrequest');

/* GET home page. */
// router.get('/', function(req, res, next) {
// 	res.render('index', { title: 'Express' });
// });

router.get('/', function(req, res, next) {
	res.render('popcorn_index', { title: 'Express' });
});

// router.get('/payorder', function(req, res, next) {
// 	res.render('popcorn_pay', { title: 'Express' });
// });

// router.post('/payorder', function(req, res, next) {
// 	console.log(req.body.favor + "  " + req.body.amount);
// 	res.send("success");
// });

router.get('/menu', function(req, res, next) {
	res.render('menu', { title: 'Express' });
});

router.get('/takeorder', function(req, res, next) {
	res.render('takeorder', { title: 'Express' });
});

router.get('/payfinish', function(req, res, next) {
	res.render('payfinish', { title: 'Express' });
});

router.post('/alipayOrderCreate', function(req, res, next) {
	prepayrequest.prePayCreate(req.body.amount, function(data, err){
		res.send(data);
	});
});

router.post('/alipayOrderQuery', function(req, res, next) {
	prepayrequest.alipayOrderQuery(req.body.id, function(data, err){
		res.send(data);
	});
});

module.exports = router;

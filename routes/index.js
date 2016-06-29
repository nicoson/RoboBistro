var express = require('express');
var router = express.Router();
var prepayrequest = require('../models/prepayrequest');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/menu', function(req, res, next) {
	res.render('menu', { title: 'Express' });
});

router.get('/takeorder', function(req, res, next) {
	res.render('takeorder', { title: 'Express' });
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

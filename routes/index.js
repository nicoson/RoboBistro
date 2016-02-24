var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('homepage', { title: 'Express' });
});

router.get('/menu', function(req, res, next) {
  res.render('menu', { title: 'Express' });
});

router.get('/takeorder', function(req, res, next) {
  res.render('takeorder', { title: 'Express' });
});

module.exports = router;

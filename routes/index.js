var express = require('express');
var mongojs = require('mongojs');
var router = express.Router();

var db = mongojs('local')



/* GET home page. */
router.get('/', function(req, res, next) {


    res.render('index', { title:"as" });
});

module.exports = router;

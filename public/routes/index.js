var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/gallery', function(req, res) {
  // res.render('index', { title: 'Express' });
  res.render('index');
});

module.exports = router;
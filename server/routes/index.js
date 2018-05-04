var express = require('express');
var router = express.Router();
var UserModel = require('../models/user');
var cryptico = require('cryptico');

var BASE_URL = "http://13.127.1.255/"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});
router.get('/plugin', function(req, res, next) {
  res.render('plugin', {});
});

router.get("/new", function(req, res, next){
console.log("getting keys");
   var rsaKey = cryptico.generateRSAKey(Math.random().toString(),1024);
   console.log("rsa gen");
   var rsaPublicKey = cryptico.publicKeyString(rsaKey);
   console.log("rsa pub gen");
   var user = new UserModel.User({
       publicKey : rsaPublicKey,
       privateKey : rsaKey,
       url : BASE_URL + rsaPublicKey.substr(0,8)
   });
   var saveStatus = user.save();
   console.log(saveStatus);
   res.send({pub:rsaPublicKey, priv:rsaKey, url : BASE_URL + rsaPublicKey.substr(0,8)});
});

router.post("/register", function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    var publicKey = req.body.publicKey;
    var url = req.body.url;
    UserModel.User.findOne({publicKey : publicKey}, function(error, user){
	if(error){
	    res.status(500).send({message:error.toString()});
	    return;
	}
	user.username = username;
	user.password = password;
	user.save();
	res.send({message:"done"});
    });
});

router.get("/temp", function(req, res, next){
    UserModel.User.find({username:req.query.username}, function(error, users){
	if(error){
	    res.status(500).send(error);
	    return;
	}
	res.send(users);
    });
});

module.exports = router;

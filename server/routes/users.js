var express = require('express');
var router = express.Router();
var UserModel = require('../models/user');
var cryptico = require('cryptico');
var config = require("../config");
var crypto = require('crypto');
var BASE_URL = config.BASE_URL;

router.get("/keys/new", function(req, res, next){
console.log("getting keys");
   var rsaKey = cryptico.generateRSAKey(Math.random().toString(),1024);
   console.log("rsa gen");
   var rsaPublicKey = cryptico.publicKeyString(rsaKey);
   console.log("rsa pub gen");
   var url = BASE_URL + "dauth/"+crypto.createHash('sha256').update(rsaPublicKey).digest('base64').substr(0,8);
   var user = new UserModel.User({
       publicKey : rsaPublicKey,
       privateKey : JSON.stringify(rsaKey.toJSON()),
       url : url
   });
   var saveStatus = user.save();
   console.log(saveStatus);
   res.send({pub:rsaPublicKey, priv:rsaKey, url : url});
});

router.post("/", function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    var publicKey = req.body.publicKey;
    var url = req.body.url;
	UserModel.User.findOne({publicKey : publicKey}, function(error, user){
	    if(error || !user){
		res.status(500).send({message:"Something went wrong"});
		return;
	    }

	    if(user.username && user.username.length > 0){
		res.status(409).send({message: "User already registered"});
	    }
	    
	    user.username = username;
	    user.password = password;
	    user.save();
	    res.send({message:"done"});
	});
});

router.get("/new",function(req, res, next){
    res.render("newuser",{contractAddress: config.CONTRACT_ADDRESS, abi : config.ABI});
});

router.get("/:username", function(req, res, next){
    UserModel.User.find({username:req.params.username}, function(error, users){
	res.send(users);
    });
});

router.get("/", function(req, res, next){
    UserModel.User.find({username : {$ne : null}}).exec(function(error, users){
	var us = [];
	for(var i =0 ; i< users.length;i++){
	    var user = users[i];
	    user.privateKey = "--not displayed--";
	    user.password = "--not displayed--";
  	    us.push(user);
	}
	res.send({error: error, users:us});
    });
});

module.exports = router;

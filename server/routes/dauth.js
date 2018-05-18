var express = require('express');
var router = express.Router();
var UserModel = require('../models/user');
var cryptico = require('cryptico');
var config = require("../config");
var BASE_URL = config.BASE_URL;
var crypto = require('crypto');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var contract = web3.eth.contract(config.ABI).at(config.CONTRACT_ADDRESS);

router.get("/:id",function(req, res, next){
    var username = req.query.username;
    var id = req.params.id;
    var url = BASE_URL+"dauth/"+id;
    console.log("id");
    UserModel.User.findOne({username:username}, function(error, user){
	console.log(error);
	console.log(user);
	if(error || !user){
	    res.render('dauth',{username:undefined});
	    return;
	}
	console.log(user);
	contract.getDauthUrl(username, function(error, response){
	    console.log(response);
	    console.log(error);
	    if(response == url)
	        res.render('dauth', {username:user.username});
	    else 
	        res.render('dauth',{username:undefined});
	})
    });
});

router.post("/:id", function(req, res, next){
    var username = req.body.username;
    var code = req.body.code;
    var hashcode = req.body.hashcode;
    var cipher = req.body.cipher;
    UserModel.User.findOne({username:username}, function(error, user){
	if(error||!user){
	    res.status(500).send("");
	    console.log(error);
	    return;
	}
	var expectedHashcode = crypto.createHash('sha256').update(code+user.password).digest('hex');
	if(expectedHashcode != hashcode){
	    res.status(403).send("");
	    return;
	}
	var rsaKey = user.privateKey;
        var priv = new cryptico.RSAKey();
	var priv = cryptico.RSAKey.parse(rsaKey);
	var decrypted = cryptico.decrypt(cipher, priv);
	if(decrypted.status == "success"){
	    res.send(decrypted.plaintext);
	    return;
	}
	res.status(403).send("");
    });
});

module.exports = router;

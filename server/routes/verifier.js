var express = require('express');
var router = express.Router();
var UserModel = require('../models/user');
var config = require("../config");
var BASE_URL = config.BASE_URL;
var axios = require('axios');
var crypto = require('crypto');
var cryptico = require('cryptico');

router.get("/", function(req, res, next){
    var username = req.query.username;
    var code = req.query.code;
    var hashcode = req.query.hashcode;
    var urlGetter = BASE_URL + "utils/url?username="+username;
    var addressGetter = BASE_URL + "utils/address?username="+username;
    var keyGetter = BASE_URL + "utils/key?username="+username;
    axios.get(urlGetter).then(function(aUrl){
	axios.get(keyGetter).then(function(aKey){
	    var tokenRaw = crypto.createHash('sha256').update(Math.random().toString()).digest('base64').substr(0,10);
	    var encrypted = cryptico.encrypt(tokenRaw, aKey.data, "").cipher;
	    axios.post(aUrl.data+"?action=verify", {username:username,code:code, hashcode:hashcode, cipher: encrypted}).then(function(decrypted){
		if(decrypted.data == tokenRaw){
		    axios.get(addressGetter).then(function(address){
  		        res.render('login_success',{username : username, address: address.data});
		    }).catch(function(error){
		        res.render('login_fail',{});
		    });
		    return;
		}
		res.render('login_fail',{});
	    }).catch(function(error){
		res.render('login_fail',{});
	    });;
	}).catch(function(error){
		res.render('login_fail',{});
	});
    }).catch(function(error){
		res.render('login_fail',{});
    });

});

module.exports = router;

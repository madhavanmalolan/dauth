var express = require('express');
var router = express.Router();
var UserModel = require('../models/user');
var cryptico = require('cryptico');
var config = require("../config");
var BASE_URL = config.BASE_URL;

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var contract = web3.eth.contract(config.ABI).at(config.CONTRACT_ADDRESS);

router.get("/login",function(req, res, next){
    res.render("login",{contractAddress: config.CONTRACT_ADDRESS, abi : config.ABI});
});

router.get("/url", function(req, res, next){
    var username = req.query.username;
    contract.getDauthUrl(username, function(error, response){
	res.send(response);
    });    
});

router.get("/key", function(req, res, next){
    var username = req.query.username;
    contract.getDauthPublicKey(username, function(error, response){
	res.send(response);
    });    
});

router.get("/address", function(req, res, next){
    var username = req.query.username;
    contract.getAddress(username, function(error, response){
	res.send(response);
    });    
});

module.exports = router;

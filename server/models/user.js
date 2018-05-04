var mongoose = require('mongoose');
var UserSchema = mongoose.Schema({
    username : String, 
    password : String, 
    publicKey : String, 
    privateKey : Object
});

var User = mongoose.model('User', UserSchema);
module.exports.User = User;

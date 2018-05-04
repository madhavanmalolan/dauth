# DAuth
DAuth is a simple decentralized authentication system tied to identities on the Ethereum Blockchain.

## Server side integration

Your server should expose one endpoint on to which the users will send login requests. 
The endpoint must 
- Parse username, code and hashcode from the query parameters
- Get user's DAuth Handler and Public Key from `dauth.co` or any other server of your choice
- Generate a short random token string
- Send a POST request to the DAuth Handler with the following parameters : `code`, `codehash`, `username`, `cipher`. The POST request will respond with the decipherd value using the user's private key.
- Redirect user appropriately, handle successful and failed logins 

### Node.js example
```javascript
var BASE_URL = "https://dauth.co/";
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
  		        //redirect to success page
		    }).catch(function(error){
		        //redirect to login failed page
		    });
		    return;
		}
		//redirect to login failed page
	    });
	}).catch(function(error){
		//redirect to login failed page
	});
    }).catch(function(error){
		//redirect to login failed page
    });

});

```

## Client side integration 
Generate the widget using [this link](https://dauth.co/plugin)

## Architecture

### Components
- __DAuth Server__ : Anybody can clone this repository and setup a DAuth server, one such server has been set up at `http://dauth.co`. The DAuth Server consists of a DAuth Login Page and a DAuth Handler.
- __DAuth Handler__ : The DAuth Handler takes handles the user's private keys on his/her behalf.
- __DAuth Login Page__ : The DAuth Login Page is where the user must enter the password. Once the username and password has been entered, a session code is generated and passed on to the _verifier endpoint_.
- __Verifier Endpoint__ : The verifier endpoint takes the sends a _challenge request_ to the DAuth Handler. The DAuth Handler will be able to pass the challenge only if it holds the user's private keys.

## Flow of control
- A user can register on a DAuth server. This server may be either self hosted (recommended) or hosted by a trusted third party.
- Upon registration, the user must sign a transaction to reserve a username and broadcast the public key on the Ethereum blockchain. The user also broadcasts the DAuth Server location onchain.
- Any service wanting to authenticate a user against the claimed address, may create a _challenge_. A challenge is a random string encrypted with the user's public key available on the Ethereum blockchain. This challenge is sent to the DAuth Handler. The user shall be considered successfully logged in if the DAuth handler passes the challenge. A challenge is passed if the Handler is able to recover the random string which was encrypted as a part of the challenge, by using the user's private key.

## Gotchas
- The private and public key are different from the ones used for the Ethereum Transactions. The Ethers are thus always safe in this process.
- Dauth Handler address is defined as `DAuth_Server_Location?action=verify`
- Dauth Login Page address is defined as `DAuth_Server_Location?action=login`

## Bonus : APIs

### getAddress
`https://dauth.co/utils/address?username=[PUT USERNAME HERE]` : gives the Ethereum address that has been associated with the given username

### getPublicKey
`http://dauth.co/utils/key?username=[PUT USERNAME HERE]` : gives the Public Key that has been associated with the given username

### getDauthUrl
`http://dauth.co/utils/url?username=[PUT USERNAME HERE]` : gives the address of the DAuth Server. DAuth Handler and DAuth Login page urls may be constructed using this address as mentioned above.





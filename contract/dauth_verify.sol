pragma solidity ^0.4.20;
contract Dauth {
    address owner;
    mapping ( address => string ) usernames;
    mapping ( string => address ) reverse_usernames;
    mapping ( string => string ) dauth_urls;
    mapping ( string => string ) public_keys;
    mapping ( string => string ) data;

    event NewUser(address from, string username, bool success);
    event NewVerification(address from, string username, string verificationType, bool success);
    event UserDataUpdate(address from, string username, bool success);
    struct Verification {
	string verifier;
	string verified_value;
    }

    struct ListOfVerifications {
        Verification[] verifications;
    }

    mapping ( string => mapping ( string =>  ListOfVerifications ) ) external_verifications;

    function Dauth() public {
        owner = msg.sender;
    }

    function killDauth() public {
	if(msg.sender == owner){
	    selfdestruct(owner);
	}
    }

    function set(string username, string dauth_url, string public_key) public returns (bool){
	if ( reverse_usernames[username] == 0 ){
	    usernames[msg.sender] = username;
	    reverse_usernames[username] = msg.sender;
	    dauth_urls[username] = dauth_url;
	    public_keys[username] = public_key;
	    NewUser(msg.sender, username, true);
	    return true;
	}
	NewUser(msg.sender, username, false);
	return false;
    }

    function getUsername(address user_address) public view returns (string){
	return usernames[user_address];
    }

    function getAddress(string username) public view returns (address)  {
	return reverse_usernames[username];
    }

    function getDauthUrl(string username) public view returns (string)  {
	return dauth_urls[username];
    }

    function getDauthPublicKey(string username) public view returns (string)  {
        return public_keys[username];
    }

    function getUserVerificationCount(string username, string verification_type) public view returns (uint256) {
	return external_verifications[username][verification_type].verifications.length;
    }

    function getUserVerifierByIndex(string username, string verification_type, uint256 index) public view returns (string)  {
	if(index < getUserVerificationCount(username, verification_type)){
	    return external_verifications[username][verification_type].verifications[index].verifier;
	}
	return "";
    }
    
    function getUserVerifiedValueByIndex(string username, string verification_type, uint256 index) public view returns (string)  {
	if(index < getUserVerificationCount(username, verification_type)){
	    return external_verifications[username][verification_type].verifications[index].verified_value;
	}
	return "";
    }

    function putUserVerification(string username, string verification_type, string verification_value) public returns (bool){
        if( keccak256(getUsername(msg.sender)) != keccak256("") ){
            external_verifications[username][verification_type].verifications.push(Verification({verifier : getUsername(msg.sender), verified_value : verification_value}));
	    NewVerification(msg.sender, username, verification_type, true);
            return true;
	}
	NewVerification(msg.sender, username, verification_type, false);
	return false;
    }

    function putUserVerification(string username, string verification_type, string verification_value, uint256 index) public returns (bool) {
        if( keccak256(getUsername(msg.sender)) != keccak256("")){
            if(keccak256(external_verifications[username][verification_type].verifications[index].verifier) == keccak256(getUsername(msg.sender))){
		external_verifications[username][verification_type].verifications[index].verified_value = verification_value;
	    NewVerification(msg.sender, username, verification_type, true);
		return true;
	    }
	}
	NewVerification(msg.sender, username, verification_type, false);
	return false;
    }

    function setEncryptedData(string encryptedData) public returns (bool){
	if( keccak256(getUsername(msg.sender)) != keccak256("")){
	    data[getUsername(msg.sender)] = encryptedData;
	    UserDataUpdate(msg.sender, getUsername(msg.sender), true);
	    return true;
	}
	UserDataUpdate(msg.sender,getUsername(msg.sender), false);
	return false;
    }

    function getEncryptedData(string username) public view returns (string) {
	return data[username];
    }
}

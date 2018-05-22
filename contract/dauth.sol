pragma solidity ^0.4.20;
contract Dauth {
    address owner;
    mapping ( address => string ) usernames;
    mapping ( string => address ) reverse_usernames;
    mapping ( string => string ) dauth_urls;
    mapping ( string => string ) public_keys;

    event NewUser(address from, string username, bool success);

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
}

pragma solidity ^0.5.0;

contract IPFSInbox
{
    mapping (address => string) ipfsInbox;

    event ipfsSent(string _ipfsHash, address _address);
    event inboxResponse(string response);

    modifier notFull (string memory _text)
    {
        bytes memory stringTest = bytes(_text);
        require (stringTest.length == 0, "String must be of lenght zero");
        _;
    }

    constructor() public {}

    function sendIPFS(address _address, string memory _ipfsHash) notFull(ipfsInbox[_address]) public
    {
        ipfsInbox[_address] = _ipfsHash;
        emit ipfsSent(_ipfsHash, _address);
    }

    function checkInbox() public{
        string memory _ipfsHash = ipfsInbox[msg.sender];
        if(bytes(_ipfsHash).length == 0)
        {
            emit inboxResponse("Inbox is Empty");
        }
        else
        {
            ipfsInbox[msg.sender] = "";
            emit inboxResponse(_ipfsHash);
        }
    }
}
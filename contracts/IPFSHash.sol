pragma solidity ^0.5.0;

contract IPFSHash
{
    string ipfsHash;

    function setHash(string memory hash) public
    {
        ipfsHash = hash;
    }

    function getHash() public view returns (string memory)
    {
        return ipfsHash;
    }
}
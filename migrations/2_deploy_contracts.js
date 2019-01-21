var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var IPFSInbox = artifacts.require("./IPFSInbox.sol");

module.exports = function(deployer) {
    deployer.deploy(SimpleStorage);
    deployer.deploy(IPFSInbox);
};

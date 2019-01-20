const IPFSInbox = artifacts.require("./IPFSInbox.sol");
const truffleAssert = require('truffle-assertions');

contract("IPFSInbox", accounts => {
    it("should emit an event", async () => {
        const ipfsInbox = await IPFSInbox.deployed();

        eventEmitted = false;
        // var event = ipfsInbox.ipfsSent();

        // await event.watch((err, res) => {
        //     eventEmitted = true;
        // })

        //ipfsInbox.events.ipfsSent(function(err, res) { eventEmitted = true; } );

        var result = await ipfsInbox.sendIPFS(accounts[1], "SampleAddress", { from: accounts[0]});

        truffleAssert.eventEmitted(result, 'ipfsSent')

        //assert.equal(eventEmitted, true, "No event emitted");
    });
});
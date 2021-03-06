import React, { Component } from "react";
//import SimpleStorageContract from "./contracts/SimpleStorage.json";
import IPFSInboxContract from "./contracts/IPFSInbox.json";
//https://github.com/trufflesuite/truffle/issues/1614
import truffleContract from "truffle-contract";
import getWeb3 from "./utils/getWeb3";
import ipfs from './ipfs';

import "./App.css";

class App extends Component {
    //state = { storageValue: 0, web3: null, accounts: null, contract: null };

    constructor(props)
    {
        super(props)
        this.state = {
            web3: null,
            accounts: null,
            contract: null,
            ipfsHash: null,
            formIPFS: "",
            formAddress: "",
            receivedIPFS: ""
        };

        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleChangeIPFS = this.handleChangeIPFS.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.handleReceiveIPFS = this.handleReceiveIPFS.bind(this);
    }


    componentDidMount = async () =>
    {
        try
        {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            // const networkId = await web3.eth.net.getId();
            // const deployedNetwork = IPFSInboxContract.networks[networkId];
            // const instance = new web3.eth.Contract(
            //     IPFSInboxContract.abi,
            //     deployedNetwork && deployedNetwork.address,
            //     );

            // Get the contract instance.
            const Contract = truffleContract(IPFSInboxContract);
            Contract.setProvider(web3.currentProvider);
            const instance = await Contract.deployed();

            instance.inboxResponse()
                .on('data', result => {
                    this.setState({receivedIPFS: result.args[0]});
                    console.log('inboxResponse handler');
                    console.log(result.args[0]);
                });

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            this.setState({ web3, accounts, contract: instance });
            //this.setEventListeners();
        }
        catch (error)
        {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
                );
                console.error(error);
        }
    };

    handleChangeAddress(event)
    {
        console.log('handleChangeAddress');
        this.setState({formAddress: event.target.value});
    }

    handleChangeIPFS(event)
    {
        console.log('handleChangeIPFS');
        this.setState({formIPFS: event.target.value});
    }

    handleSend(event)
    {
        console.log('handleSend');
        event.preventDefault();
        const contract = this.state.contract
        const account = this.state.accounts[0]

        document.getElementById('new-notification-form').reset()
        this.setState({showNotification: true});
        contract.sendIPFS(this.state.formAddress, this.state.formIPFS, {from: account})
            .then(result => {
                this.setState({formAddress: ""});
                this.setState({formIPFS: ""});
            })
    }

    handleReceiveIPFS(event)
    {
        console.log('handleReceiveIPFS');
        event.preventDefault();
        const contract = this.state.contract;
        const account = this.state.accounts[0];
        contract.checkInbox({from: account});
    }

    captureFile = (event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)
    };

    convertToBuffer = async(reader) => {
        //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
        //set this buffer -using es6 syntax
        this.setState({buffer});
    };

    onIPFSSubmit = async (event) => {
        event.preventDefault();

        //bring in user's metamask account address
        const accounts = this.state.accounts;

        console.log('Sending from Metamask account: ' + accounts[0]);

        //save document to IPFS,return its hash#, and set hash# to state
        //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add

        await ipfs.add(this.state.buffer, (err, ipfsHash) => {
            console.log(err,ipfsHash);
            //setState by setting ipfsHash to ipfsHash[0].hash
            this.setState({ ipfsHash:ipfsHash[0].hash });

        })
    };

    // runExample = async () => {
    //     // const { accounts, contract } = this.state;

    //     // // Stores a given value, 5 by default.
    //     // await contract.methods.set(5).send({ from: accounts[0] });

    //     // // Get the value from the contract to prove it worked.
    //     // const response = await contract.methods.get().call();

    //     // // Update state with the result.
    //     // this.setState({ storageValue: response });
    // };

    // setEventListeners()
    // {
    //     this.state.contract.inboxResponse()
    //     .on('data', result => {
    //         this.setState({receivedIPFS: result.args[0]})
    //     });
    // }

    render() {
        if (!this.state.web3)
        {
            return <div>Loading Web3, accounts, and contract...</div>;
        }

        return (
            <div className="App">
                <h1>Good to Go!</h1>
                <p>Your Truffle Box is installed and ready.</p>
                <h2>Smart Contract Example</h2>
                <p>
                    If your contracts compiled and migrated successfully, below will show
                    a stored value of 5 (by default).
                </p>
                <p>
                    Try changing the value stored on <strong>line 40</strong> of App.js.
                </p>
                <div>The stored value is: {this.state.storageValue}</div>
                <h2> 1. Add a file to IPFS here </h2>
                <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>
                    <input type = "file" onChange={this.captureFile} />
                    <button type="submit">Send it</button>
                </form>
                <p> The IPFS hash is: {this.state.ipfsHash}</p>
                <h2> 2. Send notifications here </h2>
                <form id="new-notification-form" className="scep-form" onSubmit={this.handleSend}>
                    <label>
                        Receiver Address:
                        <input type="text" value={this.state.value} onChange={this.handleChangeAddress} />
                    </label>
                    <label>
                        IPFS Address:
                        <input type="text" value={this.state.value} onChange={this.handleChangeIPFS} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
                <h2> 3. Receive Notifications </h2>
                <button onClick={this.handleReceiveIPFS}>Receive IPFS</button>
                <p>{this.state.receivedIPFS}</p>
            </div>
        );
    }
}

export default App;

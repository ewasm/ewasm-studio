import React, { Component } from 'react';
import logo from './logo.svg';
import {Web3} from 'web3'
import {binaryen} from 'binaryen'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
 
    this.state = {
      wast: ''
    }

    //alert(binaryen)
    this.handleChange = this.handleChange.bind(this)

    //this.handleChange = this.handleChange.bind(this);
    //this.handleSubmit = this.handleSubmit.bind(this);

    //this.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
    //this.web3 = new Web3(this.web3Provider)
  }
  
  
  handleChange(e) {
    this.setState({
      wast: e.target.value
    })
  }

  onSubmitTx(e) {
    /*
    const txParams = {
      nonce: "0x"+web3.eth.getTransactionCount(web3.eth.accounts[0]),
      gasPrice: "0x174876e8",
      gasLimit: '0x700000',
      to: "",//to,
      value: '0x01',
      data: data,
      chainId: 66
    }

    web3.personal.sendTransaction({from: web3.eth.accounts[0]}).on('receipt', (val) => {
      alert(val)  
    })
    */
    this.state.web3.eth.getAccounts((e, a) => {
      if (e) alert(e)

      if (typeof(a) === 'array') {
        a = a[0]
      }

      function buf2hex(buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
      }

      try {
        let module = window.Binaryen.parseText(this.state.wast)
        let wasm = buf2hex(module.emitBinary())
        console.log(wasm)
      } catch (e) {
        alert(e)
      }

      this.state.web3.eth.sendTransaction({'from': '', 'data': this.state.wast}, (e, tx) => {
        //alert(tx)
      })
    })
  }

  componentWillMount() {
    //var stagesData = this.props.allStagesData;

    window.addEventListener('load', () => {
      this.setState({
        web3: window.web3
      })
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to eWASM</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <div style={{width: "100%"}} >
          <textarea onChange={this.handleChange} style={{display: "block"}} rows="20" cols="80" placeholder="write some code" id="editor"> </textarea>
        </div>
        <button onClick={() => this.onSubmitTx()}>
          click me
        </button>
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import logo from './logo.svg';
import {Web3} from 'web3'
import {binaryen} from 'binaryen'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
 
    this.state = {
      wast: '',
      placeholderText: "Enter transaction data"
    }

    //alert(binaryen)
    this.handleChange = this.handleChange.bind(this)
    this.onSelectChange = this.onSelectChange.bind(this)

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

    this.state.web3.eth.getAccounts((e, a) => {
      if (e) throw(e)

      if (typeof(a) === 'array') {
        a = a[0]
      }

      function buf2hex(buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
      }

      let wasm = ''
      let wast = ""

      try {
        let module = window.Binaryen.parseText(this.state.wast)
        wasm = buf2hex(module.emitBinary())
      } catch (e) {
        alert(e)
        //TODO do something here
      }

      if (this.state.placeholderText == 'enter contract code') {
        //contract creation transaction

        for (let i = 0; i < wasm.length; i += 2) {
          wast += "\\" + wasm.slice(i, i + 2)
        }

        console.log(wast)
        wast = `(module (import "ethereum" "return" (func $return (param i32 i32))) (memory 100) (data (i32.const 0)  "${wast}") (export "memory" (memory 0)) (export "main" (func $main)) (func $main (call $return (i32.const 0) (i32.const ${wasm.length / 2}))))`

        try {
          let module = window.Binaryen.parseText(wast)
          wasm = buf2hex(module.emitBinary())
        } catch (e) {
          alert(e)
          //TODO do something here
        }
      }

      this.state.web3.eth.sendTransaction({'from': '', 'data': wasm}, (e, tx) => {
        if (e) throw(e)
        console.log("tx receiopt: "+tx)
      })
    })
  }

  componentWillMount() {
    window.addEventListener('load', () => {
      this.setState({
        web3: window.web3
      })
    })
  }

  onSelectChange(e) {
    this.setState({
      placeholderText: e.target.selectedOptions[0].value
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
        <select name="Transaction Type" onChange={this.onSelectChange}>
          <option value="enter transaction data">Transaction data</option>
          <option value="enter contract code">Contract code</option>
        </select>
        <div style={{width: "100%"}} >
          <textarea onChange={this.handleChange} style={{display: "block"}} rows="20" cols="80" placeholder={this.state.placeholderText} id="editor"></textarea>
        </div>
        <button onClick={() => this.onSubmitTx()}>
          Submit Tx
        </button>
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import logo from './logo.svg';
import {Web3} from 'web3'
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Icon from '@material-ui/core/Icon'

import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
 
    this.state = {
      wast: '',
      anchorEl: null,
      placeholderText: "Enter transaction data",
      TxType: 'Transaction'
    }

    //alert(binaryen)
    this.handleChange = this.handleChange.bind(this)
    //this.handleClose = this.handleClose.bind(this)
    //this.onSelectChange = this.onSelectChange.bind(this)
    this.setContract = this.setContract.bind(this)
    this.setTx = this.setTx.bind(this)
    this.onTx = this.onTx.bind(this)

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

      if (this.state.TxType == 'Contract') {
        //contract creation transaction

        for (let i = 0; i < wasm.length; i += 2) {
          wast += "\\" + wasm.slice(i, i + 2)
        }

        console.log(wast)
        wast = `(module (import "ethereum" "return" (func $return (param i32 i32))) (memory 100) (data (i32.const 0)  "${wast}") (export "memory" (memory 0)) (export "main" (func $main)) (func $main (call $return (i32.const 0) (i32.const ${wasm.ength / 2}))))`

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
        /*
        this.state.web3.eth.getTransactionReceipt(tx, (e, txn) => {
          if (e) throw(e)
          if (txn) {
            cb(txn)

          }
          }
        })
        */
        let state = this.state
        let onTx = this.onTx

        this.state.web3.eth.filter("latest", function(e, result) {
          state.web3.eth.getTransactionReceipt(tx, (e, txn) => {
            if (e) throw(e)
            if (txn) {
              onTx(tx)
            }
          })
        })
        //console.log("tx receiopt: "+tx)
      })
    })
  }

  onTx(tx) {
    alert(tx.status === "1" ? "transaction succeeded" : "transaction failed")
  }

  componentWillMount() {
    window.addEventListener('load', () => {
      this.setState({
        web3: window.web3
      })
    })
    this.setState({ anchorEl: null });
  }

  onSelectChange(e) {
    this.setState({
      placeholderText: e.target.selectedOptions[0].value
    })
  }

  handleClose = event => {
    this.setState({ anchorEl: null});
  };

  setContract = event => {
    this.setState({
      placeholderText: "Enter contract code",
      TxType: 'Contract'
    })
    this.setState({ anchorEl: null });
  }

  setTx = event => {
    this.setState({
      placeholderText: "Enter transaction data",
      TxType: 'Transaction'
    })
    this.setState({ anchorEl: null });
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  render() {
    const {anchorEl} = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to eWASM</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
				<div>
					<Button
						aria-owns={anchorEl ? 'simple-menu' : null}
						aria-haspopup="true"
						onClick={this.handleClick}
					>
						{this.state.TxType}
						<Icon right>expand_more</Icon>
					</Button>
					<Menu
						id="simple-menu"
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={this.handleClose}
					>
						<MenuItem onClick={this.setTx}>Normal Transaction</MenuItem>
						<MenuItem onClick={this.setContract}>Contract Creation</MenuItem>
					</Menu>
				</div>
        <div style={{width: "100%"}} >
          <textarea onChange={this.handleChange} style={{display: "block"}} rows="20" cols="80" placeholder={this.state.placeholderText} id="editor"></textarea>
        </div>
        <Button variant="contained" color="primary" onClick={() => this.onSubmitTx()}>
          Submit Tx
        </Button>
      </div>
    );
  }
}

export default App;

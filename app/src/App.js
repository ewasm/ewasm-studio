import React, { Component } from 'react';
import logo from './logo.svg';
import {Web3} from 'web3'
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Icon from '@material-ui/core/Icon'
import {PulseLoader} from 'react-spinners';
import TxModal from './components/TxModal';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
 
    this.state = {
      wast: '',
      anchorEl: null,
      placeholderText: "Transaction Data (WAST)",
      TxType: 'Transaction',
      txModalOpen: false,
      txStatusText: "Submit Transaction",
      loading: false
    }

    //alert(binaryen)
    this.handleChange = this.handleChange.bind(this)
    //this.handleClose = this.handleClose.bind(this)
    //this.onSelectChange = this.onSelectChange.bind(this)
    this.setContract = this.setContract.bind(this)
    this.setTx = this.setTx.bind(this)
    this.onTx = this.onTx.bind(this)
    this.handleTxModalClose = this.handleTxModalClose.bind(this)
    this.onAddressChange = this.onAddressChange.bind(this)
    this.onValueUpdated = this.onValueUpdated.bind(this)

    //this.handleChange = this.handleChange.bind(this);
    //this.handleSubmit = this.handleSubmit.bind(this);

    //this.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
    //this.web3 = new Web3(this.web3Provider)
  }
  
  onAddressChange(e) {
    this.setState({
      to: e.target.value
    })
  }

  handleChange(e) {
    this.setState({
      wast: e.target.value
    })
  }

  handleTxModalClose() {
    this.setState({txModalOpen: false})
  }

  onSubmitTx(e) {
    function buf2hex(buffer) { // buffer is an ArrayBuffer
      return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    this.setState({
      txStatusText: "Transaction Pending"
    })

    let wasm = ''
    let wast = ""

    if (this.state.wast.length > 0 && !this.state.to) {
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
        wast = `(module (import "ethereum" "return" (func $return (param i32 i32))) (memory 100) (data (i32.const 0)  "${wast}") (export "memory" (memory 0)) (export "main" (func $main)) (func $main (call $return (i32.const 0) (i32.const ${wasm.length / 2}))))`

        try {
          let module = window.Binaryen.parseText(wast)
          wasm = buf2hex(module.emitBinary())
        } catch (e) {
          alert(e)
          //TODO do something here
        }
      }
    } else {
      wasm = this.state.wast
    }

    this.setState({loading: true})

    let txn = {}

    if (wasm.length > 0)
      txn.data = wasm

    if (this.state.to)
      txn.to = this.state.to

    if (this.state.value) {
      let value = parseInt(this.state.value)
      if (!value) {
        alert("must input number as value")
        throw("foobar")
      }
    }

    this.state.web3.eth.sendTransaction(txn, (e, tx) => {
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
      let onTx = this.onTx.bind(this)
      let onTxDone = false
      let blockCount = 0


      //let filter = this.state.web3.eth.filter("latest")
      
      // bind the filter to the watch function's `this` so that I can call `filter.stopWatching` within
      
      let latestBlockNum = null

      let interval = window.setInterval(() => {
        state.web3.eth.getBlock("latest", (e, block) => {
          if(e) throw(e)  //TODO make this not get swallowed

          if (latestBlockNum) {
            if (block.number <= latestBlockNum) {
              return
            }
          }
          latestBlockNum = block.number

          for (let i = 0; i < block.transactions.length; i++) {
            if (tx == block.transactions[i]) {
              state.web3.eth.getTransactionReceipt(tx, (e, txn) => {
                if (e) throw(e) //TODO make this not get swallowed

                if (txn) {
                  // filter.stopWatching()
                  // TODO add this ^ back in after figuring out why it doesn't work with cpp-ethereum

                  clearInterval(interval)
                  this.setState({txStatusText: "Submit Transaction"})
                  onTx(txn)
                }
              })
              break
            }
          }

          blockCount++
          if (blockCount > 10) {
            alert("transaction was not included in the last 10 blocks... assuming dropped")
            clearInterval(interval)
          }
        })
      }, 100)
    })
  }

  onTx(tx) {
    //alert(tx.status === "1" ? "transaction succeeded" : "transaction failed")
    this.setState({txModalOpen: true, loading: false, txData: tx})
  }

  onValueUpdated(e) {
    this.setState({
      value: e.target.value
    })
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
      placeholderText: "Contract Code (WAST)",
      TxType: 'Contract'
    })
    this.setState({ anchorEl: null });
  }

  setTx = event => {
    this.setState({
      placeholderText: "Transaction Data",
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
          <h1 className="App-title">Welcome to the EWASM testnet</h1>
        </header>
        <div style={{display: "flex", "flex-direction": "column", margin: "auto", width: "600px"}} >
          <h2 style={{"text-align": "left"}}> Transaction Type </h2>
          <div>
            <Button
              aria-owns={anchorEl ? 'simple-menu' : null}
              aria-haspopup="true"
              onClick={this.handleClick}
              style={{"float": "left"}}
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
          <h2 style={{"text-align": "left"}}> Destination Address</h2>
          <textarea onChange={this.onAddressChange} disabled={this.state.TxType === "Contract"} rows="1" cols="80"></textarea>
          <h2 style={{"text-align": "left"}}> Value (Wei) </h2>
          <textarea onChange={this.onValueUpdated} rows="1" cols="80" ></textarea>
          <h2 style={{"text-align": "left"}}> {this.state.placeholderText} </h2>
          <textarea onChange={this.handleChange} style={{display: "block", "float": "left"}} rows="20" cols="80" id="editor"></textarea>
          <div style={{display: "flex", "flex-direction": "row", "margin-top": "1em"}}>
            <Button disabled={this.state.loading} variant="contained" color="primary" onClick={() => this.onSubmitTx()}>
              {this.state.txStatusText}
            </Button>
            <div style={{"padding-top": "5px", "padding-left": "20px"}}>
              <PulseLoader color={'#123abc'} loading={this.state.loading} />
            </div>
          </div>
        </div>


        <TxModal open={this.state.txModalOpen} onClose={this.handleTxModalClose} tx={this.state.txData}></TxModal>
      </div>
    );
  }
}

export default App;

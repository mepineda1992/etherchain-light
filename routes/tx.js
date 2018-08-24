var express = require('express');
var router = express.Router();

var async = require('async');
var Web3 = require('web3');
var abi = require('ethereumjs-abi');
var abiDecoder = require('abi-decoder');

var typeInput = [
      { name: 'Hex', type: 'hex' },
      { name: 'Number', type: 'int256' },
      { name: 'Text', type: 'string' },
      { name: 'Address', type: 'address' },
      { name: 'Bolean', type: 'bool' }];

router.get('/pending', function(req, res, next) {

  var config = req.app.get('config');
  var web3 = new Web3();
  web3.setProvider(config.provider);

  async.waterfall([
    function(callback) {
      web3.eth.subscribe('pendingTransactions', function(error, result){
          if (!error)
              console.log('da', result);
      })
    }
  ], function(err, txs) {
    if (err) {
      return next(err);
    }

    res.render('tx_pending', { txs: txs });
  });
});


router.get('/submit', function(req, res, next) {
  res.render('tx_submit', { });
});

router.post('/submit', function(req, res, next) {
  if (!req.body.txHex) {
    return res.render('tx_submit', { message: "No transaction data specified"});
  }

  var config = req.app.get('config');
  var web3 = new Web3();
  web3.setProvider(config.provider);

  async.waterfall([
    function(callback) {
      web3.eth.sendRawTransaction(req.body.txHex, function(err, result) {
        callback(err, result);
      });
    }
  ], function(err, hash) {
    if (err) {
      res.render('tx_submit', { message: "Error submitting transaction: " + err });
    } else {
      res.render('tx_submit', { message: "Transaction submitted. Hash: " + hash });
    }
  });
});

router.get('/:tx', function(req, res, next) {

  var config = req.app.get('config');
  var web3 = new Web3();
  web3.setProvider(config.provider);

  var db = req.app.get('db');

  async.waterfall([
    function(callback) {
      web3.eth.getTransaction(req.params.tx, function(err, result) {
        callback(err, result);
      });
    }, function(result, callback) {

      if (!result || !result.hash) {
        return callback({ message: "Transaction hash not found" }, null);
      }
      web3.eth.getTransactionReceipt(result.hash, function(err, receipt) {
        callback(err, result, receipt);
      });
    }, function(tx, receipt, callback) {
        callback(null, tx, receipt, null);
        //web3.trace.transaction(tx.hash, function(err, traces) {
        //  callback(err, tx, receipt, traces);
        //});
    }, function(tx, receipt, traces, callback) {
      db.get(tx.to, function(err, value) {
        callback(null, tx, receipt, traces, value);
      });
    }
  ], function(err, tx, receipt, traces, source) {
    if (err) {
      return next(err);
    }

    // Try to match the tx to a solidity function call if the contract source is available
    if (receipt.logs) {
        tx.logs = receipt.logs.map(event => {
          if (event.topics.length > 0) {
            topic = event.topics[0];

          } else {
            topic = 'no topic'
          }

          const LENGHT_VARS = 64;
          let bodyData = event.data.slice(2, event.data.length);

          let args = [];
          let tail = bodyData;

          while (tail.length > 0) {
            const head = tail.slice(0, LENGHT_VARS);
            tail = tail.slice(LENGHT_VARS, tail.length);
            args.push(head);
          }

          const largs = args.map((a) => {
            const out = {'hex': a};

            ['int256', 'bytes', 'address', 'bool'].forEach((type)=>{
              console.log('DEBUG PV ', type, a.arg);

              try {
                //out[type] = web3.eth.abi.decodeParameter(type, a);
                const data = Buffer.from([ a ].join(''), 'hex');
                out[type] = abi.rawDecode([type], data)
                console.log('outs', out[type].bufferToInt)
              } catch (e) {
                console.log("Error parsing ABI:", type, a);
                out[type] = '';
              }

            });

            return out;
          });

          return {topic: topic, args: largs};
        });

        console.log('tx.logs', JSON.stringify(tx.logs));

    }
    tx.traces = [];
    tx.failed = false;
    tx.gasUsed = 0;
    if (traces != null) {
    traces.forEach(function(trace) {
        tx.traces.push(trace);
        if (trace.error) {
          tx.failed = true;
          tx.error = trace.error;
        }
        if (trace.result && trace.result.gasUsed) {
          tx.gasUsed += parseInt(trace.result.gasUsed, 16);
        }
      });
    }
    // console.log(tx.traces);
    res.render('tx', { tx: tx });
  });

});

router.get('/raw/:tx', function(req, res, next) {

  var config = req.app.get('config');
  var web3 = new Web3();
  web3.setProvider(config.provider);

  async.waterfall([
    function(callback) {
      web3.eth.getTransaction(req.params.tx, function(err, result) {
        callback(err, result);
      });
    }, function(result, callback) {
      web3.trace.replayTransaction(result.hash, ["trace", "stateDiff", "vmTrace"], function(err, traces) {
        callback(err, result, traces);
      });
    }
  ], function(err, tx, traces) {
    if (err) {
      return next(err);
    }

    tx.traces = traces;

    res.render('tx_raw', { tx: tx });
  });
});

module.exports = router;

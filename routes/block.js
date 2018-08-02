var express = require('express');
var router = express.Router();

var async = require('async');
var Web3 = require('web3');

router.get('/:block', function(req, res, next) {

  var config = req.app.get('config');
  var web3 = new Web3();
  web3.setProvider(config.provider);

/*
  web3.extend({
    property: 'debug',
    methods: [
      new web3.extend.methods({
         name: 'traceBlockByNumber',
         call: 'debug_traceBlockByNumber',
         params: 1,
      })
    ]
  });
*/

  async.waterfall([
    function(callback) {
      web3.eth.getBlock(req.params.block, true, function(err, result) {
        callback(err, result);
      });
    }
  ], function(err, block, traces) {
    if (err) {
      return next(err);
    }

    if(block) {
      block.transactions.forEach(function(tx) {
        tx.traces = [];
        tx.failed = false;
        if (traces != null) {
          traces.forEach(function(trace) {
            if (tx.hash === trace.transactionHash) {
              tx.traces.push(trace);
              if (trace.error) {
                tx.failed = true;
                tx.error = trace.error;
              }
            }
          });
        }
      });
    }
    res.render('block', { block: block });
  });

});

router.get('/uncle/:hash/:number', function(req, res, next) {

  var config = req.app.get('config');
  var web3 = new Web3();
  web3.setProvider(config.provider);

  async.waterfall([
    function(callback) {
      web3.eth.getUncle(req.params.hash, req.params.number, true, function(err, result) {
        callback(err, result);
      });
    }, function(result, callback) {
      if (!result) {
        return next({name : "UncleNotFoundError", message : "Uncle not found!"});
      }

      callback(null, result);
    }
  ], function(err, uncle) {
    if (err) {
      return next(err);
    }

    console.log(uncle);

    res.render('uncle', { uncle: uncle, blockHash: req.params.hash });
  });

});

module.exports = router;

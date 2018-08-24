var express = require('express');
var router = express.Router();

var async = require('async');
var Web3 = require('web3');


router.get('/', function(req, res, next) {

  var db = req.app.get('db');
  var dbEvent = req.app.get('dbEvent');

  var config = req.app.get('config');
  var web3 = new Web3();
  web3.setProvider(config.provider);

  async.waterfall([
    function(callback) {
      web3.eth.getBlock("latest", false, function(err, result) {
        callback(err, result);
      });
    }, function(lastBlock, callback) {
      var blocks = [];

      var blockCount = 10;

      if (lastBlock.number - blockCount < 0) {
        blockCount = lastBlock.number + 1;
      }

      async.times(blockCount, function(n, next) {
        web3.eth.getBlock(lastBlock.number - n, true, function(err, block) {
          next(err, block);
        });
      }, function(err, blocks) {
        callback(err, blocks);
      });
    }
  ], function(err, blocks) {
    if (err) {
      return next(err);
    }

    var txs = [];
    blocks.forEach(function(block) {
      block.transactions.forEach(function(tx) {
        if (txs.length === 10) {
          return;
        }
        txs.push(tx);
      });
    });

    dbEvent.find({}).sort({ timestamp: -1 }).limit(10).exec(function (err, events) {
      //res.render('index', { events: events });
      res.render('index', { blocks: blocks, txs: txs, events: events });
    });
  });

});

module.exports = router;

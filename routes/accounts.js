var express = require('express');
var router = express.Router();

var async = require('async');
var Web3 = require('web3');

router.get('/:offset?', function(req, res, next) {
  var config = req.app.get('config');
  var web3 = new Web3();
  web3.setProvider(config.provider);

  async.waterfall([
    function(callback) {
      web3.eth.getAccounts( function(err, result) {
        callback(err, result);
      });
    }, function(accounts, callback) {

      var data = {};

      if (!accounts) {
        return callback({name:"FatDBDisabled", message: "Parity FatDB system is not enabled. Please restart Parity with the --fat-db=on parameter."});
      }

      if (accounts.length === 0) {
        return callback({name:"NoAccountsFound", message: "Chain contains no accounts."});
      }

      var lastAccount = accounts[accounts.length - 1];

      async.eachSeries(accounts, function(account, eachCallback) {
        web3.eth.getCode(account, function(err, code) {
          if (err) {
            return eachCallback(err);
          }
          data[account] = {};
          data[account].address = account;
          data[account].type = code.length > 2 ? "Contract" : "Account";

          web3.eth.getBalance(account, function(err, balance) {
            if (err) {
              return eachCallback(err);
            }
            data[account].balance = balance;
            eachCallback();
          });
        });
      }, function(err) {
        callback(err, data, lastAccount);
      });
    }
  ], function(err, accounts, lastAccount) {
    if (err) {
      return next(err);
    }

    var dbEvent = req.app.get('dbEvent');

    if (!req.params.offset) {
      req.params.offset = 0;
    } else {
      req.params.offset = parseInt(req.params.offset);
    }

    dbEvent.find({ balance: { $exists: true } }).sort({ _id: 1 }).skip(req.params.offset).limit(50).exec(function(err, accounts) {
      res.render('accounts', {accounts: accounts, lastAccount: lastAccount, accounts: accounts, offset: req.params.offset, stepSize: 50 });
    });

  });
});

module.exports = router;

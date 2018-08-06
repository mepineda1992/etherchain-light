var express = require('express');
var router = express.Router();
var basepath = process.env.ETHERCHAIN_LIGHT_BASEPATH || '/explorer';

router.post('/', function(req, res, next) {
	var searchString = req.body.search.trim().toLowerCase();

  if (searchString.length > 22 && searchString.substr(0,2) != '0x')
    searchString = '0x' + searchString;

	if (searchString.length === 2) {
		return next({ message: "Error: Invalid search string!" });
	} else if (searchString.length < 22) {
		// Most likely a block number, forward to block id handler
		res.redirect(basepath + '/block/' + searchString);
	} else if (searchString.length == 66) {
		res.redirect(basepath +'/tx/' + searchString);
	} else if (searchString.length == 42) {
		res.redirect(basepath + '/account/' + searchString);
	} else {
    return next({ message: "Error: Invalid search string!" });
  }
});

module.exports = router;

var web3 = require('web3');
var net = require('net');

var config = function () {

  this.logFormat = "combined";

  // this.ipcPath = process.env["HOME"] + "/.local/share/io.parity.ethereum/jsonrpc.ipc";

  // this.provider = new web3.providers.IpcProvider(this.ipcPath, net);
 var p = process.env["PROVIDER"] || "http://localhost:8546"

 console.log('DEBUG provider:', p);
 this.provider =  new web3.providers.HttpProvider(p);
 this.bootstrapUrl = "https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/yeti/bootstrap.min.css";

  this.names = {
    "0x007733a1fe69cf3f2cf989f81c7b4cac1693387a": "POA-Digix",
    "0x00e4a10650e5a6d6001c38ff8e64f97016a1645c": "POA-Aurel",
    "0x00e6d2b931f55a3f1701c7389d592a7778897879": "POA-Maker",
    "0x0010f94b296a852aaac52ea6c5ac72e03afd032d": "POA-Paritytech",
    "0x0020ee4be0e2027d76603cb751ee069519ba81a1": "POA-Melonport",
    "0x4ed9b08e6354c70fe6f8cb0411b0d3246b424d6c": "POA-OneBit",
    "0x00d6cc1ba9cf89bd2e58009741f4f7325badc0ed": "POA-Etherscan",
    "0x00a0a24b9f0e5ec7aa4c7389b8302fd0123194de": "POA-GridS",
    "0x00427feae2419c15b89d1c21af10d1b6650a4d3d": "POA-Attores"
  }

  this.erc20ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"totalSupply","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];

  this.tokenShortName = "Lotos";
  this.tokenAddress = process.env["LOTO_CONTRACT_ADDRESS"] || "0x20bc7fa7f6f4a8cc67ccf672581e162f97b1ce60";
  this.tokenDecimals = 1;
  this.tokenName = "LotoToken";
  this.tokenDescription = "LotoToken";
  this.tokenTotalSupply = -1;

  this.exportStartBlock = "0"; // Start block for the historic export (set to 0 for a full export)

}

module.exports = config;

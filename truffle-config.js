require('babel-register');
require('babel-polyfill');

var HDWalletProvider = require("@truffle/hdwallet-provider");

var infura_apikey = "c1ea94323efa4aa2a72280264439bc7d";
var mnemonic = "hospital blade hockey card eye field say cereal matter craft grape episode";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
	    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+infura_apikey),
      network_id: 3
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}

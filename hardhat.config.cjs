require("@nomicfoundation/hardhat-toolbox");
require('hardhat-abi-exporter');


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "localhost",
  abiExporter: {
    path: './abis',
    clear: true,
    flat: true,
  },
  networks: {
    localhost: {
      url: `http://127.0.0.1:8545/`
    },
  },
};

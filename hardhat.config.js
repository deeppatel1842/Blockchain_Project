require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { SCROLL_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20" },
      { version: "0.8.28" }, // add this!
    ],
  },
  networks: {
    scrollTestnet: {
      url: SCROLL_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};

// Truffle configuration for Assignment 3 (MG3012)
// Connects Truffle to a local Ganache blockchain.

module.exports = {
  networks: {
    // Ganache desktop app (Quickstart) listens on http://127.0.0.1:7545
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // match any network id
    },

    // Optional: Ganache command-line version listens on port 8545.
    // Run with:  truffle migrate --network ganacheCLI
    ganacheCLI: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
  },

  compilers: {
    solc: {
      // Solidity compiler version (matches "pragma solidity ^0.8.20").
      // Truffle downloads it the first time you run "truffle compile",
      // so you need an internet connection for that first compile.
      version: "0.8.20",
      settings: {
        optimizer: { enabled: true, runs: 200 },
        evmVersion: "london", // works on every Ganache version
      },
    },
  },
};

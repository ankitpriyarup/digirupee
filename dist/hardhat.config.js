"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
const OWNER_PRIVATE_KEY = "86e86fc0df9904e3d2561bf44c079475d7b27ce18e6885cfda5a0bacd06c0833";
const AUTHORITY_PRIVATE_KEY = "1b85dda22f84f7e1f48bd125d345bc47b79be0c64465ecca03efa748afc956a5";
const config = {
    solidity: "0.8.24",
    networks: {
        testnet: {
            url: "http://localhost:8545",
            chainId: 123454321,
            accounts: [OWNER_PRIVATE_KEY, AUTHORITY_PRIVATE_KEY],
        }
    }
};
exports.default = config;

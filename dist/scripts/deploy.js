"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
var ACCOUNTS;
(function (ACCOUNTS) {
    ACCOUNTS[ACCOUNTS["OWNER"] = 0] = "OWNER";
    ACCOUNTS[ACCOUNTS["AUTHORITY"] = 1] = "AUTHORITY";
})(ACCOUNTS || (ACCOUNTS = {}));
;
async function main() {
    const signers = await hardhat_1.ethers.getSigners();
    const owner = signers[ACCOUNTS.OWNER];
    const authority = signers[ACCOUNTS.AUTHORITY];
    const contractFactory = await hardhat_1.ethers.getContractFactory("DigitalRupee");
    const contract = await contractFactory.deploy(authority.address, owner.address);
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    console.log(address);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

import { ethers } from "hardhat";

enum ACCOUNTS {
  OWNER=0,
  AUTHORITY=1,
};

async function main() {
  const signers = await ethers.getSigners();
  const owner = signers[ACCOUNTS.OWNER];
  const authority = signers[ACCOUNTS.AUTHORITY];
  const contractFactory = await ethers.getContractFactory("DigitalRupee");
  const contract = await contractFactory.deploy(authority.address, owner.address);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
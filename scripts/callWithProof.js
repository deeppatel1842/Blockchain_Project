const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [user] = await ethers.getSigners();
  const sbt = await ethers.getContractAt("ReputationSBT", "0xbea7451933d2e42c6b565769d1aF0C18346BdF1e");

  const proof = JSON.parse(fs.readFileSync("zk/proof/proof.json"));
  const pub = JSON.parse(fs.readFileSync("zk/proof/public.json"));

  console.log("🔐 Submitting ZK Proof...");

  const tx = await sbt.connect(user).claimWithProof(proof.a, proof.b, proof.c, pub);
  const receipt = await tx.wait();

  console.log(`⛽ Gas used for claimWithProof(): ${receipt.gasUsed}`);
}

main().catch(console.error);

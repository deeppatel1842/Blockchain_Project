const hre = require("hardhat");
const readline = require("readline-sync");
const fs = require("fs");

const proof = {
  a: [
    "0x069defb5afd650fd570cac8d1f393a1852cbeea976d92831ed4aed77e8acc457",
    "0x11d14589febf58db35a22fb38900ba7175cb7a984bda4308f07447aab1eb9ab9"
  ],
  b: [
    [
      "0x18295bd5c24822f5174618dd8f88de07e2103502f1d5d5226ca7e94f229c30ef",
      "0x046cc4a7ed250f317dea7a5f9e9ad3b06dac90a33641001b29034ae1cac5ed27"
    ],
    [
      "0x1b42dec25037f13496521de5682bc9f9f1580a105a14ed0b16b916fbf7856ae0",
      "0x2414cd50bc4ca4b509e9744a585c578d55de0e4ac9dbb96e77035c5474c8e081"
    ]
  ],
  c: [
    "0x1ad9ec34d0791e1568628b1fc7da1746f5aeb786e076adbaad6c945d346a7e4f",
    "0x0de7bcbb4a2970eac6616787557001e7803148e3f12c52366eded7de2fd456ee"
  ],
  input: [
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  ]
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const recipient = readline.question("Enter recipient address: ");

  // Deploy Verifier
  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  console.log("✅ Groth16Verifier deployed at:", await verifier.getAddress());

  // Deploy AttestationSystem
  const Att = await hre.ethers.getContractFactory("AttestationSystem");
  const attestation = await Att.deploy();
  await attestation.waitForDeployment();
  console.log("✅ AttestationSystem deployed at:", await attestation.getAddress());

  // Deploy ReputationSBT
  const SBT = await hre.ethers.getContractFactory("ReputationSBT");
  const sbt = await SBT.deploy(deployer.address, await attestation.getAddress(), await verifier.getAddress());
  await sbt.waitForDeployment();
  console.log("✅ ReputationSBT deployed at:", await sbt.getAddress());

  console.log("\n========== 📝 ATTTESTATION ==========");

  const balanceBefore = await hre.ethers.provider.getBalance(recipient);
  console.log("💰 Recipient balance before:", hre.ethers.formatEther(balanceBefore), "ETH");

  const attTx = await attestation.attest(recipient, 60, "Legend contributor!", {
    value: hre.ethers.parseEther("0.001"),
  });
  const attReceipt = await attTx.wait();
  console.log(`📬 Attestation Successful!`);
  console.log(`⛽ Gas Used: ${attReceipt.gasUsed}`);
  console.log(`🔗 Tx Hash: ${attReceipt.hash}`);
  console.log(`🌍 Explorer Link: https://sepolia.scrollscan.com/tx/${attReceipt.hash}`);

  const balanceAfter = await hre.ethers.provider.getBalance(recipient);
  console.log("💰 Recipient balance after:", hre.ethers.formatEther(balanceAfter), "ETH");

  fs.appendFileSync("gas-logs.txt", `Attestation Gas: ${attReceipt.gasUsed}\n`);

  console.log("\n========== 🔐 CLAIM SBT WITH ZKP ==========");

  console.log("Verifying ZK Proof...");
  const isValid = await verifier.verifyProof(proof.a, proof.b, proof.c, proof.input);
  console.log("✅ ZK Proof valid?", isValid);

  if (isValid) {
    console.log("🏅 Claiming Soulbound Token...");
    const claimTx = await sbt.claimWithProof(proof.a, proof.b, proof.c, proof.input);
    const claimReceipt = await claimTx.wait();
    console.log(`✅ SBT Claimed Successfully!`);
    console.log(`⛽ Gas Used: ${claimReceipt.gasUsed}`);
    console.log(`🔗 Tx Hash: ${claimReceipt.hash}`);
    console.log(`🌍 Explorer Link: https://sepolia.scrollscan.com/tx/${claimReceipt.hash}`);

    fs.appendFileSync("gas-logs.txt", `claimWithProof Gas: ${claimReceipt.gasUsed}\n`);
  } else {
    console.log("❌ Invalid ZKP — Cannot Claim SBT.");
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});

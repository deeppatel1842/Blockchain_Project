const hre = require("hardhat");
const readline = require("readline-sync");
const fs = require("fs");

// snarkjs-calldata proof
const proof = {
  a: [
    "0x2283881dcbf9a278b2e6a84f8eff0541a34c3c114683c603c28d36b38c287f8d",
    "0x209c750dbaedc96c1565b3d998c1bace1f3290f67f06867a454a0a6b00661e2e"
  ],
  b: [
    [
      "0x1b2d20db08391e4aa918d54ef96e6e52efafeed60dd66a240080d0edfabecc50",
      "0x07fca4388c1ddaf21aa84a53dd4867960773a3cfdab74426dbccc3efed66fc2d"
    ],
    [
      "0x0c6f4fbb1e4c4a175ebf52d491b0b47de560df75466541406d51425fd9c82458",
      "0x0440940a8f4afa380b18ca47510b7f5a2802e545606bec2507c24262ad6d3856"
    ]
  ],
  c: [
    "0x08ac4269614e9a33fa29092b1d2089c52997ae19e4fcd0ce5e4233b077ecc00a",
    "0x304766037bd577f50b15be76a5ab6d90dcd8be9019dd8611bafa6c42057e8534"
  ],
  input: [
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  ]
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const recipient = readline.question("Enter recipient address: ");

  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ Groth16Verifier deployed at:", verifierAddress);

  const Att = await hre.ethers.getContractFactory("AttestationSystem");
  const attestation = await Att.deploy();
  await attestation.waitForDeployment();
  const attAddress = await attestation.getAddress();
  console.log("✅ AttestationSystem deployed at:", attAddress);

  const SBT = await hre.ethers.getContractFactory("ReputationSBT");
  const sbt = await SBT.deploy(deployer.address, attAddress);
  await sbt.waitForDeployment();
  const sbtAddress = await sbt.getAddress();
  console.log("✅ ReputationSBT deployed at:", sbtAddress);

  const balanceBefore = await hre.ethers.provider.getBalance(recipient);
  console.log("💰 Recipient balance before:", hre.ethers.formatEther(balanceBefore));

  const attTx = await attestation.attest(recipient, 60, "Legend contributor!", {
    value: hre.ethers.parseEther("0.001"),
  });
  const attReceipt = await attTx.wait();
  console.log(`📬 Attestation successful. Gas used: ${attReceipt.gasUsed}`);

  const balanceAfter = await hre.ethers.provider.getBalance(recipient);
  console.log("💰 Recipient balance after:", hre.ethers.formatEther(balanceAfter));

  // Log attestation gas
  fs.appendFileSync("gas-logs.txt", `Attestation Gas: ${attReceipt.gasUsed}\n`);

  console.log("🔐 Verifying ZK Proof...");
  const isValid = await verifier.verifyProof(proof.a, proof.b, proof.c, proof.input);
  console.log("✅ ZK Proof valid?", isValid);

  if (isValid) {
    const claimTx = await sbt.claimSBT();
    const claimReceipt = await claimTx.wait();
    console.log("🏅 SBT successfully claimed by deployer (based on ZK Proof)!");
    console.log(`⛽ Gas used for claimSBT(): ${claimReceipt.gasUsed}`);

    // Log claim gas
    fs.appendFileSync("gas-logs.txt", `claimSBT Gas: ${claimReceipt.gasUsed}\n`);
  } else {
    console.log("❌ ZKP failed — cannot claim SBT.");
  }
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exitCode = 1;
});

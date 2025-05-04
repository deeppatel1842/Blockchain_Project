# 🛡️ DAO Reputation System with ZKP Integration

---

## 📋 Project Overview

This project implements a **fully on-chain, privacy-preserving DAO reputation system** using Scroll Testnet, Circom, Groth16 zk-SNARKs, and Hardhat.

✅ Contributors earn **reputation points** through attestations with optional **ETH tipping**.  
✅ Users can **mint Soulbound Tokens (SBTs)** based on their reputation.  
✅ Minting uses **Zero-Knowledge Proofs** (ZKP) so contributors **do not reveal** their actual score.  
✅ Deployed on **Scroll L2** for **gas optimization** and real blockchain immutability.

Built using:
- Hardhat
- Solidity (0.8.20)
- Circom + snarkjs
- Scroll Testnet

---

## 📦 Smart Contracts

| Contract                | Purpose                                         |
|--------------------------|-------------------------------------------------|
| `AttestationSystem.sol`  | Manage reputation points and optional tipping   |
| `ReputationSBT.sol`      | Mint non-transferable Soulbound Tokens (SBTs)   |
| `Groth16Verifier.sol`    | Verify zk-SNARK proofs (Groth16) on-chain        |

---

## 🚀 Deployment (Scroll Testnet)

| Contract               | Address                                          |
|-------------------------|--------------------------------------------------|
| Groth16Verifier         | `0x16493E41A88Fe7cF537352fC34A2b48CfDf2e315`     |
| AttestationSystem       | `0x39B1C9160E5cE8c0067D59a233C92545c4D43429`     |
| ReputationSBT           | `0xDF1a442FFDa3ba32Ad3C9d494D98a444BFaBacdC`     |

✅ Fully deployed on Scroll Sepolia Testnet.

---

## 🔐 ZKP Circuit Details

- Circom circuit: Validate `rep >= 50`
- Compiled with Circom 2.0.0
- Proof System: Groth16 zk-SNARKs
- Proof artifacts: `proof.json` and `public.json`
- Smart contract: `Groth16Verifier.sol` auto-generated

✅ Off-chain proof generation, on-chain proof verification!

---

## ⚙️ Gas Usage Benchmarks

| Function           | Gas Used  |
|--------------------|-----------|
| `attest()`          | 149,442   |
| `claimWithProof()`  | 326,792   |
| Coordinape         | 0         |
| SourceCred         | 0         |

✅ Tracked in `gas-logs.txt` and visualized below:

> Coordinape and SourceCred are off-chain systems.
> Gas Usage Comparison: Attestation vs On-chain ZKP Verification (claimWithProof)

![image](https://github.com/user-attachments/assets/0dfbdca7-ba7f-4101-abd2-557f6146b543)



---

## 🧱 Project Components

| File | Purpose |
|------|---------|
| `circuits/reputation.circom` | ZKP circuit for reputation threshold |
| `contracts/Verifier.sol` | Solidity verifier (Groth16 zk-SNARK) |
| `contracts/ReputationSBT.sol` | Mint SBT after ZKP validation |
| `contracts/AttestationSystem.sol` | Manage attestations and ETH tipping |
| `scripts/deploy.js` | Full deployment, proof verification, minting logic |
| `scripts/callWithProof.js` | Script to claim SBT using ZKP |
| `scripts/gas_chart.js` | Generate gas usage chart from logs |
| `gas-logs.txt` | Real Scroll testnet gas usage data |
| `gas_chart.png` | Gas usage visual chart |

---

## 🆚 System Comparison (Your DAO vs Existing Tools)

| Feature                 | This System  | Coordinape    | SourceCred    |
|--------------------------|--------------|---------------|---------------|
| **On-chain Proof**        | ✅            | ❌             | ❌             |
| **Privacy (ZKP)**         | ✅            | ❌             | ❌             |
| **ETH Tipping**           | ✅            | ✅ (manual)    | ❌             |
| **Soulbound Tokens**      | ✅            | ❌             | ❌             |
| **Gas Optimization (L2)** | ✅ (Scroll)   | N/A           | N/A           |
| **Sybil Resistance**      | ✅            | ❌             | ❌             |

✅ Stronger decentralization, stronger privacy, better scalability.

---

## 🛠️ Tools Used

- Hardhat (deployment and tests)
- Circom (ZKP circuit compilation)
- snarkjs (proof generation)
- OpenZeppelin contracts (ERC721 SBT base)
- Scroll L2 Testnet
- ethers.js (Hardhat + scripts)

---

## 🚀 Deployment Instructions

```bash
# 1. Compile Contracts
npx hardhat compile

# 2. Generate ZKP Proof (off-chain)
snarkjs groth16 fullprove input.json reputation.wasm circuit_final.zkey proof.json public.json

# 3. Deploy Contracts on Scroll
npx hardhat run scripts/deploy.js --network scrollTestnet

# 4. Measure Gas Usage
cat gas-logs.txt

# 5. Generate Gas Chart (optional)
node scripts/gas_chart.js
```

---

# Role Definition

| Team Member | Contributions |
|-------------|----------------|
| **Deep Patel (deeppatel1842)** | - Smart contract development (`AttestationSystem.sol`, `ReputationSBT.sol`)<br>- Off-chain proof generation (`snarkjs`)<br>- Hardhat deployment scripts (`deploy.js`, `callWithProof.js`)<br>- Scroll L2 contract deployment<br>- ZKP circuit creation (`reputation.circom`) |
| **Saahil Saxena (saahilsaxena2000)** | - Project documentation (README, gas charts)<br>- Integration testing (`test/` folder)<br>- Helped with Scroll setup and deployment scripts<br>- Assisted in `gas_chart.js` for visualization<br>- Code review and fixes for final deployment <br>- Gas measurement and benchmarking<br>|


## 📚 Future Work

- Build a frontend UI (React + MetaMask integration)
- Enable multiple attestations aggregation
- Off-chain ZKP proof generation (user-friendly)
- DAO voting integration based on on-chain reputation

---
## 🛠️ Tools Used
- [Circom](https://docs.circom.io)
- [snarkjs](https://github.com/iden3/snarkjs)
- [Hardhat](https://hardhat.org)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Scroll Testnet](https://scroll.io)

---

# 🎉 Congratulations!
You successfully built a **private, decentralized, gas-optimized DAO contributor reputation system** ready for real-world scaling! 🚀🏆

> Built with Hardhat • Scroll L2 • Circom • zk-SNARKs • OpenZeppelin.

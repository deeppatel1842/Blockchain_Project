const { expect } = require("chai");
const { parseEther } = require("ethers");

describe("ReputationSBT - Claim Flow", function () {
  let sbt, attestation, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy AttestationSystem first
    const Att = await ethers.getContractFactory("AttestationSystem");
    attestation = await Att.deploy();

    // Deploy ReputationSBT with address of attestation contract
    const SBT = await ethers.getContractFactory("ReputationSBT");
    sbt = await SBT.deploy(owner.address, await attestation.getAddress());
  });

  it("should allow user to claim SBT after enough reputation", async function () {
    await attestation.connect(owner).attest(user1.address, 60, "Nice work!", { value: parseEther("0.001") });
    await sbt.connect(user1).claimSBT();

    expect(await sbt.balanceOf(user1.address)).to.equal(1);
    expect(await sbt.getReputation(user1.address)).to.equal(60);
  });

  it("should prevent user from claiming if reputation is insufficient", async function () {
    await attestation.connect(owner).attest(user1.address, 40, "Not enough yet", { value: parseEther("0.01") });

    await expect(sbt.connect(user1).claimSBT()).to.be.revertedWith("Not enough reputation");
  });

  it("should prevent transfers of SBT (soulbound)", async function () {
    await attestation.connect(owner).attest(user1.address, 70, "Top contributor!", { value: parseEther("0.01") });
    await sbt.connect(user1).claimSBT();

    await expect(
      sbt.connect(user1).transferFrom(user1.address, user2.address, 1)
    ).to.be.revertedWith("Soulbound: No transfers allowed");
  });
});

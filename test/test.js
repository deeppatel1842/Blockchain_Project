const { expect } = require("chai");
const { parseEther } = require("ethers");

describe("DAO Reputation Contracts", function () {
  let sbt, attestation, owner, user1, user2;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const Att = await ethers.getContractFactory("AttestationSystem");
    attestation = await Att.deploy();

    const SBT = await ethers.getContractFactory("ReputationSBT");
    sbt = await SBT.deploy(owner.address, await attestation.getAddress());
  });

  it("Should accept valid attestation with ETH and message", async () => {
    await attestation.connect(user1).attest(owner.address, 25, "Great contribution!", {
      value: parseEther("0.0001"),
    });

    const points = await attestation.getPoints(owner.address);
    expect(points).to.equal(25);

    const all = await attestation.getAttestations(owner.address);
    expect(all.length).to.equal(1);
    expect(all[0].from).to.equal(user1.address);
    expect(all[0].message).to.equal("Great contribution!");
    expect(all[0].amountSent).to.equal(parseEther("0.0001"));
  });

  it("Should allow claimSBT only after sufficient reputation", async () => {
    await expect(sbt.connect(user1).claimSBT()).to.be.revertedWith("Not enough reputation");

    await attestation.connect(owner).attest(user1.address, 30, "Good", {
      value: parseEther("0.0001"),
    });
    await expect(sbt.connect(user1).claimSBT()).to.be.revertedWith("Not enough reputation");

    await attestation.connect(owner).attest(user1.address, 25, "Great", {
      value: parseEther("0.0001"),
    });

    await sbt.connect(user1).claimSBT();

    expect(await sbt.balanceOf(user1.address)).to.equal(1);
    expect(await sbt.getReputation(user1.address)).to.equal(55);
  });

  it("Should prevent double claim of SBT", async () => {
    await attestation.connect(owner).attest(user1.address, 60, "Nice!", {
      value: parseEther("0.0001"),
    });
    await sbt.connect(user1).claimSBT();

    await expect(sbt.connect(user1).claimSBT()).to.be.revertedWith("Already owns an SBT");
  });

  it("Should prevent SBT transfers (soulbound)", async () => {
    await attestation.connect(owner).attest(user1.address, 60, "Well earned!", {
      value: parseEther("0.0001"),
    });
    await sbt.connect(user1).claimSBT();

    await expect(
      sbt.connect(user1).transferFrom(user1.address, user2.address, 1)
    ).to.be.revertedWith("Soulbound: No transfers allowed");
  });

  it("Should prevent self-attestation", async () => {
    await expect(
      attestation.connect(user1).attest(user1.address, 15, "Boosting self", {
        value: parseEther("0.0005"),
      })
    ).to.be.revertedWith("Cannot attest to self");
  });

  it("Should transfer ETH to recipient during attest()", async () => {
    const balanceBefore = await ethers.provider.getBalance(user1.address);

    const tx = await attestation.connect(owner).attest(
      user1.address,
      50,
      "ETH tipping test",
      { value: parseEther("0.001") }
    );
    await tx.wait();

    const balanceAfter = await ethers.provider.getBalance(user1.address);
    const received = balanceAfter.sub(balanceBefore);

    // Allow margin for gas difference
    expect(received).to.be.closeTo(parseEther("0.001"), parseEther("0.0001"));
  });
});

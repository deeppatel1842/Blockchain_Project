// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IAttestationSystem {
    function getPoints(address user) external view returns (uint256);
}

interface VerifierInterface {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) external view returns (bool r);
}

contract ReputationSBT is ERC721, Ownable {
    uint256 public tokenCounter;
    uint256 public constant MIN_REP_POINTS = 50;

    mapping(uint256 => uint256) public reputationScores;
    mapping(address => uint256) public addressToToken;

    IAttestationSystem public attestationContract;
    VerifierInterface public verifierContract;

    constructor(address initialOwner, address _attestation, address _verifier)
        ERC721("ReputationSBT", "RSBT")
        Ownable(initialOwner)
    {
        tokenCounter = 1;
        attestationContract = IAttestationSystem(_attestation);
        verifierContract = VerifierInterface(_verifier);
    }

    // Old claimSBT (trust-based), kept optional
    function claimSBT() external {
        require(addressToToken[msg.sender] == 0, "Already owns an SBT");

        uint256 reputation = attestationContract.getPoints(msg.sender);
        require(reputation >= MIN_REP_POINTS, "Not enough reputation");

        uint256 tokenId = tokenCounter;
        _safeMint(msg.sender, tokenId);
        reputationScores[tokenId] = reputation;
        addressToToken[msg.sender] = tokenId;
        tokenCounter++;
    }

    // New claimWithProof() — ZKP based!
    function claimWithProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) external {
        require(addressToToken[msg.sender] == 0, "Already owns an SBT");
        require(verifierContract.verifyProof(a, b, c, input), "Invalid ZK proof");

        uint256 tokenId = tokenCounter;
        _safeMint(msg.sender, tokenId);
        reputationScores[tokenId] = input[0];
        addressToToken[msg.sender] = tokenId;
        tokenCounter++;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);
        require(from == address(0) || to == address(0), "Soulbound: No transfers allowed");
        return from;
    }

    function getReputation(address user) external view returns (uint256) {
        uint256 tokenId = addressToToken[user];
        return reputationScores[tokenId];
    }
}

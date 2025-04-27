// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AttestationSystem {
    struct Attestation {
        address from;
        uint256 points;
        string message;
        uint256 amountSent;
    }

    mapping(address => Attestation[]) public attestations;

    event Attested(
        address indexed from,
        address indexed to,
        uint256 points,
        string message,
        uint256 amountSent
    );

    event ETHTransferred(address indexed to, uint256 amount);

    function attest(address to, uint256 points, string calldata message) external payable {
        require(to != msg.sender, "Cannot attest to self");

        // ✅ Transfer ETH to recipient
        if (msg.value > 0) {
            (bool sent, ) = payable(to).call{value: msg.value}("");
            require(sent, "ETH transfer failed");
            emit ETHTransferred(to, msg.value);
        }

        // ✅ Store the attestation
        Attestation memory a = Attestation(msg.sender, points, message, msg.value);
        attestations[to].push(a);

        emit Attested(msg.sender, to, points, message, msg.value);
    }

    function getPoints(address user) external view returns (uint256 total) {
        Attestation[] memory aList = attestations[user];
        for (uint256 i = 0; i < aList.length; i++) {
            total += aList[i].points;
        }
    }

    function getAttestations(address user) external view returns (Attestation[] memory) {
        return attestations[user];
    }
}

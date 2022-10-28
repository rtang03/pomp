// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface IMissionNFT {
  function safeMint(
    address to,
    string memory uri,
    address royaltyRecipient,
    uint96 royaltyValue
  ) external returns (uint256);

  function burn(uint256 tokenId) external;

  function oneToManyTransfer(
    address from,
    address[] memory toAddresses,
    uint256[] memory tokenIds
  ) external;
}

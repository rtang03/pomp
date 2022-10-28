// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '../libraries/DataTypes.sol';

interface IProfileModule {
  function canClaim(
    address claimer,
    string calldata handle,
    bytes32[] calldata proof
  ) external view returns (bool);

  function claimed(address wallet) external view returns (bool);

  function createProfile(
    string calldata handle,
    address claimer,
    bytes32[] calldata proof
  ) external returns (uint256);

  function getCountAndIncrement(uint256) external returns (uint256);

  function getHandle(uint256 profileId) external view returns (string memory);

  function getOwner(uint256 profileId) external view returns (address);

  function merkleroot() external view returns (bytes32);

  function profileByAddress(address wallet)
    external
    view
    returns (uint256, DataTypes.ProfileStruct memory);

  function profileByHandle(string calldata handle)
    external
    view
    returns (DataTypes.ProfileStruct memory);

  function profileById(uint256 profileId) external view returns (DataTypes.ProfileStruct memory);

  function profileIdByAddress(address wallet) external view returns (uint256);

  function profileIdByHandle(string calldata handle) external view returns (uint256);

  function profileIdCounter() external view returns (uint256);

  function setMerklerootForProfiles(bytes32 root) external;
}

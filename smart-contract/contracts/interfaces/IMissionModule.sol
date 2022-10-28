// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '../libraries/DataTypes.sol';

interface IMissionModule {
  function abortWithSig(DataTypes.AbortWithSigData calldata vars, address owner) external;

  function batchVerifyWithSig(DataTypes.BatchVerifyWithSigData calldata vars, address sender)
    external;

  function canBatchVerify(DataTypes.CanBatchVerifyData calldata vars, address sender)
    external
    view
    returns (bool);

  function completeWithSig(DataTypes.CompleteWithSigData calldata vars, address owner) external;

  function failWithSig(DataTypes.FailWithSigData calldata vars, address sender) external;

  function missionByChallenge(string calldata challenge)
    external
    view
    returns (
      DataTypes.MissionStruct memory,
      uint256,
      string memory
    );

  function missionById(uint256 profileId, uint256 missionId)
    external
    view
    returns (
      DataTypes.MissionStruct memory,
      uint256,
      string memory
    );

  function missionBySlug(uint256 profileId, string calldata slug)
    external
    view
    returns (DataTypes.MissionStruct memory);

  function missionIdBySlug(string calldata slug) external view returns (uint256);

  function startWithSig(DataTypes.StartWithSigData calldata vars, address owner)
    external
    returns (uint256);

  function sigNonces(address wallet) external view returns (uint256);

  function verifyWithSig(DataTypes.VerifyWithSigData calldata vars, address sender) external;
}

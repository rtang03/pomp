// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {DataTypes} from '../libraries/DataTypes.sol';

/**
 * @title Proof of Mission Protocol
 * @author rtang03
 *
 * @notice This is the interface for the Pomp contract, the main entry point for the Pomp Protocol.
 * You'll find all the events and external functions, as well as the reasoning behind them here.
 */
interface IPompHub {
  /**
   * @notice Initializes the PompHub, setting the initial addresses
   *
   * @param _governor Governor address
   * @param _profileModule ProfileModule address
   * @param _missionModule MissionModule address
   */
  function initialize(
    address _governor,
    address _profileModule,
    address _missionModule
  ) external;

  /**
   * @notice Abort a mission for given profile via signature with the specified parameters.
   *
   * @param vars A AbortWithSigData struct containing the regular parameters and an EIP712Signature struct.
   *
   */
  function abortWithSig(DataTypes.AbortWithSigData calldata vars) external;

  /**
   * @notice Batch verify missions via signature with the specified parameters.
   *
   * @param vars A BatchVerifyWithSigData struct containing the regular parameters and an EIP712Signature struct.
   *
   */
  function batchVerifyWithSig(DataTypes.BatchVerifyWithSigData calldata vars) external;

  /**
   * @notice validates if it can batch-verify for given profileIds and challenges
   *
   * @param vars A CanBatchVerifyData struct containing the regular parameters
   *
   */
  function canBatchVerify(DataTypes.CanBatchVerifyData calldata vars) external view returns (bool);

  /**
   * @notice Check the eligiblity to claim profile.
   *
   * @param claimer Address of claimer.
   *
   * @param handle Check the handle fulfilling the format requirement.
   *
   * @param proof Merkle proof of the claimer.
   *
   * @return bool
   */
  function canClaim(
    address claimer,
    string calldata handle,
    bytes32[] calldata proof
  ) external view returns (bool);

  /**
   * @notice check if wallet has already claim his profile
   *
   * @param wallet wallet address
   *
   * @return bool
   */
  function claimed(address wallet) external view returns (bool);

  /**
   * @notice Complete a mission for given profile via signature with the specified parameters.
   *
   * @param vars A CompleteWithSigData struct containing the regular parameters and an EIP712Signature struct.
   *
   */
  function completeWithSig(DataTypes.CompleteWithSigData calldata vars) external;

  /**
   * @notice Creates a profile with the specified parameters. This
   * function must be called by a whitelisted profile creator.
   *
   * @param handle: The handle to set for the profile, must be unique and non-empty.
   *
   * @param proof: Merkle Tree proof of being whitelisted
   */
  function createProfile(string calldata handle, bytes32[] calldata proof)
    external
    returns (uint256);

  /**
   * @notice Returns NEXT MissionCount
   *
   * @param profileId Profile identity
   *
   * @return uint256 next missionCount
   */
  function getCountAndIncrement(uint256 profileId) external returns (uint256);

  /**
   * @notice Returns the handle associated with a profile.
   *
   * @param profileId Profile identity.p
   *
   * @return string The handle associated with the profile.
   */
  function getHandle(uint256 profileId) external view returns (string memory);

  /**
   * @notice Verify a mission for given profile via signature with the specified parameters.
   *
   * @param vars A VerifyWithSigData struct containing the regular parameters and an EIP712Signature struct.
   *
   */
  function failWithSig(DataTypes.FailWithSigData calldata vars) external;

  /**
   * @notice Query mission for given challenge
   *
   * @return MissionStruct Mission
   */
  function missionByChallenge(string calldata challenge)
    external
    view
    returns (
      DataTypes.MissionStruct memory,
      uint256,
      string memory
    );

  /**
   * @notice Query active merkle root hash of whitelisted profiles
   *
   * @return bytes32 merkle root hash
   */
  function merkleroot() external view returns (bytes32);

  /**
   * @notice Returns the Mission struct associated with a profile.
   *
   * @param profileId Profile identity.
   *
   * @param missionId The token ID of the mission.
   *
   * @return MissionStruct Mission
   */
  function missionById(uint256 profileId, uint256 missionId)
    external
    view
    returns (
      DataTypes.MissionStruct memory,
      uint256,
      string memory
    );

  /**
   * @notice Returns the Mission struct associated with a profile.
   *
   * @param profileId main profile identity.
   *
   * @param slug Mission slug.
   *
   * @return MissionStruct Mission.
   */
  function missionBySlug(uint256 profileId, string calldata slug)
    external
    view
    returns (DataTypes.MissionStruct memory);

  /**
   * @notice Returns the Mission struct associated with a profile.
   *
   * @param slug Mission slug.
   *
   * @return MissionStruct Mission.
   */
  function missionIdBySlug(string calldata slug) external view returns (uint256);

  function pause() external;

  /**
   * @notice Returns the Profile struct associated with an address
   *
   * @param wallet Wallet holder address.
   *
   * @return ProfileId, ProfileStruct, Creator, Verifier
   */
  function profileByAddress(address wallet)
    external
    view
    returns (
      uint256,
      DataTypes.ProfileStruct memory,
      bool,
      bool
    );

  /**
   * @notice Returns the Profile struct associated with a profile.
   *
   * @param handle Profile handle.
   *
   * @return ProfileStruct The Profile struct associated with the profile.
   */
  function profileByHandle(string calldata handle)
    external
    view
    returns (DataTypes.ProfileStruct memory);

  /**
   * @notice Returns the Profile struct associated with a profile.
   *
   * @param profileId The token ID of the profile to query the handle for.
   *
   * @return ProfileStruct The Profile struct associated with the profile.
   */
  function profileById(uint256 profileId) external view returns (DataTypes.ProfileStruct memory);

  /**
   * @notice Returns the Profile identity associated with a profile.
   *
   * @param wallet Wallet holder address.
   *
   * @return uint256 An integer representing the profileId.
   */
  function profileIdByAddress(address wallet) external view returns (uint256);

  /**
   * @notice Returns the Profile identity associated with a profile.
   *
   * @param handle Profile handle.
   *
   * @return uint256 An integer representing the profileId.
   */
  function profileIdByHandle(string calldata handle) external view returns (uint256);

  /**
   * @notice Returns current profileId counter
   *
   * @return uint256 An integer representing the profileIdCounter
   */
  function profileIdCounter() external view returns (uint256);

  /**
   * @notice SetProfileModule address
   *
   * @param _profileModule ProfileModule address
   *
   */
  function setProfileModule(address _profileModule) external;

  /**
   * @notice Set Merkle root for whitelisted profiles.
   *
   * @param root A Merkle Tree Root for whitelisted profiles.
   *
   */
  function setMerklerootForProfiles(bytes32 root) external;

  /**
   * @notice Set MissionModule address
   *
   * @param _missionModule MissionModule address
   *
   */
  function setMissionModule(address _missionModule) external;

  /**
   * @notice Return signature nonce of a wallet
   *
   * @param wallet wallet address
   *
   * @return uint256 signature nonce
   */
  function sigNonces(address wallet) external view returns (uint256);

  /**
   * @notice Start a mission for given profile via signature with the specified parameters.
   *
   * @param vars A StartWithSigData struct containing the regular parameters and an EIP712Signature struct.
   *
   * @return uint256 An integer representing the missionId.
   */
  function startWithSig(DataTypes.StartWithSigData calldata vars) external returns (uint256);

  function unpause() external;

  /**
   * @notice Verify a mission for given profile via signature with the specified parameters.
   *
   * @param vars A VerifyWithSigData struct containing the regular parameters and an EIP712Signature struct.
   *
   */
  function verifyWithSig(DataTypes.VerifyWithSigData calldata vars) external;
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import './interfaces/IPompHub.sol';
import './interfaces/IMissionModule.sol';
import './interfaces/IProfileModule.sol';
import 'hardhat/console.sol';

contract PompHub is Initializable, PausableUpgradeable, AccessControlUpgradeable, IPompHub {
  address public profileModule;
  address public missionModule;

  bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');
  bytes32 public constant GOVERNOR_ROLE = keccak256('GOVERNOR_ROLE');
  bytes32 public constant CREATOR = keccak256('CREATOR_ROLE');
  bytes32 public constant VERIFIER = keccak256('VERIFIER_ROLE');

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /// @inheritdoc IPompHub
  function initialize(
    address _governor,
    address _profileModule,
    address _missionModule
  ) external override initializer {
    __Pausable_init();
    __AccessControl_init();

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(PAUSER_ROLE, _governor);
    _grantRole(GOVERNOR_ROLE, _governor);
    profileModule = _profileModule;
    missionModule = _missionModule;
  }

  /// @inheritdoc IPompHub
  function setMissionModule(address _missionModule) external whenNotPaused {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 'Denied');
    missionModule = _missionModule;
  }

  /// @inheritdoc IPompHub
  function setProfileModule(address _profileModule) external whenNotPaused {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 'Denied');
    profileModule = _profileModule;
  }

  /// ***********************
  /// *** WRTIE FUNCTIONS ***
  /// ***********************

  /// @inheritdoc IPompHub
  function abortWithSig(DataTypes.AbortWithSigData calldata vars) external override whenNotPaused {
    address owner = IProfileModule(profileModule).getOwner(vars.profileId);
    require((owner == msg.sender), 'NotOwner');
    IMissionModule(missionModule).abortWithSig(vars, owner);
  }

  /// @inheritdoc IPompHub
  function batchVerifyWithSig(DataTypes.BatchVerifyWithSigData calldata vars) external {
    require(hasRole(VERIFIER, msg.sender), 'Denied');
    IMissionModule(missionModule).batchVerifyWithSig(vars, msg.sender);
  }

  /// @inheritdoc IPompHub
  function canBatchVerify(DataTypes.CanBatchVerifyData calldata vars) external view returns (bool) {
    return IMissionModule(missionModule).canBatchVerify(vars, msg.sender);
  }

  /// @inheritdoc IPompHub
  function completeWithSig(DataTypes.CompleteWithSigData calldata vars)
    external
    override
    whenNotPaused
  {
    address owner = IProfileModule(profileModule).getOwner(vars.profileId);
    require((owner == msg.sender), 'NotOwner');
    IMissionModule(missionModule).completeWithSig(vars, owner);
  }

  /// @inheritdoc IPompHub
  function createProfile(string calldata handle, bytes32[] calldata proof)
    external
    override
    whenNotPaused
    returns (uint256)
  {
    return IProfileModule(profileModule).createProfile(handle, msg.sender, proof);
  }

  /// @inheritdoc IPompHub
  function getCountAndIncrement(uint256 profileId)
    external
    override
    whenNotPaused
    returns (uint256)
  {
    // can only be called by MissionModule
    require(msg.sender == missionModule, 'Denied');
    return IProfileModule(profileModule).getCountAndIncrement(profileId);
  }

  /// @inheritdoc IPompHub
  function failWithSig(DataTypes.FailWithSigData calldata vars) external override whenNotPaused {
    require(hasRole(VERIFIER, msg.sender), 'Denied');
    IMissionModule(missionModule).failWithSig(vars, msg.sender);
  }

  /// @inheritdoc IPompHub
  function pause() external override onlyRole(PAUSER_ROLE) {
    _pause();
  }

  /// @inheritdoc IPompHub
  function setMerklerootForProfiles(bytes32 root) external whenNotPaused onlyRole(GOVERNOR_ROLE) {
    IProfileModule(profileModule).setMerklerootForProfiles(root);
  }

  /// @inheritdoc IPompHub
  function startWithSig(DataTypes.StartWithSigData calldata vars)
    external
    override
    whenNotPaused
    returns (uint256)
  {
    address owner = IProfileModule(profileModule).getOwner(vars.profileId);
    require((owner == msg.sender), 'NotOwner');
    return IMissionModule(missionModule).startWithSig(vars, owner);
  }

  /// @inheritdoc IPompHub
  function unpause() external override onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  /// @inheritdoc IPompHub
  function verifyWithSig(DataTypes.VerifyWithSigData calldata vars)
    external
    override
    whenNotPaused
  {
    require(hasRole(VERIFIER, msg.sender), 'Denied');
    IMissionModule(missionModule).verifyWithSig(vars, msg.sender);
  }

  /// ***********************
  /// *** VIEW FUNCTIONS ***
  /// ***********************

  /// @inheritdoc IPompHub
  function canClaim(
    address claimer,
    string calldata handle,
    bytes32[] calldata proof
  ) external view override returns (bool) {
    return IProfileModule(profileModule).canClaim(claimer, handle, proof);
  }

  /// @inheritdoc IPompHub
  function claimed(address wallet) external view override returns (bool) {
    return IProfileModule(profileModule).claimed(wallet);
  }

  /// @inheritdoc IPompHub
  function getHandle(uint256 profileId) external view returns (string memory) {
    return IProfileModule(profileModule).getHandle(profileId);
  }

  /// @inheritdoc IPompHub
  function merkleroot() external view returns (bytes32) {
    return IProfileModule(profileModule).merkleroot();
  }

  /// @inheritdoc IPompHub
  function missionByChallenge(string calldata challenge)
    external
    view
    override
    returns (
      DataTypes.MissionStruct memory,
      uint256,
      string memory
    )
  {
    return IMissionModule(missionModule).missionByChallenge(challenge);
  }

  /// @inheritdoc IPompHub
  function missionById(uint256 profileId, uint256 missionId)
    external
    view
    override
    returns (
      DataTypes.MissionStruct memory,
      uint256,
      string memory
    )
  {
    return IMissionModule(missionModule).missionById(profileId, missionId);
  }

  /// @inheritdoc IPompHub
  function missionBySlug(uint256 profileId, string calldata slug)
    external
    view
    override
    returns (DataTypes.MissionStruct memory)
  {
    return IMissionModule(missionModule).missionBySlug(profileId, slug);
  }

  /// @inheritdoc IPompHub
  function missionIdBySlug(string calldata slug) external view override returns (uint256) {
    return IMissionModule(missionModule).missionIdBySlug(slug);
  }

  /// @inheritdoc IPompHub
  function profileByAddress(address wallet)
    external
    view
    override
    returns (
      uint256,
      DataTypes.ProfileStruct memory,
      bool,
      bool
    )
  {
    (uint256 profileId, DataTypes.ProfileStruct memory profile) = IProfileModule(profileModule)
      .profileByAddress(wallet);
    return (profileId, profile, hasRole(CREATOR, wallet), hasRole(VERIFIER, wallet));
  }

  /// @inheritdoc IPompHub
  function profileByHandle(string calldata handle)
    external
    view
    override
    returns (DataTypes.ProfileStruct memory)
  {
    return IProfileModule(profileModule).profileByHandle(handle);
  }

  /// @inheritdoc IPompHub
  function profileById(uint256 profileId)
    external
    view
    override
    returns (DataTypes.ProfileStruct memory)
  {
    return IProfileModule(profileModule).profileById(profileId);
  }

  /// @inheritdoc IPompHub
  function profileIdByHandle(string calldata handle) external view returns (uint256) {
    return IProfileModule(profileModule).profileIdByHandle(handle);
  }

  /// @inheritdoc IPompHub
  function profileIdByAddress(address wallet) external view returns (uint256) {
    return IProfileModule(profileModule).profileIdByAddress(wallet);
  }

  /// @inheritdoc IPompHub
  function profileIdCounter() external view returns (uint256) {
    return IProfileModule(profileModule).profileIdCounter();
  }

  /// @inheritdoc IPompHub
  function sigNonces(address wallet) external view override returns (uint256) {
    return IMissionModule(missionModule).sigNonces(wallet);
  }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import './libraries/Logic.sol';
import './libraries/DataTypes.sol';
import './interfaces/IPompHub.sol';
import './interfaces/IProfileModule.sol';
import 'hardhat/console.sol';

contract ProfileModule is AccessControl, IProfileModule {
  using Counters for Counters.Counter;
  Counters.Counter public profileIdCounter;
  address public immutable pompHub;
  bytes32 public constant HUB_ROLE = keccak256('HUB_ROLE');
  bytes32 public merkleroot;
  mapping(address => bool) public claimed;
  mapping(bytes32 => uint256) internal _profileIdByHandleHash;
  mapping(address => uint256) internal _profileIdByAddress;
  mapping(uint256 => DataTypes.ProfileStruct) internal _profileById;

  event ProfileCreated(
    uint256 indexed profileId,
    address indexed creator,
    string handle,
    uint256 timestamp
  );

  constructor(address _pompHub, bytes32 _root) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(HUB_ROLE, _pompHub);
    pompHub = _pompHub;
    merkleroot = _root;
    profileIdCounter.increment();
  }

  /// @inheritdoc IProfileModule
  function createProfile(
    string calldata handle,
    address claimer,
    bytes32[] calldata proof
  ) external override returns (uint256) {
    require(hasRole(HUB_ROLE, msg.sender), 'NotHub');
    Logic.canClaimProfileWithRevert(
      claimed,
      claimer,
      proof,
      handle,
      merkleroot,
      _profileIdByHandleHash
    );
    uint256 profileId = profileIdCounter.current();
    profileIdCounter.increment();

    Logic.createProfile(
      claimed,
      claimer,
      handle,
      profileId,
      _profileIdByHandleHash,
      _profileById,
      _profileIdByAddress
    );

    emit ProfileCreated(profileId, claimer, handle, block.timestamp);

    return profileId;
  }

  /// @inheritdoc IProfileModule
  function getCountAndIncrement(uint256 profileId) external returns (uint256) {
    require(hasRole(HUB_ROLE, msg.sender), 'NotHub');
    uint256 missionId = _profileById[profileId].missionCount;
    ++missionId;
    _profileById[profileId].missionCount = missionId;
    return missionId;
  }

  /// @inheritdoc IProfileModule
  function setMerklerootForProfiles(bytes32 root) external {
    require(hasRole(HUB_ROLE, msg.sender), 'NotHub');
    merkleroot = root;
  }

  /// ***********************
  /// ***VIEW FUNCTIONS***
  /// ***********************

  /// @inheritdoc IProfileModule
  function canClaim(
    address claimer,
    string calldata handle,
    bytes32[] calldata proof
  ) external view override returns (bool) {
    return
    Logic.canClaimProfile(claimed, claimer, proof, handle, merkleroot, _profileIdByHandleHash);
  }

  /// @inheritdoc IProfileModule
  function getHandle(uint256 profileId) external view returns (string memory) {
    return _profileById[profileId].handle;
  }

  /// @inheritdoc IProfileModule
  function getOwner(uint256 profileId) external view returns (address) {
    return _profileById[profileId].owner;
  }

  /// @inheritdoc IProfileModule
  function profileByAddress(address wallet)
  external
  view
  override
  returns (uint256, DataTypes.ProfileStruct memory)
  {
    uint256 profileId = _profileIdByAddress[wallet];
    return (profileId, _profileById[profileId]);
  }

  /// @inheritdoc IProfileModule
  function profileByHandle(string calldata handle)
  external
  view
  override
  returns (DataTypes.ProfileStruct memory)
  {
    return _profileById[_profileIdByHandleHash[keccak256(bytes(handle))]];
  }

  /// @inheritdoc IProfileModule
  function profileById(uint256 profileId)
  external
  view
  override
  returns (DataTypes.ProfileStruct memory)
  {
    return _profileById[profileId];
  }

  /// @inheritdoc IProfileModule
  function profileIdByAddress(address wallet) external view override returns (uint256) {
    return _profileIdByAddress[wallet];
  }

  /// @inheritdoc IProfileModule
  function profileIdByHandle(string calldata handle) external view returns (uint256) {
    return _profileIdByHandleHash[keccak256(bytes(handle))];
  }

  // The following functions are overrides required by Solidity.
  function supportsInterface(bytes4 interfaceId)
  public
  view
  override(AccessControl)
  returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import 'hardhat/console.sol';
import './libraries/DataTypes.sol';
import './libraries/Logic.sol';
import './interfaces/IPompHub.sol';
import './interfaces/IMissionModule.sol';
import './interfaces/IMissionNFT.sol';

contract MissionModule is AccessControl, EIP712, ERC721Holder, IMissionModule {
  address public immutable pompHub;
  address public immutable missionNFT;
  bytes32 public constant HUB_ROLE = keccak256('HUB_ROLE');
  bytes32 internal constant ABORT_WITH_SIG_TYPEHASH =
    keccak256('Abort(uint256 profileId,uint256 missionId,uint256 nonce,uint256 deadline)');
  bytes32 internal constant COMPLETE_WITH_SIG_TYPEHASH =
    keccak256(
      'Complete(uint256 profileId,uint256 missionId,string challenge,uint256 nonce,uint256 deadline)'
    );
  bytes32 internal constant FAIL_WITH_SIG_TYPEHASH =
    keccak256(
      'Fail(uint256 profileId,string challenge,uint256 reason,uint256 nonce,uint256 deadline)'
    );
  bytes32 internal constant START_WITH_SIG_TYPEHASH =
    keccak256(
      'Start(uint256 profileId,string slug,string contentURI,uint256 minutesToExpire,address creator,address verifier,uint256 nonce,uint256 deadline)'
    );
  bytes32 internal constant VERIFY_WITH_SIG_TYPEHASH =
    keccak256('Verify(uint256 profileId,string challenge,uint256 nonce,uint256 deadline)');
  bytes32 internal constant BATCH_VERIFY_WITH_SIG_TYPEHASH =
    keccak256('BatchVerify(uint256[] profileIds,string challenges,uint256 nonce,uint256 deadline)');
  mapping(address => uint256) public sigNonces;
  mapping(bytes32 => uint256) internal _missionIdBySlugHash;
  mapping(bytes32 => uint256) internal _missionIdByChallengeHash;
  mapping(bytes32 => uint256) internal _profileIdByChallengeHash;
  mapping(uint256 => mapping(uint256 => DataTypes.MissionStruct)) internal _missionByIdByProfile;

  event Aborted(uint256 indexed profileId, uint256 indexed missionId, uint256 timestamp);
  event Completed(
    address indexed verifier,
    uint256 indexed profileId,
    uint256 indexed missionId,
    bytes32 challenge,
    uint256 timestamp
  );
  event Started(
    address indexed creator,
    uint256 indexed profileId,
    uint256 indexed missionId,
    uint256 endtime,
    uint256 timestamp
  );
  event Verified(
    address indexed verifier,
    uint256 indexed profileId,
    uint256 indexed missionId,
    bytes32 challenge,
    uint256 timestamp
  );
  event Failed(
    address indexed verifier,
    uint256 indexed profileId,
    uint256 indexed missionId,
    bytes32 challenge,
    uint256 reason,
    uint256 timestamp
  );
  event BatchVerified(address indexed verifier, uint256 indexed count, uint256 timestamp);

  constructor(address _pompHub, address _missionNFT) EIP712('Pomp', '1') {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(HUB_ROLE, _pompHub);
    pompHub = _pompHub;
    missionNFT = _missionNFT;
  }

  /// *********************************
  /// *****WRITE FUNCTIONS*****
  /// *********************************

  /// @inheritdoc IMissionModule
  function abortWithSig(DataTypes.AbortWithSigData calldata vars, address owner) external override {
    require(hasRole(HUB_ROLE, msg.sender), 'NotHub');
    Logic.validateSignature(
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            ABORT_WITH_SIG_TYPEHASH,
            vars.profileId,
            vars.missionId,
            sigNonces[owner],
            vars.deadline
          )
        )
      ),
      owner,
      vars.signature,
      vars.deadline
    );
    Logic.canAbortOrComplete(vars.profileId, vars.missionId, false, _missionByIdByProfile);
    ++sigNonces[owner];
    IMissionNFT(missionNFT).burn(_missionByIdByProfile[vars.profileId][vars.missionId].tokenId);
    _missionByIdByProfile[vars.profileId][vars.missionId].state = DataTypes.State.aborted;

    emit Aborted(vars.profileId, vars.missionId, block.timestamp);
  }

  /// @inheritdoc IMissionModule
  function batchVerifyWithSig(DataTypes.BatchVerifyWithSigData calldata vars, address sender)
    external
    override
  {
    require(hasRole(HUB_ROLE, msg.sender), 'NotHub');
    (address[] memory _owners, uint256[] memory _tokenIds, uint256[] memory _missionIds) = Logic
      .batchVerify(
        _hashTypedDataV4(
          keccak256(
            abi.encode(
              BATCH_VERIFY_WITH_SIG_TYPEHASH,
              keccak256(abi.encodePacked(vars.profileIds)),
              keccak256(bytes(vars.challenges)),
              sigNonces[sender],
              vars.deadline
            )
          )
        ),
        sender,
        vars.signature,
        vars.deadline,
        DataTypes.BatchVerifyData(vars.profileIds, vars.challenges, sender),
        _missionByIdByProfile,
        _missionIdByChallengeHash
      );

    ++sigNonces[sender];

    IMissionNFT(missionNFT).oneToManyTransfer(address(this), _owners, _tokenIds);

    for (uint256 i = 0; i < vars.profileIds.length; ++i) {
      _missionByIdByProfile[vars.profileIds[i]][_missionIds[i]].state = DataTypes.State.verified;
    }

    emit BatchVerified(sender, _owners.length, block.timestamp);
  }

  /// @inheritdoc IMissionModule
  function completeWithSig(DataTypes.CompleteWithSigData calldata vars, address owner)
    external
    override
  {
    require(hasRole(HUB_ROLE, msg.sender), 'NotHub');
    Logic.validateSignature(
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            COMPLETE_WITH_SIG_TYPEHASH,
            vars.profileId,
            vars.missionId,
            keccak256(bytes(vars.challenge)),
            sigNonces[owner],
            vars.deadline
          )
        )
      ),
      owner,
      vars.signature,
      vars.deadline
    );
    (address verifier, bytes32 challengeHash) = Logic.completeMission(
      vars.profileId,
      vars.missionId,
      vars.challenge,
      owner,
      _missionByIdByProfile,
      _missionIdByChallengeHash,
      _profileIdByChallengeHash,
      sigNonces
    );

    emit Completed(verifier, vars.profileId, vars.missionId, challengeHash, block.timestamp);
  }

  /// @inheritdoc IMissionModule
  function failWithSig(DataTypes.FailWithSigData calldata vars, address sender) external override {
    require(hasRole(HUB_ROLE, msg.sender), 'NotHub');
    bytes32 hash = keccak256(bytes(vars.challenge));
    Logic.validateSignature(
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            FAIL_WITH_SIG_TYPEHASH,
            vars.profileId,
            hash,
            vars.reason,
            sigNonces[sender],
            vars.deadline
          )
        )
      ),
      sender,
      vars.signature,
      vars.deadline
    );
    uint256 missionId = Logic.getMissionIdByChallengeHash(hash, _missionIdByChallengeHash);
    Logic.canVerifyOrFail(vars.profileId, missionId, sender, _missionByIdByProfile);

    ++sigNonces[sender];

    IMissionNFT(missionNFT).burn(_missionByIdByProfile[vars.profileId][missionId].tokenId);
    _missionByIdByProfile[vars.profileId][missionId].state = DataTypes.State.failed;

    emit Failed(
      sender,
      vars.profileId,
      missionId,
      _missionByIdByProfile[vars.profileId][missionId].challengeHash,
      vars.reason,
      block.timestamp
    );
  }

  /// @inheritdoc IMissionModule
  function startWithSig(DataTypes.StartWithSigData calldata vars, address owner)
    external
    override
    returns (uint256)
  {
    require(hasRole(HUB_ROLE, msg.sender), 'NotHub');
    Logic.validationStart(
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            START_WITH_SIG_TYPEHASH,
            vars.profileId,
            keccak256(bytes(vars.slug)),
            keccak256(bytes(vars.contentURI)),
            vars.minutesToExpire,
            vars.creator,
            vars.verifier,
            sigNonces[owner],
            vars.deadline
          )
        )
      ),
      owner,
      vars.signature,
      vars.deadline,
      vars.slug,
      _missionIdBySlugHash
    );
    ++sigNonces[owner];
    uint256 missionId = IPompHub(pompHub).getCountAndIncrement(vars.profileId);
    // todo fix royaltyRecipient & royaltyValue
    uint256 tokenId = IMissionNFT(missionNFT).safeMint(
      address(this),
      vars.contentURI,
      vars.creator,
      0
    );
    uint256 endtime = Logic.startMission(
      DataTypes.startMissionData(
        vars.profileId,
        tokenId,
        vars.slug,
        vars.minutesToExpire,
        vars.creator,
        vars.verifier,
        owner,
        missionId
      ),
      _missionByIdByProfile,
      _missionIdBySlugHash
    );

    emit Started(vars.creator, vars.profileId, missionId, endtime, block.timestamp);

    return tokenId;
  }

  /// @inheritdoc IMissionModule
  function verifyWithSig(DataTypes.VerifyWithSigData calldata vars, address sender)
    external
    override
  {
    require(hasRole(HUB_ROLE, msg.sender), 'NotHub');
    bytes32 hash = Logic.validationVerify(
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            VERIFY_WITH_SIG_TYPEHASH,
            vars.profileId,
            keccak256(bytes(vars.challenge)),
            sigNonces[sender],
            vars.deadline
          )
        )
      ),
      sender,
      vars.signature,
      vars.deadline,
      vars.challenge
    );
    uint256 missionId = Logic.getMissionIdByChallengeHash(hash, _missionIdByChallengeHash);
    Logic.canVerifyOrFail(vars.profileId, missionId, sender, _missionByIdByProfile);
    ++sigNonces[sender];
    IERC721(missionNFT).safeTransferFrom(
      address(this),
      _missionByIdByProfile[vars.profileId][missionId].owner,
      _missionByIdByProfile[vars.profileId][missionId].tokenId
    );
    _missionByIdByProfile[vars.profileId][missionId].state = DataTypes.State.verified;

    emit Verified(
      sender,
      vars.profileId,
      missionId,
      _missionByIdByProfile[vars.profileId][missionId].challengeHash,
      block.timestamp
    );
  }

  /// ***********************
  /// ***VIEW FUNCTIONS***
  /// ***********************

  /// @inheritdoc IMissionModule
  function canBatchVerify(DataTypes.CanBatchVerifyData calldata vars, address sender)
    external
    view
    override
    returns (bool)
  {
    Logic.canBatchVerify(
      DataTypes.BatchVerifyData(vars.profileIds, vars.challenges, sender),
      _missionByIdByProfile,
      _missionIdByChallengeHash
    );
    return true;
  }

  /// @inheritdoc IMissionModule
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
    return
      Logic.missionByChallenge(
        challenge,
        missionNFT,
        _missionByIdByProfile,
        _missionIdByChallengeHash,
        _profileIdByChallengeHash
      );
  }

  /// @inheritdoc IMissionModule
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
    return Logic.missionById(profileId, missionId, missionNFT, _missionByIdByProfile);
  }

  /// @inheritdoc IMissionModule
  function missionBySlug(uint256 profileId, string calldata slug)
    external
    view
    override
    returns (DataTypes.MissionStruct memory)
  {
    return _missionByIdByProfile[profileId][_missionIdBySlugHash[keccak256(bytes(slug))]];
  }

  /// @inheritdoc IMissionModule
  function missionIdBySlug(string calldata slug) external view override returns (uint256) {
    return _missionIdBySlugHash[keccak256(bytes(slug))];
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

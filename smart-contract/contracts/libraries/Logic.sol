// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol';
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@khronus/time-cog/contracts/src/KhronusTimeCog.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol';
import 'hardhat/console.sol';
import './DataTypes.sol';

library Logic {
  uint8 internal constant MAX_HANDLE_LENGTH = 31;

  error Claimed();
  error ContainsInvalidChars();
  error Expired();
  error InvalidLength();
  error HandleTaken();
  error ChallengeTaken();
  error NotFound();
  error NotMatched();
  error NotOwner();
  error NotVerifiable();
  error NotReady();
  error NotVerifier();
  error NotWhitelisted();
  error SecurityViolated();
  error SignatureExpired();
  error SignatureInvalid();
  error SlugTaken();

  function isValidChallenges(DataTypes.BatchVerifyData calldata vars) public pure returns (bool) {
    uint256 profileCount = vars.profileIds.length;
    bytes memory challengesBytesArray = bytes(vars.challenges);

    if (
      !((challengesBytesArray.length % 43) == 0 &&
        challengesBytesArray.length >= 43 &&
        uint256(challengesBytesArray.length / 43) == profileCount)
    ) revert InvalidLength();
    return true;
  }

  function canBatchVerify(
    DataTypes.BatchVerifyData calldata vars,
    mapping(uint256 => mapping(uint256 => DataTypes.MissionStruct)) storage _missionByIdByProfile,
    mapping(bytes32 => uint256) storage _missionIdByChallengeHash
  ) public view {
    uint256 profileCount = vars.profileIds.length;
    bytes memory challengesBytesArray = bytes(vars.challenges);
    isValidChallenges(vars);
    bytes memory tempChallengeBytes = new bytes(43);
    for (uint256 i = 0; i < profileCount; ++i) {
      for (uint256 j = 0; j < 43; ++j) {
        tempChallengeBytes[j] = challengesBytesArray[j + (i * 43)];
      }
      bytes32 hash = keccak256(tempChallengeBytes);
      uint256 missionId = getMissionIdByChallengeHash(hash, _missionIdByChallengeHash);
      uint256 profileId = vars.profileIds[i];

      if (_missionByIdByProfile[profileId][missionId].starttime == 0) revert NotFound();
      if (_missionByIdByProfile[profileId][missionId].verifier != vars.sender) revert NotVerifier();
      if (_missionByIdByProfile[profileId][missionId].state != DataTypes.State.completed)
        revert NotVerifiable();
      if (_missionByIdByProfile[profileId][missionId].challengeHash != hash) revert NotMatched();
    }
  }

  function batchVerify(
    bytes32 digest,
    address owner,
    bytes calldata signature,
    uint256 deadline,
    DataTypes.BatchVerifyData calldata vars,
    mapping(uint256 => mapping(uint256 => DataTypes.MissionStruct)) storage _missionByIdByProfile,
    mapping(bytes32 => uint256) storage _missionIdByChallengeHash
  )
    public
    view
    returns (
      address[] memory,
      uint256[] memory,
      uint256[] memory
    )
  {
    validateSignature(digest, owner, signature, deadline);
    uint256 profileCount = vars.profileIds.length;
    bytes memory challengesBytesArray = bytes(vars.challenges);
    isValidChallenges(vars);
    uint256[] memory _missionIds = new uint256[](profileCount);
    address[] memory _owners = new address[](profileCount);
    uint256[] memory _tokenIds = new uint256[](profileCount);
    bytes memory tempChallengeBytes = new bytes(43);
    for (uint256 i = 0; i < profileCount; ++i) {
      for (uint256 j = 0; j < 43; ++j) {
        tempChallengeBytes[j] = challengesBytesArray[j + (i * 43)];
      }
      bytes32 hash = keccak256(tempChallengeBytes);
      uint256 missionId = getMissionIdByChallengeHash(hash, _missionIdByChallengeHash);
      uint256 profileId = vars.profileIds[i];

      if (_missionByIdByProfile[profileId][missionId].starttime == 0) revert NotFound();
      if (_missionByIdByProfile[profileId][missionId].verifier != vars.sender) revert NotVerifier();
      if (_missionByIdByProfile[profileId][missionId].state != DataTypes.State.completed)
        revert NotVerifiable();
      if (_missionByIdByProfile[profileId][missionId].challengeHash != hash) revert NotMatched();

      _owners[i] = _missionByIdByProfile[profileId][missionId].owner;
      _tokenIds[i] = _missionByIdByProfile[profileId][missionId].tokenId;
      _missionIds[i] = missionId;
    }
    return (_owners, _tokenIds, _missionIds);
  }

  function canAbortOrComplete(
    uint256 profileId,
    uint256 missionId,
    bool check, // check Expiry boolean
    mapping(uint256 => mapping(uint256 => DataTypes.MissionStruct)) storage _missionByIdByProfile
  ) public view {
    if (_missionByIdByProfile[profileId][missionId].starttime == 0) revert NotFound();
    if (_missionByIdByProfile[profileId][missionId].state != DataTypes.State.nftDeposited)
      revert NotReady();
    if (check == true && _missionByIdByProfile[profileId][missionId].endtime < block.timestamp)
      revert Expired();
  }

  function canClaimProfileWithRevert(
    mapping(address => bool) storage claimed,
    address owner,
    bytes32[] calldata proof,
    string calldata handle,
    bytes32 merkleroot,
    mapping(bytes32 => uint256) storage _profileIdByHandleHash
  ) public view {
    if (claimed[owner]) revert Claimed();
    if (!MerkleProof.verify(proof, merkleroot, keccak256(abi.encodePacked(owner))))
      revert NotWhitelisted();
    validateHandleOrSlug(handle);
    if (_profileIdByHandleHash[keccak256(bytes(handle))] != 0) revert HandleTaken();
  }

  function canClaimProfile(
    mapping(address => bool) storage claimed,
    address claimer,
    bytes32[] calldata proof,
    string calldata handle,
    bytes32 merkleroot,
    mapping(bytes32 => uint256) storage _profileIdByHandleHash
  ) public view returns (bool) {
    return
      !claimed[claimer] &&
      (MerkleProof.verify(proof, merkleroot, keccak256(abi.encodePacked(claimer)))) &&
      (_profileIdByHandleHash[keccak256(bytes(handle))] == 0);
  }

  function canVerifyOrFail(
    uint256 profileId,
    uint256 missionId,
    address sender,
    mapping(uint256 => mapping(uint256 => DataTypes.MissionStruct)) storage _missionByIdByProfile
  ) public view {
    if (_missionByIdByProfile[profileId][missionId].starttime == 0) revert NotFound();
    if (_missionByIdByProfile[profileId][missionId].verifier != sender) revert NotVerifier();
    if (_missionByIdByProfile[profileId][missionId].state != DataTypes.State.completed)
      revert NotVerifiable();
  }

  function completeMission(
    uint256 profileId,
    uint256 missionId,
    string calldata challenge,
    address owner,
    mapping(uint256 => mapping(uint256 => DataTypes.MissionStruct)) storage _missionByIdByProfile,
    mapping(bytes32 => uint256) storage _missionIdByChallengeHash,
    mapping(bytes32 => uint256) storage _profileIdByChallengeHash,
    mapping(address => uint256) storage sigNonces
  ) public returns (address, bytes32) {
    // check right length
    if (bytes(challenge).length != 43) revert InvalidLength();
    canAbortOrComplete(profileId, missionId, true, _missionByIdByProfile);
    isChallengeAvailable(challenge, _missionIdByChallengeHash);

    sigNonces[owner]++;

    bytes32 challengeHash = keccak256(bytes(challenge));
    _missionByIdByProfile[profileId][missionId].state = DataTypes.State.completed;
    _missionByIdByProfile[profileId][missionId].challengeHash = challengeHash;
    _missionIdByChallengeHash[challengeHash] = missionId;
    _profileIdByChallengeHash[challengeHash] = profileId;

    return (_missionByIdByProfile[profileId][missionId].verifier, challengeHash);
  }

  function createProfile(
    mapping(address => bool) storage claimed,
    address owner,
    string calldata handle,
    uint256 profileId,
    mapping(bytes32 => uint256) storage _profileIdByHandleHash,
    mapping(uint256 => DataTypes.ProfileStruct) storage _profileById,
    mapping(address => uint256) storage _profileIdByAddress
  ) external {
    _profileIdByHandleHash[keccak256(bytes(handle))] = profileId;
    _profileById[profileId].handle = handle;
    _profileById[profileId].owner = owner;
    _profileIdByAddress[owner] = profileId;

    claimed[owner] = true;
  }

  function getMissionIdByChallengeHash(
    bytes32 hash,
    mapping(bytes32 => uint256) storage _missionIdByChallengeHash
  ) public view returns (uint256) {
    uint256 missionId = _missionIdByChallengeHash[hash];
    if (missionId == 0) revert NotFound();
    return missionId;
  }

  function getTokenUri(
    uint256 profileId,
    uint256 missionId,
    address missionNFT,
    mapping(uint256 => mapping(uint256 => DataTypes.MissionStruct)) storage _missionByIdByProfile
  ) internal view returns (string memory) {
    string memory uri = (_missionByIdByProfile[profileId][missionId].state ==
      DataTypes.State.aborted ||
      _missionByIdByProfile[profileId][missionId].state == DataTypes.State.failed ||
      _missionByIdByProfile[profileId][missionId].tokenId == 0)
      ? ''
      : IERC721Metadata(missionNFT).tokenURI(_missionByIdByProfile[profileId][missionId].tokenId);
    return uri;
  }

  function isChallengeAvailable(
    string calldata challenge,
    mapping(bytes32 => uint256) storage _missionIdByChallengeHash
  ) public view {
    if (_missionIdByChallengeHash[keccak256(bytes(challenge))] != 0) revert ChallengeTaken();
  }

  function isSlugAvailable(
    string calldata slug,
    mapping(bytes32 => uint256) storage _missionIdBySlugHash
  ) internal view {
    if (_missionIdBySlugHash[keccak256(bytes(slug))] != 0) revert SlugTaken();
  }

  function missionByChallenge(
    string calldata challenge,
    address missionNFT,
    mapping(uint256 => mapping(uint256 => DataTypes.MissionStruct)) storage _missionByIdByProfile,
    mapping(bytes32 => uint256) storage _missionIdByChallengeHash,
    mapping(bytes32 => uint256) storage _profileIdByChallengeHash
  )
    public
    view
    returns (
      DataTypes.MissionStruct memory,
      uint256,
      string memory
    )
  {
    bytes32 challengeHash = keccak256(bytes(challenge));
    uint256 profileId = _profileIdByChallengeHash[challengeHash];
    uint256 missionId = _missionIdByChallengeHash[challengeHash];
    string memory uri = getTokenUri(profileId, missionId, missionNFT, _missionByIdByProfile);
    return (_missionByIdByProfile[profileId][missionId], missionId, uri);
  }

  function missionById(
    uint256 profileId,
    uint256 missionId,
    address missionNFT,
    mapping(uint256 => mapping(uint256 => DataTypes.MissionStruct)) storage _missionByIdByProfile
  )
    public
    view
    returns (
      DataTypes.MissionStruct memory,
      uint256,
      string memory
    )
  {
    string memory uri = getTokenUri(profileId, missionId, missionNFT, _missionByIdByProfile);
    return (_missionByIdByProfile[profileId][missionId], missionId, uri);
  }

  function startMission(
    DataTypes.startMissionData calldata vars,
    mapping(uint256 => mapping(uint256 => DataTypes.MissionStruct)) storage _missionByIdByProfile,
    mapping(bytes32 => uint256) storage _missionIdBySlugHash
  ) public returns (uint256) {
    _missionIdBySlugHash[keccak256(bytes(vars.slug))] = vars.missionId;
    _missionByIdByProfile[vars.profileId][vars.missionId].owner = vars.owner;
    _missionByIdByProfile[vars.profileId][vars.missionId].profileId = vars.profileId;
    _missionByIdByProfile[vars.profileId][vars.missionId].tokenId = vars.tokenId;
    _missionByIdByProfile[vars.profileId][vars.missionId].creator = vars.creator;
    _missionByIdByProfile[vars.profileId][vars.missionId].verifier = vars.verifier;
    _missionByIdByProfile[vars.profileId][vars.missionId].starttime = KhronusTimeCog.addMinutes(
      block.timestamp,
      0
    );
    uint256 endtime = KhronusTimeCog.addMinutes(block.timestamp, vars.minutesToExpire);
    _missionByIdByProfile[vars.profileId][vars.missionId].endtime = endtime;
    _missionByIdByProfile[vars.profileId][vars.missionId].state = DataTypes.State.nftDeposited;

    return endtime;
  }

  function validateHandleOrSlug(string calldata handle) internal pure {
    bytes memory byteHandle = bytes(handle);
    if (byteHandle.length == 0 || byteHandle.length > MAX_HANDLE_LENGTH) revert InvalidLength();

    uint256 byteHandleLength = byteHandle.length;
    for (uint256 i = 0; i < byteHandleLength; ) {
      if (
        (byteHandle[i] < '0' ||
          byteHandle[i] > 'z' ||
          (byteHandle[i] > '9' && byteHandle[i] < 'a')) &&
        byteHandle[i] != '.' &&
        byteHandle[i] != '-' &&
        byteHandle[i] != '_'
      ) revert ContainsInvalidChars();
      unchecked {
        ++i;
      }
    }
  }

  function validateSignature(
    bytes32 digest,
    address owner,
    bytes calldata signature,
    uint256 deadline
  ) public view returns (bool) {
    if (deadline < block.timestamp) revert SignatureExpired();
    address recoveredAddress = ECDSA.recover(digest, signature);
    if (
      owner != recoveredAddress || !SignatureChecker.isValidSignatureNow(owner, digest, signature)
    ) revert SignatureInvalid();
    return true;
  }

  function validationStart(
    bytes32 digest,
    address owner,
    bytes calldata signature,
    uint256 deadline,
    string calldata slug,
    mapping(bytes32 => uint256) storage _missionIdBySlugHash
  ) public view {
    validateSignature(digest, owner, signature, deadline);
    validateHandleOrSlug(slug);
    isSlugAvailable(slug, _missionIdBySlugHash);
  }

  function validationVerify(
    bytes32 digest,
    address owner,
    bytes calldata signature,
    uint256 deadline,
    string calldata challenge
  ) public view returns (bytes32) {
    // check right length
    bytes memory challengeBytesArray = bytes(challenge);
    if (challengeBytesArray.length != 43) revert InvalidLength();
    bytes32 hash = keccak256(challengeBytesArray);
    validateSignature(digest, owner, signature, deadline);
    return hash;
  }
}

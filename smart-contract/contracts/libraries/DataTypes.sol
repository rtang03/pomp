// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/**
 * @title DataTypes
 * @author Pomp Protocol
 *
 * @notice A standard library of data types used throughout the Pomp Protocol.
 */
library DataTypes {
  /**
   * @notice An enum containing the different states the protocol can be in, limiting certain actions.
   *
   * @param Unpaused The fully unpaused state.
   * @param Paused The fully paused state.
   */
  enum ProtocolState {
    Unpaused,
    Paused
  }

  enum State {
    nftDeposited,
    aborted,
    completed,
    verified,
    failed
  }

  /**
   * @notice Mission
   *
   * @param owner Address of mission creator
   * @param profileId Profile identity
   * @param missionId Mission identity
   * @param verifier Address of verifier
   * @param starttime Mission start time (in second)
   * @param endtime Mission expiry time (in second)
   * @param challengeHash Challenge hash
   * @param state Mission state
   */
  struct MissionStruct {
    address owner;
    uint256 profileId;
    uint256 tokenId;
    address verifier;
    uint256 starttime;
    uint256 endtime;
    bytes32 challengeHash;
    State state;
    address creator;
  }

  /**
   * @notice Profile
   *
   * @param missionCount number of missions of profile started
   * @param handle Profile handle, max-32 lowercase alphanumeric chars
   * @param owner Address of profile owner
   */
  struct ProfileStruct {
    uint256 missionCount;
    string handle;
    address owner;
  }

  /**
   * @notice Argument to abort mission with EIP-712 signature
   *
   * @param profileId Profile identity
   * @param missionId Mission identity
   * @param signature The signature to reconstruct an EIP-712 typed data signature
   * @param deadline The signature's deadline to reconstruct an EIP-712 typed data signature
   */
  struct AbortWithSigData {
    uint256 profileId;
    uint256 missionId;
    bytes signature;
    uint256 deadline;
  }

  /**
   * @notice Argument to complete mission with EIP-712 signature
   *
   * @param profileId Profile identity
   * @param missionId Mission identity
   * @param challenge Challenge issued by verifier. Usually obtained via out-of-band process
   * @param signature The signature to reconstruct an EIP-712 typed data signature
   * @param deadline The signature's deadline to reconstruct an EIP-712 typed data signature
   */
  struct CompleteWithSigData {
    uint256 profileId;
    uint256 missionId;
    string challenge;
    bytes signature;
    uint256 deadline;
  }

  /**
   * @notice Argument to complete mission with EIP-712 signature
   *
   * @param profileId Profile identity
   * @param challenge Challenge previously issued by verifier
   * @param reason The reason to fail this mission
   * @param signature The signature to reconstruct an EIP-712 typed data signature
   * @param deadline The signature's deadline to reconstruct an EIP-712 typed data signature
   */
  struct FailWithSigData {
    uint256 profileId;
    string challenge;
    uint256 reason;
    bytes signature;
    uint256 deadline;
  }

  /**
   * @notice Argument to start mission with EIP-712 signature
   *
   * @param profileId Profile identity
   * @param slug The Slug of the mission
   * @param contentURI The contentURI for missionNFT
   * @param minutesToExpire Number of minutes to expire
   * @param verifier Address of the verifier
   * @param signature The signature to reconstruct an EIP-712 typed data signature
   * @param deadline The signature's deadline to reconstruct an EIP-712 typed data signature
   */
  struct StartWithSigData {
    uint256 profileId;
    string slug;
    string contentURI;
    uint256 minutesToExpire;
    address creator;
    address verifier;
    bytes signature;
    uint256 deadline;
  }

  /**
   * @notice Argument to verify mission with EIP-712 signature
   *
   * @param profileId Profile identity
   * @param challenge Challenge previously issued by verifier
   * @param signature The signature to reconstruct an EIP-712 typed data signature
   * @param deadline The signature's deadline to reconstruct an EIP-712 typed data signature
   */
  struct VerifyWithSigData {
    uint256 profileId;
    string challenge;
    bytes signature;
    uint256 deadline;
  }

  struct CanBatchVerifyData {
    uint256[] profileIds;
    string challenges;
  }

  struct BatchVerifyWithSigData {
    uint256[] profileIds;
    string challenges;
    bytes signature;
    uint256 deadline;
  }

  struct BatchVerifyData {
    uint256[] profileIds;
    string challenges;
    address sender;
  }

  struct startMissionData {
    uint256 profileId;
    uint256 tokenId;
    string slug;
    uint256 minutesToExpire;
    address creator;
    address verifier;
    address owner;
    uint256 missionId;
  }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

library Errors {
  error ContainsInvalidChars();
  error Expired();
  error InvalidLength();
  error HandleTaken();
  error NotFound();
  error NotOwner();
  error NotVerifiable();
  error NotReady();
  error NotVerifier();
  error NotWhitelisted();
  error SecurityViolated();
  error SignatureExpired();
  error SignatureInvalid();
  error SlugTaken();
}

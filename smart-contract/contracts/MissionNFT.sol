// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';
import '@openzeppelin/contracts/token/common/ERC2981.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import 'hardhat/console.sol';
import './interfaces/IMissionNFT.sol';

contract MissionNFT is
  ERC721,
  ERC2981,
  ERC721URIStorage,
  ERC721Enumerable,
  AccessControl,
  EIP712,
  IMissionNFT
{
  using Counters for Counters.Counter;

  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

  Counters.Counter private _tokenIdCounter;

  constructor() ERC721('MissionNFT', 'MISS') EIP712('MissionNFT', '1') {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(MINTER_ROLE, msg.sender);
    _tokenIdCounter.increment();
  }

  /// @inheritdoc IMissionNFT
  function burn(uint256 tokenId) external {
    //solhint-disable-next-line max-line-length
    require(
      _isApprovedOrOwner(_msgSender(), tokenId),
      'ERC721: caller is not token owner nor approved'
    );
    _burn(tokenId);
  }

  /// @inheritdoc IMissionNFT
  function safeMint(
    address to,
    string memory uri,
    address royaltyRecipient,
    uint96 royaltyValue
  ) external onlyRole(MINTER_ROLE) returns (uint256) {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, uri);
    if (royaltyValue > 0) {
      _setTokenRoyalty(tokenId, royaltyRecipient, royaltyValue);
    }
    return tokenId;
  }

  /// @inheritdoc IMissionNFT
  function oneToManyTransfer(
    address from,
    address[] memory toAddresses,
    uint256[] memory tokenIds
  ) external onlyRole(MINTER_ROLE) {
    for (uint256 i = 0; i < toAddresses.length; ++i) {
      _safeTransfer(from, toAddresses[i], tokenIds[i], '');
    }
  }

  function _baseURI() internal pure override returns (string memory) {
    return '';
  }

  // The following functions are overrides required by Solidity.
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function _afterTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override(ERC721) {
    super._afterTokenTransfer(from, to, tokenId);
  }

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
    _resetTokenRoyalty(tokenId);
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
  {
    return super.tokenURI(tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721Enumerable, AccessControl, ERC2981)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}

# mission-web3

Proof of Concept (powered by Web3)

## Introduction

This is an experimental attempt to mimic the Mission center, so that Web3 specific functionalities are added.
There are two areas, (1) business functions, and (2) technical implementation, for better scalability, and improved user experience.

### About Dapp Technical Implementation

- Authentication via Metamask (done)
- Mobile web / Nextjs (done)
- Deploy via Vercel (done)
- Firebase hosting / functions / database (done)
- Using Moralis V2 (Done)
- Deploy smart contract via Hardhat (Done)
- Indexer: Query with subGraph (Not done) 2Wk
- Extend to using WalletConnect (Done)
- SEO (Done)
- Responsive mobile web (Done)

### About Dapp Business Features

- UI for Creator (Done)
- UI for Verifier (Fail / Verify Mission) (Done)
- UI for Player (Start / Abort Mission) (Done)
- UI - Achievement page (Done)
- UI - Mission Start page (Done)
- Leaderboard (not done)
- Admin UI for governor (Not done)

### About smart contract

- Upgradeable Contract (done)
- Whitelisted profile (done)
- Role-based access control (done)
- Escrow missionNFT during the mission journey (done)
- Start / Abort / Complete / Verify / Fail mission (done)
- Voting function (done) / Governor contract (not done)
- Cancel mission by operator (not done)
- Whitelisted verifier (not done)
- Gasless Relayer (not done) 2Wk
- Batch verify (not done)
- Deploy to OpenZeppelin Defender (not done) 1Wk

### Accreditation

Source code in this repo comes from below material.

- https://blog.jarrodwatts.com/the-ultimate-guide-to-firebase-with-nextjs
- https://github.com/MoralisWeb3/demo-apps/tree/main/nextjs_moralis_auth
- https://github.com/vercel/next.js/tree/canary/examples/with-firebase
- https://github.com/CSFrequency/react-firebase-hooks/tree/v4.0.2/firestore#full-example
- https://vercel.com/guides/nextjs-multi-tenant-application
- https://github.com/premshree/use-pagination-firestore
- https://docs.alchemy.com/docs/nft-minter
- https://hardhat.org/tutorial/testing-contracts
- https://github.com/scaffold-eth/scaffold-eth/tree/master/packages/subgraph
- https://github.com/zenbitETH/Voyage
- https://github.com/rtang03/solarpunks
- https://github.com/rtang03/madseed
- https://github.com/poap-xyz/poap-contracts/blob/master/contracts/Poap.sol
- https://github.com/enjin/erc-1155/tree/master/contracts
- https://github.com/0xsequence/erc-1155/blob/master/src/contracts/tokens/ERC1155/ERC1155.sol
- https://www.youtube.com/watch?v=PekgJfLb6ak
- https://github.com/Envoy-VC/Smart-Contracts/blob/main/Merkel%20Tree%20Whitelist/Merkeltree.sol
- https://github.com/OpenZeppelin/workshops/blob/master/06-nft-merkle-drop/test/4-ERC721MerkleDrop.test.js
- https://medium.com/codex/creating-an-nft-whitelist-using-merkle-tree-proofs-9668fbe72cb4
- https://soliditydeveloper.com/ecrecover
- https://medium.com/coinmonks/nft-based-escrow-service-business-logic-3dfc5be85a03
- https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
- https://betterprogramming.pub/absence-of-null-in-solidity-bc80ce5e5b09
- https://github.com/leerob/on-demand-isr
- https://github.com/OpenZeppelin/openzeppelin-upgrades/tree/master#readme
- https://support.google.com/analytics/answer/9234069
- https://og-playground.vercel.app
- https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples
- https://github.com/vercel/examples/blob/main/edge-functions/vercel-og-nextjs/pages/index.tsx
- https://github.com/dievardump/EIP2981-implementation

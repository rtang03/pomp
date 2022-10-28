# Proof of Mission Protocol

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat verify --list-networks
npx hardhat deploy
npx hardhat deploy --network goerli
npx hardhat deploy --network mumbai
```

## Goerli deployment

```text
# Logic
npx hardhat verify --network goerli 0x60011d26C3c1C4b7f5d9B7c1ad7fd9448Ba4150
https://goerli.etherscan.io/address/0x60011d26C3c1C4b7f5d9B7c1ad7fd9448Ba4150b#code

# MissionNFT
npx hardhat verify --network goerli 0xafEC3b28bf567fb768B71586EA72541781Bd3c13
https://goerli.etherscan.io/address/0xafEC3b28bf567fb768B71586EA72541781Bd3c13#code

# MissionModule
npx hardhat verify --network goerli 0x78D9281b576a1e0c5C78D211c77B167982665785 "0xb2f669cca65ca0c3e70364a07c311aa86fc030a5" "0xafEC3b28bf567fb768B71586EA72541781Bd3c13"
https://goerli.etherscan.io/address/0x78D9281b576a1e0c5C78D211c77B167982665785#code

# ProfileModule
npx hardhat verify --network goerli 0x979fA725C2d9c2E714FA4D1454cc1238c8e821a1 "0xb2f669cca65ca0c3e70364a07c311aa86fc030a5" "0xfafb88ed6846a0c4529b0bbc4ece3c1a2c48221dbc31e3823c3a2cf12efcf745"
https://goerli.etherscan.io/address/0x979fA725C2d9c2E714FA4D1454cc1238c8e821a1#code

# PompHub
npx hardhat verify --network goerli 0x29304eB5af3f73dA6E52F1dFfa88E3EA39E0e2da
https://goerli.etherscan.io/address/0x29304eB5af3f73dA6E52F1dFfa88E3EA39E0e2da#code

# PompHubProxy
npx hardhat verify --network goerli 0xB2F669cca65cA0c3e70364A07c311Aa86fc030a5
```

## Mumbai Deployment

```text
# Logic
npx hardhat verify --network mumbai 0xAB44eA3d6fcdc99400620fbD30949A302361681B
https://mumbai.polygonscan.com/address/0xAB44eA3d6fcdc99400620fbD30949A302361681B#code

# MissionNFT
npx hardhat verify --network mumbai 0xffcb591E32524e48775751b6B73c1D88E6A043ea
https://mumbai.polygonscan.com/address/0xffcb591E32524e48775751b6B73c1D88E6A043ea#code

# MissionModule
npx hardhat verify --network mumbai 0x025c3382BE9424668cA13245dE1D70Bdd2646318 "0x32C1c9547EBcD3C450bc73C88c1679F56db513FE" "0xffcb591E32524e48775751b6B73c1D88E6A043ea"
https://mumbai.polygonscan.com/address/0x025c3382BE9424668cA13245dE1D70Bdd2646318#code

# ProfileModule
npx hardhat verify --network mumbai 0xe7f334100bED322A74821B2c3235882e358977e8 "0x32C1c9547EBcD3C450bc73C88c1679F56db513FE" "0xfafb88ed6846a0c4529b0bbc4ece3c1a2c48221dbc31e3823c3a2cf12efcf745"
https://mumbai.polygonscan.com/address/0xe7f334100bED322A74821B2c3235882e358977e8#code

# PompHub
npx hardhat verify --network mumbai 0x8E068af024b1Afd2E8c1BC7ec8514F411289DB6d
https://mumbai.polygonscan.com/address/0x8E068af024b1Afd2E8c1BC7ec8514F411289DB6d#code

# PompHubProxy
npx hardhat verify --network mumbai 0x32C1c9547EBcD3C450bc73C88c1679F56db513FE
https://mumbai.polygonscan.com/address/0x05032b9637ebf1f3c003cc4b310653791efcd783#code
```

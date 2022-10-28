const fs = require('fs');

const contractPath1 = `artifacts/contracts/PompHub.sol/PompHub.json`;
const obj1 = JSON.parse(fs.readFileSync(contractPath1).toString());
const size1 = Buffer.byteLength(obj1.deployedBytecode, 'utf8') / 2;

console.log('PompHub contract size is', size1);

const contractPath2 = `artifacts/contracts/libraries/Logic.sol/Logic.json`;
const obj2 = JSON.parse(fs.readFileSync(contractPath2).toString());
const size2 = Buffer.byteLength(obj2.deployedBytecode, 'utf8') / 2;

console.log('Logic contract size is', size2);

const contractPath3 = `artifacts/contracts/MissionNFT.sol/MissionNFT.json`;
const obj3 = JSON.parse(fs.readFileSync(contractPath3).toString());
const size3 = Buffer.byteLength(obj3.deployedBytecode, 'utf8') / 2;

console.log('MissionNFT contract size is', size3);

const contractPath4 = `artifacts/contracts/ProfileModule.sol/ProfileModule.json`;
const obj4 = JSON.parse(fs.readFileSync(contractPath4).toString());
const size4 = Buffer.byteLength(obj4.deployedBytecode, 'utf8') / 2;

console.log('ProfileModule contract size is', size4);

const contractPath5 = `artifacts/contracts/MissionModule.sol/MissionModule.json`;
const obj5 = JSON.parse(fs.readFileSync(contractPath5).toString());
const size5 = Buffer.byteLength(obj5.deployedBytecode, 'utf8') / 2;

console.log('MissionModule contract size is', size5);

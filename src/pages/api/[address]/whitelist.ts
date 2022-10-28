import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { whitelistAccount } from 'smart-contract/utils/whitelistAccount';

const tree = new MerkleTree(
  whitelistAccount.map((account) => keccak256(account)),
  keccak256,
  { sortPairs: true }
);

const getProof = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;
  if (!address) res.status(400).json({ error: 'invalid address' });

  const rootHash = tree.getHexRoot();
  const proof = tree.getHexProof(keccak256(address as string));
  const verified = tree.verify(proof, keccak256(address as string), rootHash);

  res.status(200).json({ proof, rootHash, verified });
};

export default getProof;

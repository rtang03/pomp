import { getAddress } from '@ethersproject/address';

export const isAddress = (value: string) => {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
};

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export const shortenAddress = (address: string, chars = 4) => {
  const parsed = isAddress(address);
  if (!parsed) {
    console.warn('cannot parse address');
    // throw Error(`Invalid 'address' parameter '${address}'.`);
    return address;
  }
  return `${parsed.substring(0, chars)}...${parsed.substring(address.length - chars)}`;
};

export const shortenTx = (txHash: string, chars = 4) => {
  return `${txHash.substring(0, chars)}...${txHash.substring(txHash.length - chars)}`;
};

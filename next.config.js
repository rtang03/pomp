module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      'ipfs.infura.io',
      'avatar.tobi.sh',
      'ipfs.io',
      'infura-ipfs.io',
      'madseed.infura-ipfs.io'
    ]
  },
  env: {
    GIT_COMMIT_REF: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
    GIT_COMMIT_SHA: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  }
};

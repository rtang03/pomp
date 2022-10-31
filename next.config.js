module.exports = {
  swcMinify: false,
  reactStrictMode: true,
  images: {
    domains: [
      'avatars.dicebear.com',
      'gateway.moralisipfs.com',
      'ipfs.infura.io',
      'i3al5fdaammr.usemoralis.com',
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

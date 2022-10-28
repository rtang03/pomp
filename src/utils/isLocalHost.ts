export const isLocalHost: () => boolean = () => {
  const origin =
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  return origin.includes('localhost');
};

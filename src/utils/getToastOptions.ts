export const getToastOptions = (resolvedTheme: any) => ({
  style: {
    background: resolvedTheme === 'dark' ? '#18181B' : '',
    color: resolvedTheme === 'dark' ? '#fff' : ''
  },
  success: {
    className: 'border border-green-500',
    iconTheme: {
      primary: '#10B981',
      secondary: 'white'
    }
  },
  error: {
    className: 'border border-red-500',
    iconTheme: {
      primary: '#EF4444',
      secondary: 'white'
    }
  },
  loading: { className: 'border border-gray-300' }
});

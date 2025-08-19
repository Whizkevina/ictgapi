// Application configuration
export const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://ftapp.lfcww.org/api',
    endpoints: {
      livestream: process.env.REACT_APP_LIVESTREAM_ENDPOINT || '/Dashboard/togglelivestreamstate',
      updateLivestream: process.env.REACT_APP_UPDATE_LIVESTREAM_ENDPOINT || '/Dashboard/UpdateAppSetting'
    },
    pollingInterval: parseInt(process.env.REACT_APP_POLLING_INTERVAL) || 30000,
    timeout: 10000 // 10 seconds timeout
  },
  
  app: {
    name: 'Winners ICT Group Live Service',
    version: '1.0.0',
    storageKeys: {
      membership: 'isMember',
      preferences: 'userPreferences'
    }
  },
  
  ui: {
    defaultVideoHeight: '400px',
    breakpoints: {
      mobile: '480px',
      tablet: '768px',
      desktop: '1024px'
    }
  }
};

export default config;

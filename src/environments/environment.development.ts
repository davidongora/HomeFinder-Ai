export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: process.env['apiKey'] || 'dummy-key-for-build',
    authDomain: process.env['authDomain'] || 'dummy-key-for-build',
    projectId: process.env['projectId'] || 'dummy-key-for-build',
    storageBucket: process.env['storageBucket'] || 'dummy-key-for-build',
    messagingSenderId: process.env['messagingSenderId'] || 'dummy-key-for-build',
    appId: process.env['appId'] || 'dummy-key-for-build',
    measurementId: process.env['measurementId'] || 'dummy-key-for-build'
  },
};

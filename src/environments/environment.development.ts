export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: process.env['FIREBASE_API_KEY'] || 'dummy-key-for-build',
    authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || 'dummy-key-for-build',
    projectId: process.env['FIREBASE_PROJECT_ID'] || 'dummy-key-for-build',
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || 'dummy-key-for-build',
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || 'dummy-key-for-build',
    appId: process.env['FIREBASE_APP_ID'] || 'dummy-key-for-build',
    measurementId: process.env['FIREBASE_MEASUREMENT_ID'] || 'dummy-key-for-build'
  },
};

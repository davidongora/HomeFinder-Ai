export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] || 'dummy-key-for-build',
    authDomain: process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] || 'dummy-key-for-build',
    projectId: process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] || 'dummy-key-for-build',
    storageBucket: process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] || 'dummy-key-for-build',
    messagingSenderId: process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] || 'dummy-key-for-build',
    appId: process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] || 'dummy-key-for-build',
    measurementId: process.env['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'] || 'dummy-key-for-build'
  },
};

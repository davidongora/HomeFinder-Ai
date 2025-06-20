const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');
const templatePath = path.resolve(__dirname, '../src/environments/environment.template.ts');

require('dotenv').config();

let template = fs.readFileSync(templatePath, 'utf-8');
console.log('reading Firebase environment.prod.ts generated');

template = template
    .replace('__API_KEY__', process.env["NEXT_PUBLIC_FIREBASE_API_KEY"] || '')
    .replace('__AUTH_DOMAIN__', process.env["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"] || '')
    .replace('__PROJECT_ID__', process.env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"] || '')
    .replace('__STORAGE_BUCKET__', process.env["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"] || '')
    .replace('__MESSAGING_SENDER_ID__', process.env["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"] || '')
    .replace('__APP_ID__', process.env["NEXT_PUBLIC_FIREBASE_APP_ID"] || '')
    .replace('__MEASUREMENT_ID__', process.env["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"] || '');


fs.writeFileSync(envPath, template);
console.log('✅ Firebase environment.prod.ts generated');

console.log('📦 Firebase Config:', {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
    // ... log the rest if needed
  });
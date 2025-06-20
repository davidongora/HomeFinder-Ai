const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');
const templatePath = path.resolve(__dirname, '../src/environments/environment.template.ts');

let template = fs.readFileSync(templatePath, 'utf-8');
console.log('reading Firebase environment.prod.ts generated');

template = template
    .replace('__API_KEY__', process.env["apiKey"] || '')
    .replace('__AUTH_DOMAIN__', process.env["authDomain"] || '')
    .replace('__PROJECT_ID__', process.env["projectId"] || '')
    .replace('__STORAGE_BUCKET__', process.env["storageBucket"] || '')
    .replace('__MESSAGING_SENDER_ID__', process.env["messagingSenderId"] || '')
    .replace('__APP_ID__', process.env["appId"] || '')
    .replace('__MEASUREMENT_ID__', process.env["measurementId"] || '');

fs.writeFileSync(envPath, template);
console.log('✅ Firebase environment.prod.ts generated');

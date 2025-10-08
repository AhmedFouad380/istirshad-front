// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyDTJVV6W1RfD27lzmOj-0Q3AoxaOdcpB1g',
  authDomain: 'gadeer-7cdeb.firebaseapp.com',
  projectId: 'gadeer-7cdeb',
  storageBucket: 'gadeer-7cdeb.appspot.com',
  messagingSenderId: '460471858459',
  appId: '1:460471858459:web:de6b7b248502a2f14bcfbe',
  measurementId: 'G-B8NVFCPH0B',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };

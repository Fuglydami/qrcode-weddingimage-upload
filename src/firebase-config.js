import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

import { getFirestore } from '@firebase/firestore';
import { getStorage } from 'firebase/storage';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAUhUbdo8o2u515i3kJ7_ALrA0EzhbyS3g',
  authDomain: 'titilope-wedding.firebaseapp.com',
  projectId: 'titilope-wedding',
  storageBucket: 'titilope-wedding.appspot.com',
  messagingSenderId: '299170936354',
  appId: '1:299170936354:web:3c1580fb64a038740f3c7b',
  measurementId: 'G-KB15MN15CM',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);

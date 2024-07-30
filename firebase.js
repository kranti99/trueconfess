import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,  // Include if you use Analytics
};

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: 'AIzaSyBbToOjCe7zeehUfuAYI0ZmrWNLBzXvh7I',
//   authDomain: 'trueconfess-a0af3.firebaseapp.com',
//   projectId: 'trueconfess-a0af3',
//   storageBucket: 'trueconfess-a0af3.appspot.com',
//   messagingSenderId: '903564003097',
//   appId: '1:903564003097:web:73985dc9269d98a1c2e788'
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_sIBj-oyL6egT7tuseyHRE0ArGYGGCjM",
  authDomain: "bitebook-app-c772d.firebaseapp.com",
  projectId: "bitebook-app-c772d",
  storageBucket: "bitebook-app-c772d.firebasestorage.app",
  messagingSenderId: "352388507787",
  appId: "1:352388507787:web:6d8b2cf08137ade0918c8e",
  measurementId: "G-NMWTC5NBQC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
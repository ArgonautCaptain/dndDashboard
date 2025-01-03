import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDXC7BKn4yKFsXSYYzfeSeAMjZtqnM-lro",
    authDomain: "dnd-dashboard-64a3c.firebaseapp.com",
    projectId: "dnd-dashboard-64a3c",
    storageBucket: "dnd-dashboard-64a3c.firebasestorage.app",
    messagingSenderId: "611313030995",
    appId: "1:611313030995:web:615752c86aee9e40c673a6"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

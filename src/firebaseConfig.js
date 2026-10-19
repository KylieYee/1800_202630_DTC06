import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3bV3d5gJi13sE8254Htfe6WBym8_W40s",
  authDomain: "dtc06-6cd4a.firebaseapp.com",
  projectId: "dtc06-6cd4a",
  storageBucket: "dtc06-6cd4a.firebasestorage.app",
  messagingSenderId: "329082851644",
  appId: "1:329082851644:web:289933e35d1f16b0968e39"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
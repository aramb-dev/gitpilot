/**
 * Authentication Service for GitPilot
 * Handles GitHub OAuth authentication via Firebase
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration
let app;
let auth;
let db;

/**
 * Initialize Firebase services
 * @returns {Object} Firebase services
 */
export const initializeFirebase = () => {
  if (!app) {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth, db };
};

// GitHub OAuth provider setup
const githubProvider = new GithubAuthProvider();
// Adding scopes from your knowledge base
githubProvider.addScope('user:email');
githubProvider.addScope('repo');
githubProvider.addScope('delete_repo');
githubProvider.addScope('admin:org');

/**
 * Sign in with GitHub using Firebase Authentication
 * @returns {Promise<Object>} User credentials and GitHub token
 */
export const signInWithGitHub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);

    // Get GitHub OAuth access token
    const credential = GithubAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // Store GitHub token in Firestore
    if (token) {
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        lastLogin: new Date(),
      }, { merge: true });

      // Store token in private subcollection (as seen in your Firebase Functions implementation)
      const tokenRef = doc(db, 'users', result.user.uid, 'private', 'github');
      await setDoc(tokenRef, {
        accessToken: token,
        scope: credential.scope,
        updatedAt: new Date()
      });
    }

    return {
      user: result.user,
      githubToken: token
    };
  } catch (error) {
    console.error('Error signing in with GitHub:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>} Current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
};

/**
 * Get GitHub token for the current user
 * @param {string} uid User ID (optional, uses current user if not provided)
 * @returns {Promise<string|null>} GitHub token or null if not found
 */
export const getGitHubToken = async (uid) => {
  try {
    if (!uid) {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      uid = currentUser.uid;
    }

    // Get token from private subcollection
    const tokenDoc = await getDoc(doc(db, 'users', uid, 'private', 'github'));
    if (tokenDoc.exists()) {
      return tokenDoc.data().accessToken;
    }
    return null;
  } catch (error) {
    console.error('Error getting GitHub token:', error);
    return null;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Revoke GitHub access for the current user
 * Uses Firebase Function from the implementation in your knowledge base
 * @returns {Promise<void>}
 */
export const revokeGitHubAccess = async () => {
  try {
    const functions = getFunctions();
    const revokeGitHubAccessFn = httpsCallable(functions, 'revokeGitHubAccess');
    await revokeGitHubAccessFn();
  } catch (error) {
    console.error('Error revoking GitHub access:', error);
    throw error;
  }
};

// Initialize on import
initializeFirebase();

export { auth, db };

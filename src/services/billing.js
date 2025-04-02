/**
 * Billing Service for GitPilot
 * Handles subscription management and payment processing
 */

import { db } from './auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { PLANS } from '../utils/constants';

/**
 * Get a user's subscription information
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Subscription information
 */
export const getUserSubscription = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return { plan: PLANS.FREE };
    }

    const userData = userDoc.data();

    // If the user has an active subscription
    if (userData.subscription && userData.subscription.status === 'active') {
      return {
        plan: userData.subscription.plan === 'pro' ? PLANS.PRO : PLANS.FREE,
        ...userData.subscription
      };
    }

    return { plan: PLANS.FREE };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return { plan: PLANS.FREE, error: error.message };
  }
};

/**
 * Create a checkout session for subscription upgrade
 * @param {string} uid - User ID
 * @param {string} planId - Plan ID
 * @returns {Promise<Object>} Checkout session details
 */
export const createCheckoutSession = async (uid, planId) => {
  try {
    // Call Firebase Function to create a Stripe checkout session
    const functions = getFunctions();
    const createCheckoutSessionFn = httpsCallable(functions, 'createCheckoutSession');

    const result = await createCheckoutSessionFn({
      planId,
      successUrl: window.location.origin + '/billing?success=true',
      cancelUrl: window.location.origin + '/billing?canceled=true'
    });

    return result.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
};

/**
 * Cancel a user's subscription
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} Success status
 */
export const cancelSubscription = async (uid) => {
  try {
    const functions = getFunctions();
    const cancelSubscriptionFn = httpsCallable(functions, 'cancelSubscription');

    const result = await cancelSubscriptionFn();
    return result.data.success;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
};

/**
 * Get user's payment history
 * @param {string} uid - User ID
 * @returns {Promise<Array>} Payment history
 */
export const getPaymentHistory = async (uid) => {
  try {
    const paymentsQuery = query(
      collection(db, 'users', uid, 'payments'),
      where('status', '==', 'succeeded')
    );

    const paymentsSnapshot = await getDocs(paymentsQuery);
    const payments = [];

    paymentsSnapshot.forEach((doc) => {
      payments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return payments.sort((a, b) => b.created - a.created);
  } catch (error) {
    console.error('Error getting payment history:', error);
    return [];
  }
};

/**
 * Check if a user can access organization features
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} Whether user can access org features
 */
export const canAccessOrgFeatures = async (uid) => {
  try {
    const subscription = await getUserSubscription(uid);
    return subscription.plan.orgReposAccess === true;
  } catch (error) {
    console.error('Error checking organization access:', error);
    return false;
  }
};

/**
 * Get available subscription plans
 * @returns {Array} Available subscription plans
 */
export const getAvailablePlans = () => {
  return [
    {
      id: 'free',
      name: 'Free',
      description: 'For individual developers',
      price: 0,
      features: PLANS.FREE.features,
      recommended: false
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For teams and organizations',
      price: 12, // $12/month
      priceId: 'price_abc123', // Stripe price ID in real implementation
      features: PLANS.PRO.features,
      recommended: true
    }
  ];
};

export default {
  getUserSubscription,
  createCheckoutSession,
  cancelSubscription,
  getPaymentHistory,
  canAccessOrgFeatures,
  getAvailablePlans
};

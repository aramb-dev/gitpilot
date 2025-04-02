import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  Shield,
  Zap,
  Users,
  Archive,
  Filter,
  Gift,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import {
  getUserSubscription,
  getAvailablePlans,
  createCheckoutSession,
  cancelSubscription,
  getPaymentHistory,
} from "../services/billing";
import { useNavigate, useLocation } from "react-router-dom";

const BillingPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Check for status messages from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("success") === "true") {
      setStatusMessage({
        type: "success",
        title: "Subscription Updated",
        message:
          "Your subscription has been successfully updated. You now have access to all Pro features.",
      });
    } else if (params.get("canceled") === "true") {
      setStatusMessage({
        type: "warning",
        title: "Checkout Canceled",
        message:
          "You have canceled the checkout process. Your subscription remains unchanged.",
      });
    }

    // Clear URL parameters
    if (params.has("success") || params.has("canceled")) {
      navigate("/billing", { replace: true });
    }
  }, [location, navigate]);

  // Fetch subscription, plans, and payment history
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const [userSubscription, availablePlans, payments] = await Promise.all([
          getUserSubscription(user.uid),
          getAvailablePlans(),
          getPaymentHistory(user.uid),
        ]);

        setSubscription(userSubscription);
        setPlans(availablePlans);
        setPaymentHistory(payments);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        setStatusMessage({
          type: "error",
          title: "Data Loading Error",
          message:
            error.message ||
            "Failed to load billing information. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user]);

  // Handle plan upgrade
  const handleUpgrade = async (planId) => {
    if (!user) return;

    setUpgradeLoading(true);
    try {
      const checkoutSession = await createCheckoutSession(user.uid, planId);

      // Redirect to Stripe checkout
      window.location.href = checkoutSession.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setStatusMessage({
        type: "error",
        title: "Checkout Error",
        message:
          error.message ||
          "Failed to start checkout process. Please try again later.",
      });
      setUpgradeLoading(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!user) return;

    if (
      window.confirm(
        "Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period."
      )
    ) {
      setCancelLoading(true);
      try {
        await cancelSubscription(user.uid);

        // Refetch subscription data
        const userSubscription = await getUserSubscription(user.uid);
        setSubscription(userSubscription);

        setStatusMessage({
          type: "success",
          title: "Subscription Canceled",
          message:
            "Your subscription has been canceled. You will continue to have access until the end of your current billing period.",
        });
      } catch (error) {
        console.error("Error canceling subscription:", error);
        setStatusMessage({
          type: "error",
          title: "Cancellation Error",
          message:
            error.message ||
            "Failed to cancel subscription. Please try again later.",
        });
      } finally {
        setCancelLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Get current plan information
  const currentPlan = subscription?.plan || { name: "Free", features: [] };
  const isProPlan = currentPlan.name === "Pro";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Billing & Subscription
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your subscription plan and payment details
        </p>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            statusMessage.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900"
              : statusMessage.type === "error"
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900"
                : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {statusMessage.type === "success" ? (
                <CheckCircle
                  className={`h-5 w-5 text-green-400 dark:text-green-500`}
                />
              ) : (
                <AlertTriangle
                  className={`h-5 w-5 ${
                    statusMessage.type === "error"
                      ? "text-red-400 dark:text-red-500"
                      : "text-yellow-400 dark:text-yellow-500"
                  }`}
                />
              )}
            </div>
            <div className="ml-3">
              <h3
                className={`text-sm font-medium ${
                  statusMessage.type === "success"
                    ? "text-green-800 dark:text-green-400"
                    : statusMessage.type === "error"
                      ? "text-red-800 dark:text-red-400"
                      : "text-yellow-800 dark:text-yellow-400"
                }`}
              >
                {statusMessage.title}
              </h3>
              <div
                className={`mt-2 text-sm ${
                  statusMessage.type === "success"
                    ? "text-green-700 dark:text-green-300"
                    : statusMessage.type === "error"
                      ? "text-red-700 dark:text-red-300"
                      : "text-yellow-700 dark:text-yellow-300"
                }`}
              >
                <p>{statusMessage.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Current Subscription
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isProPlan
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {currentPlan.name} Plan
                  </span>

                  {subscription?.status === "trialing" && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Trial
                    </span>
                  )}

                  {subscription?.cancelAtPeriodEnd && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Canceling
                    </span>
                  )}
                </div>

                {subscription?.cancelAtPeriodEnd ? (
                  <span className="text-slate-600 dark:text-slate-400 text-sm mt-2 md:mt-0">
                    Access until {formatDate(subscription.currentPeriodEnd)}
                  </span>
                ) : isProPlan ? (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelLoading}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium mt-2 md:mt-0 disabled:opacity-50"
                  >
                    {cancelLoading ? "Processing..." : "Cancel Subscription"}
                  </button>
                ) : null}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-md font-medium text-slate-900 dark:text-white mb-4">
                  Features included in your plan:
                </h3>

                <ul className="space-y-3">
                  {currentPlan.features &&
                    currentPlan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-slate-600 dark:text-slate-300"
                      >
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Available Plans
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = plan.name === currentPlan.name;
                const isPro = plan.id === "pro";

                return (
                  <div
                    key={plan.id}
                    className={`rounded-lg border p-6 ${
                      isPro
                        ? "border-2 border-purple-500 dark:border-purple-400"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {isPro && (
                      <div className="absolute -top-3 right-4 bg-purple-500 text-white text-xs font-medium py-1 px-3 rounded-full">
                        Recommended
                      </div>
                    )}

                    <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      {plan.description}
                    </p>

                    <p className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                      ${plan.price}
                      <span className="text-lg font-normal text-slate-500 dark:text-slate-400">
                        /month
                      </span>
                    </p>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-2 px-4 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={
                          upgradeLoading || (plan.price === 0 && isProPlan)
                        }
                        className={`w-full py-2 px-4 rounded-md ${
                          isPro
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-primary hover:bg-primary/90 text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {upgradeLoading
                          ? "Processing..."
                          : `Upgrade to ${plan.name}`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Payment History
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-600 dark:text-slate-400">
                No payment history found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(payment.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        {payment.description || `${payment.plan} Plan`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        ${(payment.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;

import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "../../common/Card";
import { Button } from "../../common/Button";
import { Shield, AlertTriangle, Clock, CreditCard } from "lucide-react";
import { Badge } from "../../common/Badge";
import { Alert } from "../../common/Alert";

/**
 * Subscription details component
 * Shows current subscription status and information
 */
const SubscriptionDetails = ({
  subscription,
  onManageSubscription,
  onCancelSubscription,
  loading,
}) => {
  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No active subscription found. Choose a plan to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    plan,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    paymentMethod,
    trialEndsAt,
  } = subscription;

  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isTrialing = status === "trialing";
  const isActive = status === "active";
  const isCancelled = cancelAtPeriodEnd;
  const isPro = plan.name === "Pro";

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              Current Subscription
              {isActive && !isCancelled && (
                <Badge variant="success" className="ml-2">
                  Active
                </Badge>
              )}
              {isTrialing && (
                <Badge variant="warning" className="ml-2">
                  Trial
                </Badge>
              )}
              {isCancelled && (
                <Badge variant="destructive" className="ml-2">
                  Cancelling
                </Badge>
              )}
            </CardTitle>
          </div>

          {isPro && <Shield className="h-6 w-6 text-primary" />}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{plan.name} Plan</h3>
            {isPro ? (
              <p className="text-muted-foreground">
                Full access to organization repository management and advanced
                features.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Basic access to personal repository management.
              </p>
            )}
          </div>

          {isTrialing && (
            <Alert variant="warning">
              <div className="flex items-start">
                <Clock className="h-4 w-4 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">
                    Your trial ends on {formatDate(trialEndsAt)}
                  </p>
                  <p className="text-sm">
                    After your trial ends, you'll be automatically subscribed to
                    the Pro plan.
                  </p>
                </div>
              </div>
            </Alert>
          )}

          {isCancelled && (
            <Alert variant="warning">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">
                    Your subscription will end on {formatDate(currentPeriodEnd)}
                  </p>
                  <p className="text-sm">
                    You'll lose access to Pro features after this date. You can
                    reactivate your subscription anytime before it expires.
                  </p>
                </div>
              </div>
            </Alert>
          )}

          <div className="border-t pt-4">
            <ul className="space-y-2">
              {currentPeriodEnd && (
                <li className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Next billing date:
                  </span>
                  <span className="font-medium">
                    {formatDate(currentPeriodEnd)}
                  </span>
                </li>
              )}
              {paymentMethod && (
                <li className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment method:</span>
                  <span className="font-medium flex items-center">
                    <CreditCard className="h-3 w-3 mr-1" />
                    {paymentMethod.brand} •••• {paymentMethod.last4}
                  </span>
                </li>
              )}
              <li className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">${plan.price}/month</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button
          onClick={onManageSubscription}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Manage Subscription
        </Button>

        {(isActive || isTrialing) && !isCancelled && (
          <Button
            variant="outline"
            className="w-full sm:w-auto text-destructive hover:bg-destructive/10"
            onClick={onCancelSubscription}
            disabled={loading}
          >
            Cancel Subscription
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionDetails;

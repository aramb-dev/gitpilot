import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "../../common/Card";
import { Button } from "../../common/Button";
import { Check, AlertCircle } from "lucide-react";
import { Badge } from "../../common/Badge";

/**
 * Individual plan card component
 * Displays details for a single subscription plan
 */
const PlanCard = ({
  plan,
  isCurrentPlan,
  isPopular,
  onSelectPlan,
  disabled,
}) => {
  const { id, name, description, price, features, priceId } = plan;
  const isPro = id === "pro";

  return (
    <Card
      className={`relative overflow-hidden ${isPro ? "border-primary border-2" : ""}`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0">
          <Badge
            variant="primary"
            className="rounded-bl-md rounded-tr-md rounded-br-none rounded-tl-none px-3 py-1"
          >
            Popular
          </Badge>
        </div>
      )}

      <CardHeader className="pb-0">
        <div className="mb-1">
          <span className="text-2xl font-bold">${price}</span>
          {price > 0 && (
            <span className="text-muted-foreground ml-1">/month</span>
          )}
        </div>
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>

      <CardContent className="pt-6">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 pt-2">
        {isCurrentPlan ? (
          <Button disabled className="w-full" variant="outline">
            Current Plan
          </Button>
        ) : (
          <Button
            onClick={() => onSelectPlan(plan)}
            className={`w-full ${isPro ? "bg-primary" : ""}`}
            disabled={disabled}
          >
            {price === 0 ? "Get Started" : "Upgrade"}
          </Button>
        )}

        {isPro && (
          <p className="text-xs text-center text-muted-foreground">
            Includes access to all organization features
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlanCard;

import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../common/Card";
import { Badge } from "../../common/Badge";
import { Download, Receipt } from "lucide-react";
import { Button } from "../../common/Button";

/**
 * Payment history component
 * Displays a list of past payments/invoices
 */
const PaymentHistory = ({ payments = [], loading }) => {
  // Format amount to currency
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100); // Stripe amounts are in cents
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payment history found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium">Date</th>
                  <th className="text-left p-3 text-sm font-medium">Invoice</th>
                  <th className="text-left p-3 text-sm font-medium">Amount</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-right p-3 text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="p-3 text-sm">
                      {formatDate(payment.created)}
                    </td>
                    <td className="p-3 text-sm">{payment.id}</td>
                    <td className="p-3 text-sm font-medium">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="p-3 text-sm">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="p-3 text-sm text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(payment.receiptUrl, "_blank")
                        }
                        disabled={!payment.receiptUrl}
                        className="h-8 w-8 p-0"
                        title="Download Receipt"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  let variant = "default";

  switch (status) {
    case "succeeded":
      variant = "success";
      break;
    case "pending":
      variant = "warning";
      break;
    case "failed":
      variant = "destructive";
      break;
    default:
      variant = "secondary";
  }

  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default PaymentHistory;

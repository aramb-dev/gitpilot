import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../../common/Card';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { Alert } from '../../common/Alert';
import { CreditCard, Lock, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * Checkout form for upgrading to paid plan
 */
const CheckoutForm = ({ selectedPlan, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    // Format expiry date with slash
    if (name === 'cardExpiry') {
      const formatted = value
        .replace(/\D/g, '') // Remove non-digits
        .replace(/^(\d{2})(\d)/, '$1/$2'); // Add slash after first 2 digits
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Name on card is required';
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(formData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number format';
    }

    if (!formData.cardExpiry.trim()) {
      newErrors.cardExpiry = 'Expiration date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Invalid expiration date format';
    }

    if (!formData.cardCvc.trim()) {
      newErrors.cardCvc = 'CVC is required';
    } else if (!/^\d{3,4}$/.test(formData.cardCvc)) {
      newErrors.cardCvc = 'Invalid CVC';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!selectedPlan) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex justify-center">
            <p className="text-muted-foreground">No plan selected for checkout</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade to {selectedPlan.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-medium">Order Summary</h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  <span className="font-medium">{selectedPlan.name} Plan</span>
                </div>
                <span className="font-bold">${selectedPlan.price}/month</span>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <p>Includes:</p>
                <ul className="mt-2 space-y-1 pl-5 list-disc">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-medium">Payment Information</h3>

            <div>
              <label htmlFor="cardName" className="block text-sm font-medium mb-1">
                Name on Card
              </label>
              <Input
                id="cardName"
                name="cardName"
                type="text"
                placeholder="John Doe"
                value={formData.cardName}
                onChange={handleChange}
                error={errors.cardName}
              />
            </div>

            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                Card Number
              </label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  maxLength={19} // 16 digits + 3 spaces
                  error={errors.cardNumber}
                />
                <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardExpiry" className="block text-sm font-medium mb-1">
                  Expiration Date
                </label>
                <Input
                  id="cardExpiry"
                  name="cardExpiry"
                  type="text"
                  placeholder="MM/YY"
                  value={formData.cardExpiry}
                  onChange={handleChange}
                  maxLength={5} // MM/YY format
                  error={errors.cardExpiry}
                />
              </div>

              <div>
                <label htmlFor="cardCvc" className="block text-sm font-medium mb-1">
                  CVC
                </label>
                <Input
                  id="cardCvc"
                  name="cardCvc"
                  type="text"
                  placeholder="123"
                  value={formData.cardCvc}
                  onChange={handleChange}
                  maxLength={4} // CVC is 3-4 digits
                  error={errors.cardCvc}
                />
              </div>
            </div>
          </div>

          <Alert variant="info">
            <div className="flex items-start">
              <Lock className="h-4 w-4 mr-2 mt-0.5" />
              <div>
                <p className="text-sm">
                  Your payment information is securely processed and encrypted. GitPilot does not store your full card details.
                </p>
              </div>
            </div>
          </Alert>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <span className="mr-2">Processing...</span>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent"></div>
            </>
          ) : (
            <>
              Subscribe to {selectedPlan.name} Plan - ${selectedPlan.price}/month
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CheckoutForm;

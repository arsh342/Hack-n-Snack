import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  status?: string;
}

export interface PaymentConfirmation {
  paymentIntentId: string;
  status: string;
  error?: string;
}

/**
 * Creates a PaymentIntent on the server
 * @param amount Amount in smallest currency unit (cents/paise)
 * @param metadata Optional metadata for the payment
 */
export const createPaymentIntent = async (
  amount: number,
  metadata?: Record<string, string>
): Promise<string> => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        amount,
        metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    const data: PaymentIntentResponse = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error instanceof Error ? error : new Error('Unknown error creating payment intent');
  }
};

/**
 * Confirms a payment on the server (optional, if you need server-side confirmation)
 * @param paymentIntentId The ID of the payment intent to confirm
 * @param paymentMethodId The ID of the payment method used
 */
export const confirmPayment = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<PaymentConfirmation> => {
  try {
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment confirmation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error instanceof Error ? error : new Error('Unknown error confirming payment');
  }
};

/**
 * Gets the Stripe instance
 * @returns Promise resolving to Stripe instance or null
 */
export const getStripe = async (): Promise<Stripe | null> => {
  try {
    return await stripePromise;
  } catch (error) {
    console.error('Error loading Stripe:', error);
    return null;
  }
};

/**
 * Optional: Cancels a PaymentIntent
 * @param paymentIntentId The ID of the payment intent to cancel
 */
export const cancelPaymentIntent = async (paymentIntentId: string): Promise<void> => {
  try {
    const response = await fetch('/api/cancel-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel payment intent');
    }
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    throw error;
  }
};
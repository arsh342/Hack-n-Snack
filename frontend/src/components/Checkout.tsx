// Checkout.tsx
"use client";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createOrder } from "../lib/supabase";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Layout from "./layout/Layout";
import { createPaymentIntent } from '../lib/stripe'; // Adjust path

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { cart = [], userId } = location.state || {};
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = cart.length > 0 
    ? cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    : 0;

  const handleOnlinePayment = async () => {
    if (!userId) {
      toast.error("Please log in to make a payment");
      return;
    }

    if (!stripe || !elements) {
      toast.error("Payment system not loaded");
      return;
    }

    setIsProcessing(true);
    try {
      const clientSecret = await createPaymentIntent(totalAmount * 100, {
        userId,
        orderDate: new Date().toISOString(),
      });

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card input not found");
      }

      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: "User",
            email: "user@example.com",
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === "succeeded") {
        await createOrder({
          payment_id: paymentIntent.id,
          amount: totalAmount,
          items: cart,
          user_id: userId,
        }, cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })));
        
        toast.success("Order placed successfully");
        navigate('/', { state: { orderPlaced: true, amount: totalAmount } });
      } else {
        throw new Error("Payment not completed successfully");
      }
    } catch (error) {
      toast.error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashOnDelivery = async () => {
    if (!userId) {
      toast.error("Please log in to place an order");
      return;
    }

    setIsProcessing(true);
    try {
      await createOrder({
        payment_method: "cash",
        amount: totalAmount,
        items: cart,
        user_id: userId,
      }, cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })));
      toast.success("Order placed successfully");
      navigate('/', { state: { orderPlaced: true, amount: totalAmount } });
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (selectedPaymentMethod === "online") await handleOnlinePayment();
    else if (selectedPaymentMethod === "cod") await handleCashOnDelivery();
  };

  if (!cart || cart.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">Your cart is empty. Please add items to proceed with checkout.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="bg-white shadow rounded-lg p-6">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-gray-500">x {item.quantity}</p>
                  </div>
                  <p>₹{(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={selectedPaymentMethod === "online"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="form-radio h-5 w-5 text-indigo-600"
                    disabled={isProcessing}
                  />
                  <span>Pay Online</span>
                </label>
                {selectedPaymentMethod === "online" && (
                  <div className="mt-4 p-4 border rounded-md">
                    <CardElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                        disabled: isProcessing,
                      }}
                    />
                  </div>
                )}
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={selectedPaymentMethod === "cod"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="form-radio h-5 w-5 text-indigo-600"
                    disabled={isProcessing}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                disabled={!selectedPaymentMethod || isProcessing}
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Wrap the component with Stripe Elements
const CheckoutWithStripe = () => {
  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  );
};

export default CheckoutWithStripe;
"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

type PayPalCheckoutProps = {
  clientId: string;
  bookingId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

/**
 * PayPal Smart Payment Buttons for booking deposit or full payment.
 *
 * @param props - PayPal client id, booking id, and callbacks
 */
export function PayPalCheckout({
  clientId,
  bookingId,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect" }}
        createOrder={async () => {
          const response = await fetch("/api/payments/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId }),
          });

          if (!response.ok) {
            const body = (await response.json()) as { error?: string };
            throw new Error(body.error ?? "Could not start PayPal checkout");
          }

          const body = (await response.json()) as { orderId: string };
          return body.orderId;
        }}
        onApprove={async (data) => {
          const response = await fetch("/api/payments/paypal/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderID,
              bookingId,
            }),
          });

          if (!response.ok) {
            const body = (await response.json()) as { error?: string };
            onError(body.error ?? "Payment capture failed");
            return;
          }

          onSuccess();
        }}
        onError={() => onError("PayPal checkout failed. Please try again.")}
      />
    </PayPalScriptProvider>
  );
}

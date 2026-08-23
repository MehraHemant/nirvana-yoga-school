import { centsToUsd } from "@/lib/booking/pricing";

type PayPalTokenResponse = {
  access_token: string;
};

type PayPalOrderResponse = {
  id: string;
  status: string;
};

/**
 * Resolve PayPal mode from PAYPAL_MODE or PAYPAL_SANDBOX.
 */
function resolvePayPalMode(): string {
  if (process.env.PAYPAL_MODE) {
    return process.env.PAYPAL_MODE;
  }
  const sandbox = process.env.PAYPAL_SANDBOX;
  if (sandbox === "true") return "sandbox";
  if (sandbox === "false") return "live";
  return "sandbox";
}

/**
 * Resolve PayPal API base URL from environment mode.
 */
function getPayPalApiBase(): string {
  const mode = resolvePayPalMode();
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

/**
 * Public PayPal client id — NEXT_PUBLIC_* with fallback to server id.
 */
function getPayPalPublicClientId(): string | null {
  return (
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ??
    process.env.PAYPAL_CLIENT_ID ??
    null
  );
}

/**
 * Read PayPal server credentials from environment.
 */
function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal is not configured");
  }
  return { clientId, clientSecret };
}

/**
 * Obtain a PayPal OAuth access token.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getPayPalCredentials();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with PayPal");
  }

  const body = (await response.json()) as PayPalTokenResponse;
  return body.access_token;
}

/**
 * Create a PayPal checkout order for a booking deposit or full payment.
 *
 * @param params - Booking id, amount in cents, and description
 */
export async function createPayPalOrder(params: {
  bookingId: string;
  totalPayNowCents: number;
  description: string;
}): Promise<PayPalOrderResponse> {
  const token = await getPayPalAccessToken();
  const amount = centsToUsd(params.totalPayNowCents).toFixed(2);

  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.bookingId,
          custom_id: params.bookingId,
          description: params.description,
          amount: {
            currency_code: "USD",
            value: amount,
          },
        },
      ],
      application_context: {
        brand_name: "Nirvana Yoga School",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create PayPal order");
  }

  return (await response.json()) as PayPalOrderResponse;
}

/**
 * Capture funds for an approved PayPal order.
 *
 * @param orderId - PayPal order id
 */
export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to capture PayPal payment");
  }

  return response.json() as Promise<{
    id: string;
    status: string;
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{ id: string; status: string }>;
      };
    }>;
  }>;
}

/**
 * Public PayPal client id for the browser SDK.
 */
export function getPayPalClientId(): string | null {
  return getPayPalPublicClientId();
}

/**
 * Whether PayPal credentials are configured.
 */
export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      getPayPalPublicClientId(),
  );
}

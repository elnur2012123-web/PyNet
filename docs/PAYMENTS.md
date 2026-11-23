# Payments: Lemon Squeezy

## Why Lemon Squeezy

PyNest is built to be run from Uzbekistan and to sell to students worldwide.

- **Stripe** does not accept businesses registered in Uzbekistan.
- **Lemon Squeezy** is a *merchant of record*. It sells to customers worldwide, handles VAT and sales tax, invoices and card/PayPal payments, and its supported-countries page lists Uzbekistan for bank payouts (PayPal payouts cover 200+ countries).
- **Paddle** is a similar merchant of record and is a good fallback if your account is approved there.
- **Payme / Click** are popular for local UZS card payments (Uzcard/Humo). Consider adding one as a second provider if most of your learners pay with local cards. The webhook handler and `subscriptions.payment_provider` column are provider-agnostic.

Check each provider's current country list before launching. These lists change.

## Setup

1. Create a store at https://app.lemonsqueezy.com.
2. Create a product "PyNest" with **four subscription variants**:
   - Pro Monthly — $5 / month
   - Pro Yearly — $50 / year
   - Max Monthly — $20 / month
   - Max Yearly — $200 / year
3. **Settings → API**: create an API key → `LEMONSQUEEZY_API_KEY`. Your store ID → `LEMONSQUEEZY_STORE_ID`.
4. Copy each variant ID → `LEMONSQUEEZY_VARIANT_PRO_MONTHLY`, `…_PRO_YEARLY`, `…_MAX_MONTHLY`, `…_MAX_YEARLY`.
5. **Settings → Webhooks**: add `https://<your-domain>/api/billing/webhook`.
   - Set a signing secret → `LEMONSQUEEZY_WEBHOOK_SECRET`.
   - Enable these events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_resumed`, `subscription_expired`, `subscription_paused`, `subscription_unpaused`, `subscription_payment_success`, `subscription_payment_failed`.
6. Use test mode first, then switch to live keys.

## How it works

| Step | What happens |
|---|---|
| Upgrade | `POST /api/billing/checkout` creates a hosted checkout with `custom_data.user_id` and redirects the learner to it. |
| Activation | Lemon Squeezy calls `/api/billing/webhook`. The HMAC-SHA256 `X-Signature` is verified with a constant-time compare, then `subscriptions` is upserted with the service role. **This is the only code path that grants a paid plan.** |
| Change plan | `POST /api/billing/change` updates the variant through the API (prorated). The webhook then updates the database. |
| Cancel / resume | `POST /api/billing/cancel` and `/api/billing/change {resume:true}`. The plan stays active until `current_period_end`. |
| Expiry | `subscription_expired` → plan FREE. XP, achievements, lessons and leaderboard history are never removed. |
| Billing history | `subscription_payment_*` events are stored idempotently in `billing_events`. |
| Payment method / portal | Uses Lemon Squeezy's signed `update_payment_method` and `customer_portal` URLs from the webhook. |

If any credential is missing, `/api/billing/status` reports `configured: false`. The UI then shows a "Demo mode" notice and disables purchase buttons. No payment is ever simulated.

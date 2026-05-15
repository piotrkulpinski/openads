# OpenAds

## Waitlist (AutoSend)

The landing app adds waitlist signups to AutoSend via `POST /v1/contacts/email` (see [apps/landing/src/functions/subscribe.ts](apps/landing/src/functions/subscribe.ts)).

### Environment

| Variable | Description |
| --- | --- |
| `AUTOSEND_API_KEY` | AutoSend API key (`Authorization: Bearer …`) |
| `AUTOSEND_WAITLIST_LIST_ID` | List ID to attach waitlist contacts to |

Set these in local `.env` and in your hosting (e.g. Cloudflare Pages/Workers) for production.

## Stripe Connect

OpenAds uses Stripe Connect OAuth with Standard connected accounts. Publishers connect an existing Stripe account, ad subscriptions are created directly on that connected account, and OpenAds collects `STRIPE_PLATFORM_FEE_PERCENT` from each subscription invoice.

### Environment

| Variable | Description |
| --- | --- |
| `STRIPE_SECRET_KEY` | Platform Stripe secret key (`sk_test_…` / `sk_live_…`) |
| `STRIPE_CONNECT_CLIENT_ID` | Stripe Connect OAuth client ID (`ca_…`) |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | Signing secret for the Connect webhook endpoint (`whsec_…`) |
| `STRIPE_PLATFORM_FEE_PERCENT` | OpenAds application fee percent taken from each advertiser subscription |

### OAuth Redirect

In Stripe Dashboard, go to **Settings → Connect → Onboarding options → OAuth settings**.

Add these redirect URIs:

```text
http://localhost:5183/stripe/callback
https://your-app-domain.com/stripe/callback
```

Use the local URI for test mode and replace `your-app-domain.com` with the production app URL before going live. Copy the matching test/live client ID into `STRIPE_CONNECT_CLIENT_ID`.

### Connect Webhook

Create a webhook endpoint for **Connect / connected account events**. This must be a Connect webhook, not only a platform-account webhook.

Endpoint URLs:

```text
http://localhost:3001/webhooks/stripe
https://your-api-domain.com/webhooks/stripe
```

Subscribe to these events:

```text
account.updated
account.application.deauthorized
customer.subscription.created
customer.subscription.updated
customer.subscription.resumed
customer.subscription.paused
customer.subscription.deleted
```

Copy the endpoint signing secret into `STRIPE_CONNECT_WEBHOOK_SECRET`.

For local testing with Stripe CLI, forward connected-account events:

```bash
stripe listen --forward-connect-to localhost:3001/webhooks/stripe
```

Use the `whsec_…` printed by that command as `STRIPE_CONNECT_WEBHOOK_SECRET`.

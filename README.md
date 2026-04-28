# OpenAds

## Waitlist (AutoSend)

The landing app adds waitlist signups to AutoSend via `POST /v1/contacts/email` (see [apps/landing/src/functions/subscribe.ts](apps/landing/src/functions/subscribe.ts)).

### Environment

| Variable | Description |
| --- | --- |
| `AUTOSEND_API_KEY` | AutoSend API key (`Authorization: Bearer …`) |
| `AUTOSEND_WAITLIST_LIST_ID` | List ID to attach waitlist contacts to |

Set these in local `.env` and in your hosting (e.g. Cloudflare Pages/Workers) for production.

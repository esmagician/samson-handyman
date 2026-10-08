# Samson Handyman

Static site source for `www.samsonhandyman.com`.

Cloudflare Pages deploys this repository from the `main` branch with no build command and the repository root as the output directory.

Business details confirmed by Edvardas on 8 October 2026:

- Edvardas coordinates handymen, plumbers, painters and decorators, and carpenters.
- Customers include homeowners, landlords, letting and estate agencies, and local businesses.
- Small handyman and painting/decorating jobs start at £60 for up to one hour, including materials and travel within the listed service area. No VAT is added because the business is not VAT registered.
- Plumbing and larger jobs are quoted for their scope. Existing agency packages retain their separate prices and material terms.
- Public liability insurance is up to £2 million.
- High Wycombe visits are by arrangement; any travel cost there is agreed before booking.

Forms use FormSubmit and the existing business email. `assets/enquiry.js` provides the shared phone-or-email requirement, email reply handling and consent-based enquiry source fields. Keep a required phone field and optional email in the HTML as the no-JavaScript fallback. The shared script allows either contact method when JavaScript is available.

`script.js` serves the main templates; `assets/tracking.js` serves older pages. Keep confirmed-form conversion labels and submission-token checks consistent in both. A contact click is an expression of interest, not a confirmed call or booked job. Separate `contact_click` metadata identifies phone and WhatsApp interactions; existing Google Ads click conversions remain configured as before.

Before publishing, check:

- Phone-only and email-only enquiries, invalid/missing contact details, and optional photo uploads.
- No email autoresponse for a phone-only enquiry.
- Source fields appear only with measurement consent and clear when consent is withdrawn.
- A quote submission creates a unique thank-you token; opening or refreshing the thank-you page does not generate a duplicate lead.
- Canonicals, local links, JSON-LD and sitemap agree, including the dedicated `/plumbing-repairs/` page.
- Both page templates work on mobile, including navigation and privacy controls.

Assets have immutable cache headers. Change their version query strings in HTML (and the consent stylesheet version in `assets/consent.js`) whenever updating shared JavaScript or CSS.

GA4 uses the existing Samson Handyman property (`G-LPJCTMQJGN`). `assets/analytics.js` configures it once, only on the production apex/www hostname after measurement consent. It loads immediately after consent.js, before confirmed-enquiry events. Consent notice version 2026-10-08 refreshes older choices for the updated measurement description. Preview and localhost traffic is excluded from GA4.

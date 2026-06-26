# 🐾 Hound's Hearth — your dog-care portal

A complete, static affiliate site modeled on the Thrive Freeze "trusted-advisor" structure,
built for dogs using the pawTree product lineup — without ever naming pawTree (your
storefront `shop.pawtree.com/houndandhearth` is referred to only as "our trusted store").

## Deploy in 60 seconds (Netlify drag-drop)
1. Go to https://app.netlify.com → **Add new site → Deploy manually**.
2. Drag the **entire `houndshut` folder** onto the drop zone.
3. You'll get a live `*.netlify.app` URL instantly.
4. **Domain settings → Add a domain →** `houndshearth.com`, then point DNS as Netlify instructs.

Email signup + contact forms use **Netlify Forms** — they start working automatically once deployed on Netlify (find entries under Forms in your Netlify dashboard).

## What's inside (40 pages)
- **Home** — hero, shop-by-purpose, trust strip, featured products, symptom solutions, planner teaser, Scout advisor, testimonials, guides, email capture.
- **Shop hub** + 4 category pages (Food, Treats, Supplements, Grooming) + a **detail page for every product** (Learn more → internal page, Add to cart → your store).
- **Dog Planner** — working calorie/portion calculator (vet RER/MER math) + Pet Quiz CTA.
- **Solutions** — interactive symptom→product finder.
- **Ask Scout** — AI advisor page (Powered by Lucrovox).
- **Guides** — Ingredients 101, Feeding, Supplements, Grooming (real articles).
- **About, FAQ, Shipping & Returns, Contact, Affiliate Disclosure, Privacy, Terms, 404.**

## ⚠️ Swap these placeholders before/after launch
1. **Phone number** — currently `(000) 000-0000`. Find & replace across all files (and the `tel:+10000000000` link) with your real Lucrovox/Scout number.
2. **Pet Quiz link** — set to `shop.pawtree.com/houndandhearth/petprofile`. Open it once to confirm it resolves on your store; if your quiz path differs, find & replace.
3. **Prices** — representative of the pawTree lineup; confirm against your live store and adjust.
4. **Product deep-links** — "Add to cart" buttons all go to your store home (`shop.pawtree.com/houndandhearth`) so nothing 404s. To deep-link a specific product, replace that product page's store URL with the exact product URL from your store.
5. **Social links** — footer icons are `#`; add your Instagram/Facebook/YouTube/TikTok.
6. **Legal pages** — Privacy & Terms are solid templates; have them reviewed before launch.

## Editing
- Global look: `css/style.css`. Interactions/planner: `js/main.js`.
- Pages are plain HTML. To regenerate in bulk, the Python generators are in `_src/`
  (run `python3 _src/build.py && python3 _src/build2.py && python3 _src/build3.py`).

Brand wordmark: **Hound's Hearth**. Domain: **houndshearth.com**.

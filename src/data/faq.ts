// src/data/faq.ts
// The 10 landing FAQ items (used by the list AND the FAQPage JSON-LD, single source)

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Do you actually work with peptide and RUO brands?",
    a: "Yes. Peptide and RUO brands are our primary specialty, not a side category. We also build for hemp, botanical and kanna businesses, plus clinics and telehealth."
  },
  {
    q: "Can you build my store on Shopify?",
    a: "No, and you should not want us to. Shopify and Stripe restrict research peptides, and express checkout lets buyers skip the research-use step processors require. We build on WooCommerce or custom code you own."
  },
  {
    q: "My processor froze payouts. Can you help?",
    a: "Often, yes. We find out why it happened, rebuild the checkout and policies line by line, prepare a clean application and point you to providers that accept your category."
  },
  {
    q: "How fast can we actually launch?",
    a: "Most brand and store builds take 2 to 6 weeks. You get a written plan with a timeline within 48 hours of the first call. Apply for your processor early, since approval can take longer than the build."
  },
  {
    q: "Who owns the site, ad accounts and content?",
    a: "You do. Domains, store, code, content and data are set up in your name from day one. If we ever part ways, everything stays with you."
  },
  {
    q: "What does it cost?",
    a: "Fixed-scope pricing after the audit, so you know the number before we start. Single services or a full launch. We give you a realistic range on the first call."
  },
  {
    q: "I already have a store. Can you rebuild it?",
    a: "Yes. We audit what you have, keep what works and move your products, customers, wholesale accounts and affiliates to the new build."
  },
  {
    q: "Do you sell, source or ship product?",
    a: "No. We are a design and technology team. We do not manufacture, sell, source or ship any product."
  },
  {
    q: "Can you handle wholesale, affiliates and subscriptions?",
    a: "Yes. Wholesale pricing, affiliate tracking, subscriptions and admin, support and fulfilment portals are built into the store when you need them."
  },
  {
    q: "Do you also run marketing?",
    a: "Yes, as an add-on. Once the store is live and converting, we add peptide SEO, email and SMS, and Meta and TikTok ads written in RUO-correct language."
  }
];

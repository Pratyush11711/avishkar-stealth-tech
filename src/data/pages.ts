// Converted 1:1 from _source/tools/build_pages.py PAGES, NAMES and H2S

export interface PageFaq {
  q: string;
  a: string;
}

export interface ServiceCard {
  title: string;
  items: string[];
}

export interface IndustryPhoto {
  name: string;
  alt: string;
  caption: string;
}

export interface PageData {
  slug: string;
  kind: 'service' | 'industry' | 'legal';
  crumb: string;
  title: string;
  desc: string;
  eyebrow?: string;
  h1?: string;
  lead?: string;
  photo?: IndustryPhoto;
  card?: ServiceCard;
  tiles?: [string, string][];
  steps?: [string, string][];
  faq?: PageFaq[];
  related?: string[];
  body?: string;
}

export const NAMES: Record<string, string> = {
  'peptide-marketing-agency': 'Peptide &amp; RUO marketing',
  'peptide-brand-launch': 'Peptide brand launch',
  'peptide-websites': 'Peptide websites &amp; stores',
  'peptide-ads': 'Meta &amp; TikTok ads for peptides',
  'high-risk-payments': 'High-risk payment processing',
  'peptide-seo': 'Peptide SEO, email &amp; SMS',
  'hemp-marketing': 'Hemp &amp; botanical marketing',
  'kanna-marketing': 'Kanna',
  'clinics-telehealth': 'Clinics &amp; telehealth',
  'peptide-platforms': 'Back office: wholesale, affiliates &amp; subscriptions',
  'peptide-marketing': 'Marketing add-ons: SEO, email &amp; ads',
};

export const H2S: Record<string, [string, string, string]> = {
  'peptide-marketing-agency': ['Peptide marketing services', 'How we grow RUO brands', 'Peptide marketing questions'],
  'peptide-brand-launch': ['What a peptide brand launch includes', 'How we launch a peptide brand', 'Peptide brand launch questions'],
  'peptide-websites': ['Peptide website design that converts', 'How we build RUO stores', 'Peptide website questions'],
  'peptide-ads': ['Meta and TikTok ads for peptides', 'How we keep peptide ad accounts live', 'Peptide advertising questions'],
  'high-risk-payments': ['High-risk payment processing, handled', 'How we get peptide stores paid', 'High-risk payment questions'],
  'peptide-seo': ['What our peptide SEO covers', 'How peptide SEO compounds', 'Peptide SEO questions'],
  'hemp-marketing': ['Hemp and botanical marketing services', 'How we grow hemp brands', 'Hemp marketing questions'],
  'kanna-marketing': ['Kanna marketing', 'How we grow kanna brands', 'Kanna marketing questions'],
  'clinics-telehealth': ['Sites and stores for clinics', 'How a clinic site gets built', 'Clinics and telehealth questions'],
  'peptide-platforms': ['Back office for peptide stores', 'How we build your back office', 'Back office questions'],
  'peptide-marketing': ['Peptide marketing add-ons', 'How we add marketing', 'Marketing add-on questions'],
};

export const PAGES: PageData[] = [
  {
    slug: 'peptide-marketing-agency',
    kind: 'industry',
    crumb: 'Peptide &amp; RUO',
    title: 'Peptide Marketing Agency for RUO Brands | Stealth Tech',
    desc: 'Peptide marketing agency for RUO brands: compliant stores, Meta ads that stay live, high-risk payment processing and peptide SEO from one senior team.',
    eyebrow: 'Industry · Peptides &amp; RUO',
    h1: 'The peptide marketing agency <span class="acc-w">that stays when others walk.</span>',
    lead: 'Research peptide and RUO brands are our primary specialty, not a side category. Compliant stores, ad accounts that hold, payments that keep paying out and search that ranks, from first launch to scale.',
    photo: { name: 'ind-peptides', alt: 'Scientist working with research peptide vials in a lab', caption: 'Research · RUO' },
    tiles: [
      ['Compliant peptide stores', 'RUO-correct product pages, COA display and a checkout processors approve.'],
      ['Peptide ads that stay live', 'Meta and TikTok campaigns built around current policy, from properly warmed accounts.'],
      ['High-risk payments', 'Providers that accept research peptides, clean applications and a backup plan.'],
      ['Peptide SEO, email &amp; SMS', 'Search and owned channels no ad platform can switch off.'],
    ],
    steps: [
      ['Strategy call', '30 minutes on video. You tell us what is blocked; we tell you honestly whether we can fix it.'],
      ['Written plan in 48 hours', 'Site, ads, payments and search, with scope, timeline and one fixed price.'],
      ['Launch and scale', 'One senior team builds everything in parallel, then grows what works.'],
    ],
    faq: [
      { q: 'Do you really work with research peptide brands?', a: 'Yes. Peptide and RUO brands are our primary specialty. Most agencies decline the category; we built our process around it.' },
      { q: 'How do you market peptides without getting banned?', a: 'Every ad, landing page and product page is written in RUO-correct language with no health claims, run from properly warmed accounts with backups ready. Most bans start with copy, so that is where we start.' },
      { q: 'Do you sell, source or ship peptides?', a: 'No. We are a marketing and technology team. We do not manufacture, sell, source or ship any product.' },
    ],
    related: ['peptide-brand-launch', 'peptide-ads', 'peptide-seo'],
  },
  {
    slug: 'peptide-brand-launch',
    kind: 'service',
    crumb: 'Brand launch',
    title: 'Peptide Brand Launch Agency | Stealth Tech',
    desc: 'Launch a peptide or RUO brand in weeks: brand identity, compliant store, high-risk payments and first campaigns built in parallel by one senior team.',
    eyebrow: 'Service · Brand &amp; launch',
    h1: 'Launch a peptide brand in weeks, <span class="acc-w">not quarters.</span>',
    lead: 'Brand, store, payments and first campaigns built in parallel by one senior team. You get a written plan and a fixed price before anything starts.',
    card: { title: 'What you get', items: ['Brand identity and RUO-safe packaging copy', 'A compliance-first store ready to take orders', 'A payment setup matched to your category', 'First campaigns live from properly warmed accounts'] },
    tiles: [
      ['Identity', 'Name, logo, colours and a voice that reads premium without making claims.'],
      ['Store', 'Product pages, COA display and a checkout reviewed line by line.'],
      ['Payments', 'A provider that accepts your category and a clean application before your first order.'],
      ['Launch campaigns', 'Meta, TikTok and email set up around current policy from day one.'],
    ],
    steps: [
      ['Strategy call', '30 minutes on video. You tell us what you are building and where you are stuck.'],
      ['Written plan in 48 hours', 'Scope, timeline and one fixed price. Yours to keep, even if you do not hire us.'],
      ['Build and launch', 'Most full launches go live in 2 to 6 weeks, with weekly demos along the way.'],
    ],
    faq: [
      { q: 'How long does a peptide brand launch take?', a: 'Most full launches take 2 to 6 weeks. Your written plan includes the exact timeline.' },
      { q: 'Do I own everything you build?', a: 'Yes. Domains, store, ad accounts, content and data are set up in your name from day one.' },
      { q: 'Can you launch just one part?', a: 'Yes. Many brands start with the store or payments and add the rest later.' },
    ],
    related: ['peptide-websites', 'peptide-ads', 'high-risk-payments'],
  },
  {
    slug: 'peptide-websites',
    kind: 'service',
    crumb: 'Websites &amp; stores',
    title: 'Peptide Website Design &amp; Compliant Stores | Stealth Tech',
    desc: 'Compliance-first peptide and RUO websites that pass review and still sell: product pages buyers trust, COA display and a checkout processors approve.',
    eyebrow: 'Service · Websites &amp; stores',
    h1: 'Peptide websites that pass review <span class="acc-w">and still sell.</span>',
    lead: 'Compliance-first stores for peptide and RUO brands. Fast pages, product pages buyers trust and a checkout we review line by line.',
    card: { title: 'Every store includes', items: ['RUO-correct product and category pages', 'COA and batch data shown clearly', 'Fast, mobile-first pages', 'Checkout and legal pages processors approve'] },
    tiles: [
      ['Design &amp; copy', 'A premium look and copy written for reviewers and buyers at the same time.'],
      ['Product pages', 'Specs, COAs and research-use language that builds trust without health claims.'],
      ['Checkout review', 'Every step from cart to confirmation checked against processor rules.'],
      ['Speed &amp; SEO', 'Clean structure, fast loading and search foundations from launch day.'],
    ],
    steps: [
      ['Audit or brief', 'We review your current site or your plan and list what blocks approvals.'],
      ['Design and copy', 'You see real pages in the first week, not a reveal at the end.'],
      ['Build and go live', 'Tested on mobile, checkout verified end to end, tracking in place.'],
    ],
    faq: [
      { q: 'Which platform do you build on?', a: 'The one your payment provider and category allow. We build so you can move later without losing search rankings.' },
      { q: 'Will my peptide website get flagged?', a: 'We write every page in RUO-correct language with no health claims, which removes the most common reasons for flags and processor reviews.' },
      { q: 'Do you redesign existing stores?', a: 'Yes. We keep what ranks, fix what blocks approvals and rebuild the rest.' },
    ],
    related: ['peptide-seo', 'high-risk-payments', 'peptide-brand-launch'],
  },
  {
    slug: 'peptide-ads',
    kind: 'service',
    crumb: 'Meta &amp; TikTok ads',
    title: 'Peptide Ads on Meta &amp; TikTok That Stay Live | Stealth Tech',
    desc: 'Meta and TikTok ads for peptide and RUO brands, built around current policy: compliant creative, landing pages and ad accounts that stay live.',
    eyebrow: 'Service · Paid social',
    h1: 'Peptide ads that get approved <span class="acc-w">and stay live.</span>',
    lead: 'Meta and TikTok campaigns for peptide and RUO brands, built around current policy so one rejection never takes the whole account down.',
    card: { title: 'How we keep accounts live', items: ['Policy-first ad copy and creative', 'Compliant landing pages behind every ad', 'Properly warmed, backed-up ad accounts', 'Tracking tested before any spend'] },
    tiles: [
      ['Strategy', 'Audiences, offers and budgets planned around what the platforms allow today.'],
      ['Creative', 'Ads that sell on proof and specifics, not promises reviewers reject.'],
      ['Landers', 'Landing pages written to the same policy as the ads that point to them.'],
      ['Tracking', 'Pixel and server events tested so every dollar is measured.'],
    ],
    steps: [
      ['Account review', 'We check your history, past rejections and current setup.'],
      ['Rebuild the funnel', 'Copy, creative and landers rewritten to policy before launch.'],
      ['Launch and scale', 'Weekly tests, clear reports and spend that grows with results.'],
    ],
    faq: [
      { q: 'Can you guarantee my peptide ads get approved?', a: 'No one honest can. We build accounts, creative and landing pages around current policy, so approvals are the norm and a single rejection stays contained.' },
      { q: 'Which ad platforms do you run?', a: 'Meta and TikTok first, plus Google where your category is eligible.' },
      { q: 'My ad account was banned. Can you help?', a: 'Often, yes. We find what triggered it, fix the copy and landing pages, and rebuild on a clean structure.' },
    ],
    related: ['peptide-websites', 'peptide-seo', 'peptide-brand-launch'],
  },
  {
    slug: 'high-risk-payments',
    kind: 'service',
    crumb: 'High-risk payments',
    title: 'High-Risk Payments for Peptide Stores | Stealth Tech',
    desc: 'High-risk payment processing for peptide, RUO, hemp and kanna stores: provider matching, clean applications, checkout review and a backup plan.',
    eyebrow: 'Service · High-risk payments',
    h1: 'High-risk payment processing <span class="acc-w">that keeps paying out.</span>',
    lead: 'Provider matching, clean applications and checkout review for peptide, RUO, hemp and kanna stores, so payouts keep landing every week.',
    card: { title: 'What we handle', items: ['Providers that accept your category', 'Application prepared and reviewed', 'Checkout and policies processors approve', 'A backup provider plan'] },
    tiles: [
      ['Provider match', 'We shortlist providers that actually accept your products and volume.'],
      ['Applications', 'Clean, complete applications with the documents reviewers ask for.'],
      ['Checkout review', 'Descriptors, refund policy and checkout copy checked line by line.'],
      ['Backup plan', 'A second route ready so one freeze never stops your revenue.'],
    ],
    steps: [
      ['Diagnose', 'We find out why payouts stopped or why applications were declined.'],
      ['Prepare', 'Store, policies and application fixed before anything is submitted.'],
      ['Approve and monitor', 'Go live with the provider and keep the checkout clean as you grow.'],
    ],
    faq: [
      { q: 'My processor froze payouts. What now?', a: 'We help you understand why it happened, prepare a clean application and point you to providers that accept your category.' },
      { q: 'Are you a payment processor?', a: 'No. We are a marketing and technology team. We prepare and guide; the provider makes the final decision.' },
      { q: 'How long does approval take?', a: 'It depends on the provider. A clean, complete application is the fastest route, and that is the part we handle.' },
    ],
    related: ['peptide-websites', 'peptide-brand-launch', 'peptide-seo'],
  },
  {
    slug: 'peptide-seo',
    kind: 'service',
    crumb: 'Peptide SEO',
    title: 'Peptide SEO Agency: Rank Your RUO Store | Stealth Tech',
    desc: 'Peptide SEO for RUO stores: technical SEO, category pages built around real searches and content that builds authority, plus email and SMS.',
    eyebrow: 'Service · Search &amp; retention',
    h1: 'Peptide SEO that brings buyers <span class="acc-w">you own.</span>',
    lead: 'Technical SEO, category pages and content for peptide and RUO stores, plus email and SMS that turn first orders into repeat revenue.',
    card: { title: 'What is included', items: ['Technical SEO audit and fixes', 'Category and product pages built around real searches', 'Content that builds topical authority', 'Email and SMS flows for reorders'] },
    tiles: [
      ['Technical SEO', 'Speed, structure, indexing and schema fixed so search engines read every page.'],
      ['Content', 'Guides and category copy written in RUO-correct language for what buyers search.'],
      ['Email &amp; SMS', 'Welcome, reorder and win-back flows on channels no platform can switch off.'],
      ['Reporting', 'Plain-English monthly reports on rankings, traffic and revenue.'],
    ],
    steps: [
      ['Audit', 'Technical issues, keyword gaps and quick wins in a written report.'],
      ['Build', 'Fixes, category pages and the first content in the opening weeks.'],
      ['Compound', 'Monthly content and testing so traffic you own keeps growing.'],
    ],
    faq: [
      { q: 'How long until peptide SEO works?', a: 'Most stores see movement in 3 to 6 months. Technical fixes and category pages usually move first.' },
      { q: 'Do you write the content?', a: 'Yes, in RUO-correct language, checked against platform and processor policies.' },
      { q: 'Why add email and SMS?', a: 'They are channels no ad platform can switch off, and they lift revenue from buyers you already have.' },
    ],
    related: ['peptide-websites', 'peptide-ads', 'hemp-marketing'],
  },
  {
    slug: 'hemp-marketing',
    kind: 'industry',
    crumb: 'Hemp &amp; botanicals',
    title: 'Hemp &amp; Botanical Marketing Agency | Stealth Tech',
    desc: 'Hemp and botanical extract marketing: compliance-focused ecommerce, high-risk payments, SEO and email that keep revenue off rented platforms.',
    eyebrow: 'Industry · Hemp &amp; botanicals',
    h1: 'Hemp and botanical marketing <span class="acc-w">built to last.</span>',
    lead: 'Full launch packages for hemp and botanical extract brands: compliance-focused ecommerce, then SEO and email that keep revenue off rented platforms.',
    photo: { name: 'ind-botanicals', alt: 'Botanical extract dropper bottles with dried herbs', caption: 'Hemp · Botanical extracts' },
    tiles: [
      ['Compliant ecommerce', 'Stores and product pages written to the rules of your market and your processor.'],
      ['Payments', 'Providers that accept botanical products and a checkout that stays approved.'],
      ['SEO &amp; content', 'Category pages and guides that rank for what your buyers search.'],
      ['Email &amp; SMS', 'Owned channels that keep customers coming back without ad risk.'],
    ],
    steps: [
      ['Strategy call', 'Your products, markets and what is blocking growth today.'],
      ['Written plan', 'A fixed-price plan within 48 hours of the call.'],
      ['Launch and grow', 'Store, payments and search built together, then scaled monthly.'],
    ],
    faq: [
      { q: 'Can you run paid ads for hemp brands?', a: 'Where the platform allows the category, yes, with policy-first creative. Most hemp growth we drive comes from SEO and email.' },
      { q: 'Do you work with new hemp brands?', a: 'Yes. If you have a product and a plan, we can launch it.' },
    ],
    related: ['high-risk-payments', 'peptide-seo', 'kanna-marketing'],
  },
  {
    slug: 'kanna-marketing',
    kind: 'industry',
    crumb: 'Kanna',
    title: 'Kanna Marketing Agency | Stealth Tech',
    desc: 'Kanna marketing for botanical brands: branding, websites, SEO, content, email and eligible campaigns.',
    eyebrow: 'Industry · Kanna',
    h1: 'Kanna marketing for <span class="acc-w">botanical brands.</span>',
    lead: 'Branding, sites and growth for kanna brands. Clinics and telehealth have their own page.',
    photo: { name: 'ind-kanna', alt: 'Kanna (Sceletium tortuosum) plant and ground kanna powder', caption: 'Kanna' },
    tiles: [
      ['Branding', 'A brand that feels premium and trustworthy in a new category.'],
      ['Compliant sites', 'Claim-free product and service pages that platforms and processors accept.'],
      ['SEO &amp; content', 'Education-led content that ranks and builds trust over time.'],
      ['Eligible campaigns', 'Paid campaigns only where the platforms allow your category.'],
    ],
    steps: [
      ['Strategy call', 'Your offer, your market and the rules you work within.'],
      ['Written plan', 'Scope, timeline and one fixed price within 48 hours.'],
      ['Build and grow', 'Brand, site and search first, then campaigns where eligible.'],
    ],
    faq: [
      { q: 'What is kanna?', a: 'Kanna (Sceletium tortuosum) is a South African succulent sold as a botanical. Marketing it needs careful, claim-free language, which is where we start.' },
      { q: 'Do you work with clinics and telehealth?', a: 'Yes. That work has its own page: <a class="acc" href="/clinics-telehealth">Clinics &amp; telehealth</a>.' },
    ],
    related: ['clinics-telehealth', 'hemp-marketing', 'peptide-websites'],
  },
  {
    slug: 'clinics-telehealth',
    kind: 'industry',
    crumb: 'Clinics &amp; telehealth',
    title: 'Online Stores for Clinics & Telehealth | Stealth Tech',
    desc: 'We design and build sites and stores for clinics and telehealth brands. A finished look, a fast build and a site you fully own.',
    eyebrow: 'Industry · Clinics &amp; telehealth',
    h1: 'Professional sites for clinics <span class="acc-w">and telehealth.</span>',
    lead: 'You have the practice. We design the brand and build the site around it, quickly, so it looks finished from the first visit.',
    card: {
      title: 'What you get',
      items: ['A brand that looks finished', 'A site or store built in weeks', 'Booking or checkout designed with the site', 'Domain, code and content in your name'],
    },
    tiles: [
      ['Brand', 'A look and a voice that feel calm and specific to your practice.'],
      ['Site or store', 'Service pages, a clear offer and a path to book or buy, designed as one piece.'],
      ['Speed', 'Most builds go live in weeks. You get a written plan and one fixed price first.'],
      ['Ownership', 'The domain, the site and the code are set up in your name.'],
    ],
    steps: [
      ['Strategy call', '30 minutes on what you offer and who it is for.'],
      ['Written plan in 48 hours', 'Scope, timeline and one fixed price, before any work starts.'],
      ['Design and launch', 'Brand and site built in one pass, then handed to you.'],
    ],
    faq: [
      { q: 'Do you build booking sites and stores?', a: 'Yes. Clinics and telehealth brands can have a site, a store, or both, designed and built by the same team.' },
      { q: 'Do we own what you build?', a: 'Yes. The domain, the site and the code are in your name from the start.' },
    ],
    related: ['peptide-websites', 'peptide-brand-launch', 'kanna-marketing'],
  },
  {
    slug: 'peptide-platforms',
    kind: 'service',
    crumb: 'Back office',
    title: 'Peptide Store Back Office &amp; Wholesale | Stealth Tech',
    desc: 'Wholesale pricing, affiliate tracking, subscriptions and admin portals built into your peptide or RUO store from day one, not bolted on with plugins later.',
    eyebrow: 'Service · Back office',
    h1: 'Wholesale, affiliates and subscriptions <span class="acc-w">built in, not bolted on.</span>',
    lead: 'The parts of a peptide store buyers never see: wholesale accounts, affiliate payouts, reorders and the portals your team works in every day. Built into the store from day one, so nothing breaks when a plugin updates.',
    card: { title: 'Built into your store', items: ['Wholesale pricing tiers and approved accounts', 'Affiliate links, tracking and payout reports', 'Subscriptions and reorder reminders', 'Admin, support and fulfilment portals'] },
    tiles: [
      ['Wholesale', 'Tiered pricing, minimum orders and approved wholesale accounts, inside the same store as retail.'],
      ['Affiliates', 'Links, codes, tracking and payout reports your partners can check themselves.'],
      ['Subscriptions', 'Repeat orders, renewals and reorder reminders that keep research buyers coming back.'],
      ['Portals', 'Admin, support and fulfilment views so each person on your team sees only what they need.'],
    ],
    steps: [
      ['Map your operations', 'How orders, partners and support work today, and where it keeps breaking.'],
      ['Build into the store', 'One system instead of five plugins, set up in your name and tested with real orders.'],
      ['Hand over and train', 'Your team gets short walkthroughs and a written guide for every portal.'],
    ],
    faq: [
      { q: 'Can you move our existing wholesale accounts and affiliates?', a: 'Yes. We migrate accounts, pricing and affiliate history so nobody has to sign up again.' },
      { q: 'Do you use plugins for this?', a: 'Only where a plugin is stable and well supported. Core flows like wholesale pricing and payouts are built into the store so an update cannot take them down.' },
      { q: 'Which platforms do you build on?', a: 'WooCommerce or custom code you own, chosen around what your payment provider accepts.' },
    ],
    related: ['peptide-websites', 'high-risk-payments', 'peptide-brand-launch'],
  },
  {
    slug: 'peptide-marketing',
    kind: 'service',
    crumb: 'Marketing add-ons',
    title: 'Peptide Marketing: SEO, Email &amp; Ads | Stealth Tech',
    desc: 'Once your peptide store converts: peptide SEO, email and SMS flows, and Meta and TikTok ads written in RUO-correct language, added on top of the build.',
    eyebrow: 'Service · Marketing add-ons',
    h1: 'Marketing on top of a store <span class="acc-w">that is ready for traffic.</span>',
    lead: 'Traffic is worth paying for once the store converts. When yours does, we add peptide SEO, email and SMS, and Meta and TikTok ads, all written in RUO-correct language.',
    card: { title: 'Add-ons you can start with', items: ['Peptide SEO: technical fixes, category pages, content', 'Email and SMS: welcome, reorder and win-back flows', 'Meta and TikTok ads built around current policy', 'Plain-English monthly reports'] },
    tiles: [
      ['Peptide SEO', 'Category and product pages written around what researchers actually search, plus the technical fixes that let them rank.'],
      ['Email &amp; SMS', 'Owned channels no ad platform can switch off: welcome, reorder and win-back flows.'],
      ['Paid social', 'Meta and TikTok campaigns with policy-first creative and landing pages, from properly warmed accounts.'],
      ['Reporting', 'One monthly report in plain English: what moved, what it cost, what we test next.'],
    ],
    steps: [
      ['Check the store first', 'We confirm the store converts before we send paid traffic to it.'],
      ['Start with one channel', 'Usually email or SEO first, because nobody can switch them off.'],
      ['Scale what works', 'Monthly tests and a clear roadmap for the next quarter.'],
    ],
    faq: [
      { q: 'Why marketing as an add-on?', a: 'Because ads and SEO only pay off when the store converts and the checkout stays approved. We build that first.' },
      { q: 'Can you guarantee my ads get approved?', a: 'No one honest can. We build creative and landing pages around current policy, so approvals are the norm and a single rejection stays contained.' },
      { q: 'Can we add marketing to a store you did not build?', a: 'Yes, after a short audit. If something in the store would waste the spend, we tell you first.' },
    ],
    related: ['peptide-seo', 'peptide-ads', 'peptide-websites'],
  },
  {
    slug: 'privacy',
    kind: 'legal',
    crumb: 'Privacy policy',
    title: 'Privacy Policy | Stealth Tech',
    desc: 'How Stealth Tech collects, uses and protects the information you share through this website.',
    h1: 'Privacy policy',
    body: `<div class="lg-sum"><p class="lg-k">In short</p><ul>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>We only collect what you type into the booking form, what you enter in the calendar, and anonymous statistics about how the site is used.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>We use it to reply to you and prepare your call. We never sell it and there are no advertising trackers on this site.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>You can see, correct or delete your information at any time: email <a class="acc" href="mailto:wassamrehman@gmail.com">wassamrehman@gmail.com</a>.</li></ul></div>
<h2>1. Who we are</h2><p>Stealth Tech is a design and development studio for peptide, RUO, botanical and kanna brands. This policy covers this website (stealthtech.agency) and the enquiries you send through it. For anything about your data, contact <a class="acc" href="mailto:wassamrehman@gmail.com">wassamrehman@gmail.com</a>.</p>
<h2>2. What we collect</h2><ul>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg><b>Booking form</b>: your name, work email, phone or WhatsApp (optional), website (optional), country and region, budget range, launch timing, notes, and your answers about your brand and what you need.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg><b>Calendar booking</b>: the time you pick and the details you confirm in the scheduling calendar. Our scheduling provider handles this under its own privacy policy.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg><b>Anonymous statistics</b>: which pages and sections are viewed, for how long, how far people scroll, which buttons are clicked and where visitors came from (for example a search engine or an ad). No names, no email addresses, no form contents.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg><b>Technical data</b>: the information every browser sends to every website, such as IP address, browser and device type, kept briefly in our host's server logs for security.</li></ul>
<h2>3. How we use it</h2><ul>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>To reply to your enquiry, prepare for your strategy call and send the written plan you asked for.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>To run, secure and improve this website (for example, to see which sections are unclear).</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>We do not sell or rent your information, we do not use it for advertising profiles, and we do not add you to marketing lists without asking.</li></ul>
<h2>4. Legal basis</h2><p>Where privacy laws such as the GDPR or UK GDPR apply, we rely on: <b>steps you ask us to take before a contract</b> (replying to your enquiry and preparing your call), our <b>legitimate interest</b> in running a secure, useful website (server logs, anonymous statistics), and <b>your consent</b> for the optional visitor id and any optional heatmap tool (you choose on the cookie banner).</p>
<h2>5. Who else handles it</h2><p>We use a small number of service providers, each only to provide its service to us: our <b>website host</b> (stores form submissions), an <b>email delivery service</b> (sends each enquiry to our team), our <b>scheduling provider</b> (the calendar), and a <b>private spreadsheet</b> in our own cloud account (anonymous statistics). They may process data outside your country; where the law requires it, transfers are covered by standard contractual safeguards. We share information with authorities only when the law requires it.</p>
<h2>6. How long we keep it</h2><ul>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>Enquiries: while we are talking with you and for up to 24 months after, unless you ask us to delete them sooner. If you become a client, project records are kept as long as the law requires.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>Anonymous statistics: up to 26 months.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>Server logs: a few weeks, as set by our host.</li></ul>
<h2>7. Security</h2><p>The site runs on HTTPS only, sends strict security headers, and loads code only from our own domain and the few providers listed above. Access to enquiries is limited to the people who work on them.</p>
<h2>8. Your rights</h2><p>Depending on where you live, you can ask to <b>see</b> the information we hold about you, <b>correct</b> it, <b>delete</b> it, <b>receive a copy</b>, <b>object</b> to or <b>restrict</b> how we use it, and <b>withdraw consent</b> at any time (this does not affect anything done before). Residents of California and other US states have similar rights; we do not sell or share personal information for cross-context advertising. Email <a class="acc" href="mailto:wassamrehman@gmail.com">wassamrehman@gmail.com</a> and we will reply within 30 days. You can also complain to your local data protection authority.</p>
<h2>9. Children</h2><p>This website is for businesses and is not meant for anyone under 18. We do not knowingly collect information from minors.</p>
<h2>10. Changes</h2><p>If we change this policy, we update the date at the top of this page. Important changes will be easy to spot.</p>
<h2>11. Contact</h2><p>Stealth Tech, <a class="acc" href="mailto:wassamrehman@gmail.com">wassamrehman@gmail.com</a>. Read the <a class="acc" href="/cookies">cookie policy</a> for the details of what is stored in your browser.</p>`,
  },
  {
    slug: 'cookies',
    kind: 'legal',
    crumb: 'Cookie policy',
    title: 'Cookie Policy | Stealth Tech',
    desc: 'The few cookies and browser storage items the Stealth Tech website uses, and how to control them.',
    h1: 'Cookie policy',
    body: `<div class="lg-sum"><p class="lg-k">In short</p><ul>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>No advertising cookies and no data selling.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>A few small items keep the site working the way you left it (theme, your cookie choice, faster loading).</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>Anything that counts returning visitors, and any optional heatmap tool, only runs if you choose Accept.</li></ul></div>
<h2>1. What we store in your browser</h2>
<div class="lg-tw"><table class="lg-t"><thead><tr><th>Item</th><th>What it does</th><th>When</th><th>How long</th></tr></thead><tbody>
<tr><td><b>Theme</b></td><td>Remembers light or dark theme.</td><td>When you switch theme</td><td>Until you clear it</td></tr>
<tr><td><b>Cookie choice</b></td><td>Remembers Accept or Decline so the banner does not return.</td><td>When you choose</td><td>Until you clear it</td></tr>
<tr><td><b>Performance setting</b></td><td>Remembers if your device runs the lighter version of the site.</td><td>Slow devices only</td><td>7 days</td></tr>
<tr><td><b>Graphics check</b></td><td>Remembers if your device can show the 3D and animated parts.</td><td>Every visit</td><td>Until the tab closes</td></tr>
<tr><td><b>Page transition</b></td><td>Lets the page loader finish smoothly when you move between pages.</td><td>When you click a link</td><td>A few seconds</td></tr>
<tr><td><b>Offline copy</b></td><td>Keeps this site's own files so pages open fast and still work without a connection.</td><td>After the first visit</td><td>Until updated or cleared</td></tr>
<tr><td><b>Visitor id</b></td><td>A random id that lets our anonymous statistics count returning visitors. It contains nothing about you.</td><td>Only after Accept</td><td>Until you clear it</td></tr>
<tr><td><b>Session id</b></td><td>Groups the pages of one visit in the anonymous statistics.</td><td>Only after Accept</td><td>Until the tab closes</td></tr>
</tbody></table></div>
<p>All of these are stored by this website only (browser storage, not tracking cookies) and never leave your device except as anonymous statistics.</p>
<h2>2. Optional heatmaps</h2><p>To see where pages are unclear, we may use a heatmap tool that records clicks and scrolling. It only loads if you choose Accept, never records what you type into forms, and sets its own cookies (kept up to 12 months) under its own privacy policy.</p>
<h2>3. The booking calendar</h2><p>When you reach the last step of the booking form, our scheduling provider's calendar loads inside the page. It may set its own cookies to run the calendar and remember your time zone, under its own privacy policy.</p>
<h2>4. Your choices</h2><ul>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>Choose <b>Decline</b> on the banner: nothing optional runs, and the site works exactly the same.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>Changed your mind? Clear this site's data in your browser settings and the banner will ask again.</li>
<li><svg class="mol-i" aria-hidden="true"><use href="#mol"/></svg>Most browsers can also block or delete storage for every site; see your browser's help pages.</li></ul>
<h2>5. Contact</h2><p>Questions about this policy: <a class="acc" href="mailto:wassamrehman@gmail.com">wassamrehman@gmail.com</a>. See also our <a class="acc" href="/privacy">privacy policy</a>.</p>`,
  },
];

export function getPageBySlug(slug: string): PageData | undefined {
  return PAGES.find(p => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return PAGES.map(p => p.slug);
}

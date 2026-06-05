/**
 * D7 — in-app legal documents. Rendered by app/legal/[doc].tsx so the user
 * never leaves the app to an external browser. English v1; the canonical
 * versions live at oqapps.pro/legal/shiftsleep/* and should be kept in sync.
 *
 * Plain content model: a title + ordered sections (heading + body). Body
 * paragraphs are separated by a blank line.
 */

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const PRIVACY: LegalDoc = {
  title: 'Privacy Policy',
  updated: 'Last updated: June 2026',
  intro:
    'ShiftRest helps shift workers plan better sleep. We collect as little as we can and never sell your data. This policy explains what we collect, why, and the control you have.',
  sections: [
    {
      heading: 'What we collect',
      body:
        'Account: if you create an account, your email address and an encrypted authentication token.\n\nProfile you give us: profession, schedule pattern, shift times, chronotype answers, caffeine and melatonin habits, family commitments, and your stated sleep goal. This is what powers your personalized plan.\n\nUsage: your sleep-journal ratings and in-app actions (e.g. which plan cards you open), used to improve your plan and the app.\n\nDevice: basic technical data and crash diagnostics. We do not collect precise location.',
    },
    {
      heading: 'How we use it',
      body:
        'To generate and adjust your personalized sleep plan, to show your history and stats, to keep the app reliable (crash diagnostics), and to operate your subscription. We do not use your data for third-party advertising.',
    },
    {
      heading: 'Service providers',
      body:
        'We use trusted processors strictly to run the app: Supabase (secure database and authentication), Adapty and the App Store (subscription management and billing), Firebase Crashlytics (crash diagnostics), and OpenAI (to generate plan text from your non-identifying schedule inputs). Each processes data only on our instructions.',
    },
    {
      heading: 'App Tracking Transparency',
      body:
        'We ask for tracking permission only where required by Apple. If you decline, the app works fully — your plan and library are never gated behind tracking consent.',
    },
    {
      heading: 'Your choices and rights',
      body:
        'You can edit or clear your profile any time in Settings. You can delete your account and associated data from Settings → Account → Delete account; deletion is permanent. Depending on where you live, you may have rights to access, correct, export, or erase your data — contact us to exercise them.',
    },
    {
      heading: 'Data retention & security',
      body:
        'We keep your data while your account is active and remove it after deletion, except where law requires retention. Authentication tokens are encrypted at rest on your device, and data in transit is encrypted (TLS).',
    },
    {
      heading: 'Children',
      body:
        'ShiftRest is not directed to children under 16 and we do not knowingly collect their data.',
    },
    {
      heading: 'Changes & contact',
      body:
        'We may update this policy; material changes will be surfaced in the app. Questions or requests: privacy@oqapps.pro.',
    },
  ],
};

export const TERMS: LegalDoc = {
  title: 'Terms of Use',
  updated: 'Last updated: June 2026',
  intro:
    'These terms govern your use of ShiftRest. By using the app you agree to them. Please read the wellness disclaimer below carefully.',
  sections: [
    {
      heading: 'Wellness, not medical advice',
      body:
        'ShiftRest provides general sleep-and-circadian education and scheduling guidance for shift workers. It is not a medical device and does not diagnose, treat, or cure any condition. It is not a substitute for professional medical advice. If you have a sleep disorder or any health concern, consult a qualified clinician. Never disregard or delay medical advice because of something in the app.',
    },
    {
      heading: 'Your account',
      body:
        'You are responsible for keeping your login secure and for activity under your account. Provide accurate information so your plan is meaningful. You can delete your account at any time from Settings.',
    },
    {
      heading: 'Subscriptions & billing',
      body:
        'Premium features are offered via auto-renewing subscription billed through your App Store account. Payment is charged at confirmation of purchase. Subscriptions renew automatically unless cancelled at least 24 hours before the period ends; manage or cancel in your App Store account settings. Any free-trial period is forfeited when you purchase a subscription. Prices may vary by region.',
    },
    {
      heading: 'Acceptable use',
      body:
        'Use the app lawfully. Do not attempt to disrupt, reverse-engineer, or misuse the service, and do not submit content to the community feed that is unlawful, harmful, or not your own. We may remove content or limit access to keep the community safe.',
    },
    {
      heading: 'Community content',
      body:
        'Stories shared to the community are reviewed before they appear and may be edited or removed. By submitting, you grant us a licence to display your submission in the app. Do not share personal medical details you would not want public.',
    },
    {
      heading: 'Disclaimers & liability',
      body:
        'The app is provided "as is." To the maximum extent permitted by law, we are not liable for indirect or consequential damages, or for decisions you make based on the app. Some jurisdictions do not allow certain limitations, so parts may not apply to you.',
    },
    {
      heading: 'Changes & contact',
      body:
        'We may update these terms; continued use after changes means you accept them. Questions: support@oqapps.pro.',
    },
  ],
};

export function legalDoc(slug: string): LegalDoc | undefined {
  if (slug === 'privacy') return PRIVACY;
  if (slug === 'terms') return TERMS;
  return undefined;
}

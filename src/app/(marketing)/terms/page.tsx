import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="prose-lite mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="h1">Terms of Service</h1>
      <p className="text-sm text-muted">Last updated: November 2026</p>
      <h3>1. The service</h3>
      <p>PyNest provides online Python lessons, an in-browser code editor, exercises, quizzes, an AI tutor (“PyBuddy”) and related features. Free features are provided as-is; paid plans add the features described on the Pricing page.</p>
      <h3>2. Accounts</h3>
      <p>You must give accurate information, keep your password secure and are responsible for activity on your account. You may delete your account at any time from Settings. Users under the age of digital consent in their country need permission from a parent or guardian.</p>
      <h3>3. Acceptable use</h3>
      <ul><li>Don't attempt to manipulate XP, rankings, subscriptions or other users' data.</li><li>Don't use PyBuddy to generate harmful content or to overload the service.</li><li>Be respectful in usernames, bios and any public content.</li></ul>
      <p>We may suspend accounts that break these rules or remove leaderboard entries obtained unfairly.</p>
      <h3>4. Subscriptions and payments</h3>
      <p>Paid plans renew automatically each month or year until cancelled. Payments are processed by our merchant of record, Lemon Squeezy, which also handles tax and invoices. You can cancel at any time; access continues until the end of the paid period. Refunds follow the payment provider's policy and applicable consumer law.</p>
      <h3>5. AI tutor</h3>
      <p>PyBuddy uses an AI model and can make mistakes. Always run and check code yourself. AI allowances are daily fair-use limits and do not roll over.</p>
      <h3>6. Your content</h3>
      <p>You own the code you write. You grant us permission to store and process it to provide the service (for example, saving snippets or reviewing submissions).</p>
      <h3>7. Changes and liability</h3>
      <p>We may update these terms and will notify users of material changes. To the extent permitted by law, PyNest is not liable for indirect or consequential losses.</p>
      <h3>8. Contact</h3>
      <p>Questions about these terms can be sent to the site operator through the contact details on the site.</p>
    </article>
  );
}

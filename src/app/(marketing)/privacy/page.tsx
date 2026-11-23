import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="prose-lite mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="h1">Privacy Policy</h1>
      <p className="text-sm text-muted">Last updated: November 2026</p>
      <h3>What we collect</h3>
      <ul>
        <li><strong>Account data:</strong> email address, username, display name, optional avatar, bio, country and learning preferences.</li>
        <li><strong>Learning data:</strong> completed lessons, exercise submissions (including your code), quiz results, XP, streaks and achievements.</li>
        <li><strong>AI usage:</strong> the number of PyBuddy requests and tokens used per day. Conversation text is sent to our AI provider to generate answers and is not stored in our database.</li>
        <li><strong>Billing:</strong> plan, status and invoice references from our payment provider. We never receive or store card numbers.</li>
      </ul>
      <h3>How we use it</h3>
      <p>To provide lessons and progress tracking, rank learners on leaderboards (only public, opt-in statistics), enforce plan limits, and keep the service secure.</p>
      <h3>Who can see what</h3>
      <p>Your email is never shown to other users. Your profile and statistics are visible to others only if you keep “Public profile” and “Show learning statistics” enabled in Settings. Saved code, submissions and billing data are visible only to you.</p>
      <h3>Processors</h3>
      <p>Supabase (database & authentication), Vercel (hosting), Anthropic (AI tutor responses) and Lemon Squeezy (payments).</p>
      <h3>Your rights</h3>
      <p>You can download all your data (Settings → Export my data) and permanently delete your account (Settings → Delete account) at any time.</p>
      <h3>Local storage</h3>
      <p>In guest mode, your progress is stored only in your browser's local storage. We also store your theme preference and code drafts locally.</p>
    </article>
  );
}

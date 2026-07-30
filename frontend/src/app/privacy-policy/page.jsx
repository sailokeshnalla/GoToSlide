import { LegalShell, H2, P, UL, LI, A } from '@/components/legal/Legal';
import BubbleBackground from '@/components/BubbleBackground';

export const metadata = {
  title: 'Privacy Policy — GoToSlide',
  description: 'How GoToSlide collects, uses, and protects your information.',
};


export default function PrivacyPolicyPage() {
  return (
    <div className="relative overflow-hidden">
      <BubbleBackground />
      <div className="relative z-10"></div>
    <LegalShell title="Privacy Policy" updated="June 18, 2026">
      <P>
        This Privacy Policy explains how GoToSlide (“we”, “us”, “our”) collects, uses, and
        protects your information when you use our presentation-template marketplace and
        AI-assisted content tools (the “Service”). By using the Service, you agree to the
        practices described here.
      </P>

      <H2>Information we collect</H2>
      <UL>
        <LI>
          <strong>Account information.</strong> When you sign up, we collect your email
          address and a password, managed through our authentication provider. If you sign
          in with Google, we receive basic profile information (such as your email) from
          your Google account.
        </LI>
        <LI>
          <strong>Your AI provider API key (bring-your-own-key).</strong> To generate
          content, you connect your own Google Gemini or xAI Grok API key. We store this key
          on your account solely so the Service can make AI requests on your behalf. You can
          view, replace, or remove it at any time from your dashboard.
        </LI>
        <LI>
          <strong>Content you provide.</strong> The briefs, prompts, text, styling, and other
          inputs you enter to customize or generate templates.
        </LI>
        <LI>
          <strong>Usage and technical data.</strong> Limited technical information such as
          device and browser type, and basic logs needed to operate and secure the Service.
        </LI>
      </UL>

      <H2>How we use your information</H2>
      <UL>
        <LI>To create and maintain your account and authenticate you.</LI>
        <LI>To generate, preview, and let you download customized templates.</LI>
        <LI>To use your connected API key only to fulfill the AI requests you initiate.</LI>
        <LI>To operate, secure, debug, and improve the Service.</LI>
      </UL>

      <H2>AI processing and third parties</H2>
      <P>
        When you use the “Generate with AI” feature, the brief you enter and your connected
        API key are sent to your chosen provider (Google Gemini or xAI Grok) to produce the
        content. That processing is governed by the provider’s own terms and privacy policy.
        We do not use your prompts or generated content to train our own models.
      </P>
      <P>
        We rely on the following service providers to run the Service: our hosting,
        authentication, and database provider (Supabase); Google (for Gemini and Google
        sign-in); and xAI (for Grok). These providers process data on our behalf or under
        their own terms as applicable.
      </P>

      <H2>Cookies</H2>
      <P>
        We use a small number of essential cookies to keep you signed in and to operate the
        Service. For details, see our <A href="/cookies">Cookie Policy</A>.
      </P>

      <H2>Data retention</H2>
      <P>
        We keep your account information and connected key for as long as your account is
        active. When you remove your API key or delete your account, the associated data is
        deleted from your account record.
      </P>

      <H2>Your rights</H2>
      <UL>
        <LI>Access, update, or correct your account information.</LI>
        <LI>Remove your AI provider key at any time from your dashboard.</LI>
        <LI>Request deletion of your account and associated data.</LI>
        <LI>
          Depending on where you live, you may have additional rights under laws such as the
          GDPR or CCPA. Contact us to exercise them.
        </LI>
      </UL>

      <H2>Security</H2>
      <P>
        We use reasonable technical and organizational measures to protect your information.
        No method of transmission or storage is completely secure, so we cannot guarantee
        absolute security. We recommend restricting your API keys (for example, scoping a
        Gemini key to the Generative Language API) and never sharing your credentials.
      </P>

      <H2>Children</H2>
      <P>
        The Service is not directed to children under 16, and we do not knowingly collect
        their personal information.
      </P>

      <H2>International transfers</H2>
      <P>
        Your information may be processed in countries other than your own, including by the
        third-party providers listed above. Where required, we take steps to ensure
        appropriate safeguards are in place.
      </P>

      <H2>Changes to this policy</H2>
      <P>
        We may update this Privacy Policy from time to time. Material changes will be
        reflected by updating the “Last updated” date above.
      </P>

      <H2>Contact</H2>
      <P>
        Questions about this policy? Contact us at <A href="mailto:support@inteleraai.com">support@inteleraai.com</A>
      </P>
    </LegalShell>
    </div>
  );
}
import { LegalShell, H2, P, UL, LI, A } from '@/components/legal/Legal';
import BubbleBackground from '@/components/BubbleBackground';

export const metadata = {
  title: 'Terms of Service — GoToSlide',
  description: 'The terms that govern your use of GoToSlide.',
};

export default function TermsOfServicePage() {
  return (
    <div className="relative overflow-hidden">
      <BubbleBackground />
      <div className="relative z-10"></div>
    <LegalShell title="Terms of Service" updated="June 18, 2026">
      <P>
        These Terms of Service (“Terms”) govern your access to and use of GoToSlide (the
        “Service”). By creating an account or using the Service, you agree to these Terms. If
        you do not agree, do not use the Service.
      </P>

      <H2>1. The Service</H2>
      <P>
        GoToSlide provides a library of editable presentation templates (such as funnels, Venn Diagrams,
        timelines, org charts, and more) and AI-assisted tools that help you
        fill and customize those templates, then download them as PowerPoint, PDF, or image
        files.
      </P>

      <H2>2. Your account</H2>
      <UL>
        <LI>You must provide accurate information and keep your credentials secure.</LI>
        <LI>You are responsible for all activity that occurs under your account.</LI>
        <LI>You must be at least 16 years old (or the age of digital consent where you live).</LI>
      </UL>

      <H2>3. Bring your own AI key</H2>
      <P>
        AI generation requires you to connect your own Google Gemini API key. You
        are solely responsible for: obtaining the key, complying with the provider’s terms,
        and any usage, costs, or charges your provider bills you. We use your key only to
        carry out the AI requests you initiate, and you can remove it at any time. We are not
        responsible for provider availability, rate limits, pricing, or any charges incurred
        on your provider account.
      </P>

      <H2>4. Acceptable use</H2>
      <P>You agree not to use the Service to:</P>
      <UL>
        <LI>Violate any law or infringe anyone’s intellectual property or privacy rights.</LI>
        <LI>Create unlawful, harmful, deceptive, or abusive content.</LI>
        <LI>Reverse engineer, disrupt, overload, or attempt to gain unauthorized access to the Service.</LI>
        <LI>Resell or redistribute the templates as a competing stock-template library.</LI>
      </UL>

      <H2>5. Templates and your content</H2>
      <P>
        Subject to these Terms, we grant you a non-exclusive license to use and customize the
        templates for your own business and personal presentations. The content you enter and
        the finished files you generate are yours. You are responsible for ensuring your
        content is accurate and that you have the rights to use anything you add.
      </P>

      <H2>6. Intellectual property</H2>
      <P>
        The Service, including the template designs, software, branding, and the GoToSlide
        name and logo, is owned by us or our licensors and is protected by intellectual
        property laws. These Terms do not transfer any ownership in the Service to you.
      </P>

      <H2>7. AI-generated content</H2>
      <P>
        AI output can be inaccurate, incomplete, or unsuitable for your purpose. You are
        responsible for reviewing and editing any generated content before relying on or
        sharing it. We make no warranty about the accuracy or fitness of AI output.
      </P>

      <H2>8. Disclaimers</H2>
      <P>
        The Service is provided “as is” and “as available,” without warranties of any kind,
        whether express or implied, including fitness for a particular purpose and
        non-infringement, to the fullest extent permitted by law.
      </P>

      <H2>9. Limitation of liability</H2>
      <P>
        To the maximum extent permitted by law, GoToSlide will not be liable for any
        indirect, incidental, special, or consequential damages, or for any loss of data,
        profits, or third-party AI provider charges, arising from your use of the Service.
      </P>

      <H2>10. Termination</H2>
      <P>
        You may stop using the Service and delete your account at any time. We may suspend or
        terminate access if you breach these Terms or use the Service in a way that could harm
        us or other users.
      </P>

      <H2>11. Changes to these Terms</H2>
      <P>
        We may update these Terms from time to time. Continued use of the Service after
        changes take effect constitutes acceptance of the updated Terms.
      </P>

      <H2>12. Governing law</H2>
      <P>
        These Terms are governed by the laws of [your jurisdiction], without regard to its
        conflict-of-laws rules.
      </P>
    </LegalShell>
    </div>
  );
}
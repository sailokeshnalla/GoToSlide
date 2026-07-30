import { LegalShell, H2, P, UL, LI, A } from '@/components/legal/Legal';
import BubbleBackground from '@/components/BubbleBackground';

export const metadata = {
  title: 'Cookie Policy — GoToSlide',
  description: 'How GoToSlide uses cookies and similar technologies.',
};

export default function CookiePolicyPage() {
  return (
    <div className="relative overflow-hidden">
      <BubbleBackground />
      <div className="relative z-10"></div>
    <LegalShell title="Cookie Policy" updated="June 18, 2026">
      <P>
        This Cookie Policy explains how GoToSlide uses cookies and similar technologies (such
        as local storage) when you use our Service, and the choices available to you.
      </P>

      <H2>What cookies are</H2>
      <P>
        Cookies are small text files stored on your device by your browser. Similar
        technologies like local storage work the same way. They let a site remember things
        between pages and visits — for example, that you are signed in.
      </P>

      <H2>How we use them</H2>
      <P>
        GoToSlide uses only the cookies and storage needed to run the Service. We do not use
        advertising cookies, and we do not sell your data or let advertisers track you here.
      </P>
      <UL>
        <LI>
          <strong>Essential / authentication.</strong> Set by our authentication provider
          (Supabase) to keep you securely signed in and maintain your session. The Service
          will not work properly without these.
        </LI>
        <LI>
          <strong>Functional.</strong> Used to remember basic preferences and keep the
          interface working as you navigate between pages.
        </LI>
      </UL>

      <H2>Third-party cookies</H2>
      <P>
        Some cookies may be set by providers we rely on, such as Supabase (authentication and
        sessions) and Google (when you choose to sign in with Google). These are governed by
        those providers’ own policies.
      </P>

      <H2>Managing cookies</H2>
      <P>
        You can control or delete cookies through your browser settings, and set your browser
        to block them. Please note that blocking essential cookies will prevent you from
        signing in and using core features of the Service.
      </P>
      <P>
        Because we currently use only essential and functional cookies, you do not need to set
        marketing preferences. If we introduce analytics or marketing cookies in the future,
        we will update this page and provide a consent option where required.
      </P>

      <H2>Changes to this policy</H2>
      <P>
        We may update this Cookie Policy as the Service evolves. Changes will be reflected by
        updating the “Last updated” date above.
      </P>

      <H2>Contact</H2>
      <P>
        Questions about cookies? Contact us at{' '}
        <A href="mailto:support@inteleraai.com">support@inteleraai.com</A>. See also our{' '}
        <A href="/privacy-policy">Privacy Policy</A> and{' '}
        <A href="/terms-of-service">Terms of Service</A>.
      </P>
    </LegalShell>
    </div>
  );
}
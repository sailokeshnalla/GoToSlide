import BubbleBackground from '@/components/BubbleBackground';

export const metadata = {
  title: 'Help Center | GoToSlide',
};

const FAQS = [
  {
    q: 'How do I download a template?',
    a: 'Open any template, customize it in the preview editor, and choose your export format (PPTX, PDF, or Image) from the download menu.',
  },
  {
    q: 'What file formats can I export to?',
    a: 'GoToSlide supports PPTX, PDF, and image (JPG/PNG) exports for every template in the library.',
  },
  {
    q: 'Can I use my own AI API key?',
    a: 'Yes. In your account settings you can connect your own API key for supported AI providers to power content generation.',
  },
  {
    q: 'Do I own the content I add to a template?',
    a: 'Yes — any original text, images, or branding you add remains yours. The template design itself is licensed for use per our Terms of Service.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Account Settings → Privacy → Delete Account, or email support@inteleraai.com and we\u2019ll process the request.',
  },
  {
    q: 'My placeholder text isn\u2019t updating — what should I do?',
    a: 'Try refreshing the preview. If the issue persists, clear your browser cache or contact support with the template name and a screenshot.',
  },
];

export default function HelpCenter() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#FAFAFF] to-[#F5F3FF]">
      <BubbleBackground />

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-[#0F172A]">
        <h1 className="text-4xl font-extrabold mb-2">Help Center</h1>
        <p className="text-[#64748B] mb-10">
          Answers to common questions. Can't find what you need?{' '}
          <a href="/contact" className="text-[#7C3AED] underline">Contact us</a>.
        </p>

        <div className="space-y-6">
          {FAQS.map((item, i) => (
            <div key={i} className="p-5 rounded-xl border border-[#E2E8F0] bg-white/70 backdrop-blur-sm">
              <h3 className="font-bold mb-2">{item.q}</h3>
              <p className="text-[#475569] leading-7">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
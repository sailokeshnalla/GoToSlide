import BubbleBackground from '@/components/BubbleBackground';

export const metadata = {
  title: 'About Us | GoToSlide',
};

export default function AboutUs() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#FAFAFF] to-[#F5F3FF]">
      <BubbleBackground />

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-[#0F172A]">
        <h1 className="text-4xl font-extrabold mb-6">About GoToSlide</h1>

        <p className="text-[#475569] leading-8 mb-6">
          GoToSlide is a presentation template marketplace built for people who
          need to look sharp under deadline pressure — founders prepping an
          investor pitch, consultants finalizing a client deck, or teams
          putting together a strategy review the night before a meeting.
        </p>

        <p className="text-[#475569] leading-8 mb-6">
          We combine a curated library of professionally designed templates
          with AI-assisted customization, so you can go from a blank template
          to a polished, on-brand presentation in minutes — exportable as
          PPTX, PDF, or image, ready to present.
        </p>

        <p className="text-[#475569] leading-8 mb-6">
          Our mission is simple: great design shouldn't be a bottleneck.
          Whether you're customizing text, swapping colors, or generating
          content with AI, GoToSlide handles the design heavy-lifting so you
          can focus on your message.
        </p>

        <h2 className="text-xl font-bold mt-10 mb-3">What We Offer</h2>
        <ul className="list-disc pl-6 space-y-2 text-[#475569]">
          <li>A growing library of presentation templates across business, pitch, and strategy categories.</li>
          <li>AI-powered content generation to fill in your template with relevant, on-message text.</li>
          <li>Multi-format export — PPTX, PDF, or high-resolution images.</li>
          <li>Live preview and editing tools to customize fonts, colors, and layout before you download.</li>
        </ul>
      </main>
    </div>
  );
}
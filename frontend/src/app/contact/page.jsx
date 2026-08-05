'use client';

import { useState } from 'react';
import BubbleBackground from '@/components/BubbleBackground';

const FAQS = [
  {
    q: 'I need help adapting a template to my project. Can you assist?',
    a: 'Absolutely — describe what you\'re trying to change (colors, layout, fonts, slide count) using the form below, and our team will get back to you with guidance or a custom adjustment.',
  },
  {
    q: 'I love GoToSlide. How can I contribute or show support?',
    a: 'The best way is sharing GoToSlide with your team or on social media, and sending us feedback on what templates or features you\'d like to see next.',
  },
  {
    q: 'How can I contact the GoToSlide team?',
    a: (
      <>
        You can reach us directly at{' '}
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=support@inteleraai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#f16917] underline"
        >
          support@inteleraai.com
        </a>{' '}
        for any queries, suggestions, or feedback — or use the form below.
      </>
    ),
  },
];

export default function Contact() {
  const [openIndex, setOpenIndex] = useState(null); // ✅ all collapsed by default // last item open by default, like the reference
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col bg-gradient-to-br from-[#F8FAFC] via-[#FAFAFF] to-[#F5F3FF]">
      <BubbleBackground />

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-[#2a2a2a] flex-1 w-full">
        <h1 className="text-4xl font-extrabold mb-2">Support and Contact</h1>
        <p className="text-[#64748B] mb-10">
          Answers to common questions, and a way to reach us directly.
        </p>

        {/* Accordion */}
        <div className="border-t border-[#E2E8F0]">
          {FAQS.map((item, i) => (
            <div key={i} className="border-b border-[#E2E8F0]">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between text-left py-5 font-bold text-[#2a2a2a] hover:text-[#f16917] transition-colors"
              >
                <span>{item.q}</span>
                <svg
                  className={`w-5 h-5 shrink-0 ml-4 transition-transform ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openIndex === i && (
                <div className="pb-5 text-[#475569] leading-7">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
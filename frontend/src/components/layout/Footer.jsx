'use client';

import Link from 'next/link';
import BubbleBackground from '@/components/BubbleBackground';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#E2E8F0] bg-gradient-to-br from-[#F8FAFC] via-[#FAFAFF] to-[#F5F3FF] pt-14 pb-8">

      <BubbleBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">

          {/* Left */}
          <div className="max-w-md">

            <Link
              href="/"
              className="flex items-center gap-3 mb-5 group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md">
                G
              </div>

              <span className="font-extrabold text-3xl tracking-tight text-[#0F172A]">
                GoTo<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#A855F7]">
              Slide
            </span>
              </span>
            </Link>

            <p className="text-[#475569] text-base leading-8 max-w-md">
              Premium presentation templates and AI-powered layout tools
              designed to make your next business meeting, strategy review,
              investor pitch, or client presentation look exceptional.
            </p>

          </div>

          {/* Right */}
          <div className="min-w-[180px]">

            <h4 className="font-bold text-[#0F172A] text-sm tracking-[0.2em] uppercase mb-5">
              Company
            </h4>

            <ul className="space-y-4">
              <li>
                <Link
                  href="/about-us"
                  className="text-[#475569] hover:text-[#7C3AED] transition-colors"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/help-center"
                  className="text-[#475569] hover:text-[#7C3AED] transition-colors"
                >
                  Help Center
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-[#475569] hover:text-[#7C3AED] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>

          </div>

        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-[#E2E8F0]" />

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5">

          <p className="text-[#64748B] text-sm">
            © {new Date().getFullYear()} GoToSlide. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <Link
              href="/privacy-policy"
              className="text-[#475569] hover:text-[#7C3AED] transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms-of-service"
              className="text-[#475569] hover:text-[#7C3AED] transition-colors"
            >
              Terms of Service
            </Link>

            <Link
              href="/cookies"
              className="text-[#475569] hover:text-[#7C3AED] transition-colors"
            >
              Cookie Policy
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
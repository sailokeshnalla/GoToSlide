'use client';

import Link from 'next/link';
import BubbleBackground from '@/components/BubbleBackground';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#E2E8F0] bg-white pt-14 pb-8">

      <BubbleBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">

          {/* Left */}
          <div className="max-w-md">
            <div className="h-[80px] flex items-center mb-6">
              <Link
                href="/"
                className="group flex items-center"
              >
                <img 
                  src="/images/logo.png" 
                  alt="GoToSlide" 
                  className="h-[80px] w-auto object-contain transition-transform group-hover:scale-105" 
                />
              </Link>
            </div>
            <p className="text-[#475569] text-base leading-8 max-w-md">
              Premium presentation templates and AI-powered layout tools
              designed to make your next business meeting, strategy review,
              investor pitch, or client presentation look exceptional.
            </p>

          </div>

          {/* Right */}
          <div className="min-w-[180px]">
            <div className="h-[80px] flex items-center mb-6">
              <h4 className="font-bold text-[#2a2a2a] text-sm tracking-[0.2em] uppercase">
                Company
              </h4>
            </div>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/about-us"
                  className="text-[#475569] hover:text-[#f16917] transition-colors"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/help-center"
                  className="text-[#475569] hover:text-[#f16917] transition-colors"
                >
                  Help Center
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-[#475569] hover:text-[#f16917] transition-colors"
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
              className="text-[#475569] hover:text-[#f16917] transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms-of-service"
              className="text-[#475569] hover:text-[#f16917] transition-colors"
            >
              Terms of Service
            </Link>

            <Link
              href="/cookies"
              className="text-[#475569] hover:text-[#f16917] transition-colors"
            >
              Cookie Policy
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
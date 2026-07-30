import BubbleBackground from '@/components/BubbleBackground';

export function LegalShell({ title, updated, children }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#FAFAFF] to-[#F5F3FF]">
      <BubbleBackground />
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-[#0F172A]">
        <h1 className="text-4xl font-extrabold mb-2">{title}</h1>
        {updated && (
          <p className="text-[#64748B] text-sm mb-10">Last updated: {updated}</p>
        )}
        {children}
      </main>
    </div>
  );
}

export function H2({ children }) {
  return <h2 className="text-xl font-bold mt-8 mb-3">{children}</h2>;
}

export function P({ children }) {
  return <p className="text-[#475569] leading-7 mb-4">{children}</p>;
}

export function UL({ children }) {
  return <ul className="list-disc pl-6 space-y-2 text-[#475569] leading-7">{children}</ul>;
}

export function LI({ children }) {
  return <li>{children}</li>;
}

export function A({ href, children, className = '' }) {
  // Convert mailto: links to a Gmail compose URL so they open directly
  // in Gmail (web) instead of triggering the OS "choose an app" dialog.
  const isMailto = href?.startsWith('mailto:');
  const finalHref = isMailto
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        href.replace('mailto:', '')
      )}`
    : href;

  return (
    <a
      href={finalHref}
      target={isMailto ? '_blank' : undefined}
      rel={isMailto ? 'noopener noreferrer' : undefined}
      className={`text-[#7C3AED] underline ${className}`.trim()}
    >
      {children}
    </a>
  );
}
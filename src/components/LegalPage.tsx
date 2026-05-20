import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

interface Section {
  title: string;
  body: string[];
}

interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  sections: Section[];
}

export default function LegalPage({ eyebrow, title, intro, updated = "2026-05-19", sections }: Props) {
  return (
    <div className="min-h-screen bg-[#f7efe3] text-[#24160f]">
      <header className="border-b border-[#2b1a12]/10 bg-[#f7efe3]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-black tracking-tight">BULUBA</Link>
          <Link href="/tool" className="rounded-lg bg-[#24160f] px-4 py-2 text-sm font-bold text-white hover:bg-[#c7512f]">
            在线试用
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-14">
        <div className="rounded-lg border border-[#2b1a12]/10 bg-white p-7 shadow-sm sm:p-10">
          <span className="text-sm font-black uppercase tracking-[0.16em] text-[#c7512f]">{eyebrow}</span>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#6d5a4c]">{intro}</p>
          <p className="mt-4 text-sm text-[#8a7666]">最后更新：{updated}</p>
        </div>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-[#2b1a12]/10 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#6d5a4c]">
                {section.body.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

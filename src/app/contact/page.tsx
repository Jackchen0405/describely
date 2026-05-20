import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

const contactItems = [
  {
    title: "在线咨询",
    desc: "页面右下角有在线聊天入口。你可以直接发送使用问题、充值问题或生成结果反馈。",
    value: "优先使用右下角聊天窗口",
  },
  {
    title: "问题反馈",
    desc: "如果遇到登录、额度扣减、生成失败、历史记录异常等问题，请说明账号、时间和具体操作。",
    value: "也可以使用站内反馈页",
  },
  {
    title: "人工处理",
    desc: "测试阶段的账号、额度和异常问题会人工核查。请尽量保留截图或生成时间，方便快速定位。",
    value: "测试期人工核查",
  },
];

export default function ContactPage() {
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
        <div className="rounded-lg border border-[#2b1a12]/10 bg-[#121614] p-7 text-white shadow-sm sm:p-10">
          <span className="text-sm font-black uppercase tracking-[0.16em] text-[#9be3d4]">Contact</span>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">联系我们</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/66">
            BULUBA 目前处于测试阶段。前期先使用在线聊天承接咨询，不强制用户加微信或发邮件；涉及额度、账号或生成异常的问题，会尽量人工核查处理。
          </p>
          <Link href="/feedback" className="mt-6 inline-flex rounded-lg bg-[#f05f3b] px-5 py-3 text-sm font-black text-white hover:bg-[#d94c2e]">
            提交功能建议
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {contactItems.map((item) => (
            <article key={item.title} className="flex h-full flex-col rounded-lg border border-[#2b1a12]/10 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#6d5a4c]">{item.desc}</p>
              <p className="mt-auto rounded-lg bg-[#f7efe3] px-4 py-3 text-sm font-bold text-[#c7512f]">{item.value}</p>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

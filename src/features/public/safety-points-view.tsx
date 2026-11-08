import { InfoCard } from "@/components/ui/info-card";
import { SectionLabel } from "@/components/ui/section-label";

const benefitExamples = [
  {
    title: "교통안전 제휴 혜택",
    description: "안전한 이동을 돕는 제휴 서비스 혜택으로 활용하는 방안을 검토하고 있어요.",
    icon: "partnership" as const,
  },
  {
    title: "안전용품",
    description: "보행·운전 안전에 필요한 용품과 교환하는 방안을 검토하고 있어요.",
    icon: "safety" as const,
  },
  {
    title: "교통안전 사업 기부",
    description: "더 안전한 도로를 만드는 사업에 포인트를 기부하는 방안을 검토하고 있어요.",
    icon: "donation" as const,
  },
];

type BenefitIconName = (typeof benefitExamples)[number]["icon"];

function RewardIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <path d="m16 4 3.2 6.1 6.8 1.2-4.8 5 .9 7-6.1-3-6.1 3 .9-7-4.8-5 6.8-1.2L16 4Z" />
      <path d="m13.5 16 1.7 1.7 3.6-4" />
    </svg>
  );
}

function BenefitIcon({ name }: { name: BenefitIconName }) {
  if (name === "partnership") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M8.5 12.5 11 15a2 2 0 0 0 2.8 0l5.5-5.5" />
        <path d="m3.7 10.5 4-4 3 1.1 2.6-1.1 7 7-4 4-2.2-2.2" />
        <path d="m3.7 10.5 4.8 4.8" />
      </svg>
    );
  }

  if (name === "safety") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M12 3.5 19 6v5.2c0 4.4-2.9 7.7-7 9.3-4.1-1.6-7-4.9-7-9.3V6l7-2.5Z" />
        <path d="m8.7 12 2.1 2.1 4.5-4.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.1-7.5-10A4 4 0 0 1 12 8.6a4 4 0 0 1 7.5 1.9c0 5.9-7.5 10-7.5 10Z" />
      <path d="M12 8.6v6.9M9.5 13h5" />
    </svg>
  );
}

export default function SafetyPointsView() {
  return (
    <div className="page-container pb-8">
      <header className="pt-3">
        <SectionLabel tone="mint">SAFETY REWARD</SectionLabel>
        <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.22] tracking-[-0.055em] text-[#12304a]">
          인정된 신고에는
          <br />
          안전 포인트를 받을 수 있어요.
        </h1>
        <p className="mt-4 text-[15px] leading-6 text-[#6f879f]">
          향후 관계기관에서 위반 사실이 확인된 신고에 포인트가 지급될 수 있습니다.
        </p>
      </header>

      <section className="mt-8" aria-labelledby="reward-status-heading">
        <div className="rounded-2xl border border-[#ccecdf] bg-[#e7f8f3] px-5 py-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-white text-[#168f73]">
            <RewardIcon />
          </span>
          <h2 id="reward-status-heading" className="mt-4 text-xl font-extrabold tracking-[-0.04em] text-[#12304a]">
            포인트 제도 준비 중
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5f7f77]">
            지급 기준과 포인트 규모는 관계기관 확인 절차와 운영 정책이 마련된 뒤 안내할 예정입니다.
          </p>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="reward-use-heading">
        <p className="text-xs font-extrabold tracking-[0.07em] text-[#168f73]">향후 활용 예시</p>
        <h2 id="reward-use-heading" className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-[#12304a]">
          안전을 위한 혜택으로 연결해요
        </h2>

        <ul className="mt-4 space-y-3">
          {benefitExamples.map((benefit) => (
            <li key={benefit.title} className="flex items-start gap-4 rounded-2xl border border-[#dce7f1] bg-white p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#edf6ff] text-[#2f80ed]">
                <BenefitIcon name={benefit.icon} />
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-[15px] font-extrabold tracking-[-0.025em] text-[#12304a]">{benefit.title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-[#6f879f]">{benefit.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <InfoCard tone="orange" title="데모 안내" className="mt-6">
        현재 화면은 향후 포인트 제도를 설명하기 위한 데모입니다. 실제 포인트가 적립되거나 지급되지 않습니다.
      </InfoCard>
    </div>
  );
}

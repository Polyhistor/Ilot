import { UserPlus, Settings, Sparkles, Rocket } from 'lucide-react'

const STEPS = [
  {
    Icon: UserPlus,
    bg: 'bg-blue-50',
    n: 1,
    title: 'Selection',
    desc: 'Identify your specific corporate or legal need within the ILOT Digital Headquarters.',
  },
  {
    Icon: Settings,
    bg: 'bg-fuchsia-50',
    n: 2,
    title: 'One-Touch Initiation',
    desc: 'Trigger a secure WhatsApp connection with a pre-filled service reference. No forms required.',
  },
  {
    Icon: Sparkles,
    bg: 'bg-orange-50',
    n: 3,
    title: 'Expert Handling',
    desc: 'Professional consultants and legal experts take over, gathering data and filing documents on your behalf.',
  },
  {
    Icon: Rocket,
    bg: 'bg-emerald-50',
    n: 4,
    title: 'Fulfillment',
    desc: 'Receive your official permits, finalized contracts, or comprehensive reports directly in the secure chat.',
  },
]

export function ProcessSteps() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 shadow-sm mb-8">
            <span>The Process</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-[#0B0B1A] mb-6 tracking-tight">
            A clean path in <span className="italic">four steps.</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto italic">
            A clean, professional path from inquiry to result. We demystify the process so you can focus on your business.
          </p>
        </div>

        <div className="relative">
          {/* Continuous Horizontal Line */}
          <div className="absolute top-[104px] left-0 right-0 h-[1px] bg-gray-100 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-16">
            {STEPS.map(({ Icon, bg, n, title, desc }) => (
              <div key={n} className="relative flex flex-col text-left">
                <div className="mb-12 relative inline-flex self-start">
                  <div className={`w-[88px] h-[88px] rounded-3xl ${bg} flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]`}>
                    <Icon className="w-8 h-8 text-[#0B0B1A]" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#0B0B1A] rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                    {n}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#0B0B1A] mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed pr-4">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

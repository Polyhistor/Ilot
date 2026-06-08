import { MessageSquare } from 'lucide-react'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''
const WA_MESSAGE = encodeURIComponent("Hi Ilot, I'd like to schedule a call to discuss my legal needs.")

export function CTABanner() {
  const href = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`

  return (
    <section className="pt-12 pb-10 md:pt-32 md:pb-16 bg-white overflow-hidden relative flex flex-col items-center justify-center">
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#1b1f27] rounded-2xl md:rounded-[2rem] p-8 md:p-20 text-center flex flex-col items-center shadow-2xl">
          <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-white mb-4 md:mb-6" strokeWidth={1.5} />
          <h2 className="text-xl md:text-5xl font-bold text-white mb-3 md:mb-6 tracking-tight">
            Let&apos;s Take Your Business Further
          </h2>
          <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed">
            Partner with us for tailored legal and corporate strategies that drive success. Our experts are ready to help you secure your future—let&apos;s make it happen!
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#1b1f27] px-6 py-3 md:px-8 md:py-4 rounded-full text-sm md:text-base font-bold hover:bg-gray-100 transition-colors shadow-sm"
          >
            Schedule a Call
          </a>
        </div>
      </div>

      {/* Marquee Text */}
      <div className="relative flex overflow-hidden whitespace-nowrap pointer-events-none select-none mt-8 md:mt-16 w-full -mb-8 md:-mb-24">
        <div className="flex items-center w-max" style={{ animation: 'marquee 45s linear infinite' }}>
          <div className="flex items-center px-4">
            <span className="text-5xl md:text-[11rem] font-bold text-gray-200 tracking-tighter px-4">
              Secure. Invest. Grow. Succeed.
            </span>
            <span className="text-5xl md:text-[11rem] font-bold text-gray-200 tracking-tighter px-4">
              Secure. Invest. Grow. Succeed.
            </span>
          </div>
          <div className="flex items-center px-4">
            <span className="text-5xl md:text-[11rem] font-bold text-gray-200 tracking-tighter px-4">
              Secure. Invest. Grow. Succeed.
            </span>
            <span className="text-5xl md:text-[11rem] font-bold text-gray-200 tracking-tighter px-4">
              Secure. Invest. Grow. Succeed.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

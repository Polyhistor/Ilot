import { MessageSquare } from 'lucide-react'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''
const WA_MESSAGE = encodeURIComponent("Hi Ilot, I'd like to schedule a call to discuss my legal needs.")

export function CTABanner() {
  const href = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`

  return (
    <section className="pt-32 pb-16 bg-white overflow-hidden relative flex flex-col items-center justify-center">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#1b1f27] rounded-[2rem] p-12 md:p-20 text-center flex flex-col items-center shadow-2xl">
          <MessageSquare className="w-8 h-8 text-white mb-6" strokeWidth={1.5} />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Let&apos;s Take Your Business Further
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Partner with us for tailored legal and corporate strategies that drive success. Our experts are ready to help you secure your future—let&apos;s make it happen!
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#1b1f27] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-sm"
          >
            Schedule a Call
          </a>
        </div>
      </div>

      {/* Marquee Text */}
      <div className="relative flex overflow-hidden whitespace-nowrap pointer-events-none select-none mt-16 w-full -mb-12 md:-mb-24">
        <div className="animate-scroll-left flex items-center w-max">
          <div className="flex items-center px-4">
            <span className="text-8xl md:text-[11rem] font-bold text-gray-200 tracking-tighter px-4">
              Secure. Invest. Grow. Succeed.
            </span>
            <span className="text-8xl md:text-[11rem] font-bold text-gray-200 tracking-tighter px-4">
              Secure. Invest. Grow. Succeed.
            </span>
          </div>
          <div className="flex items-center px-4">
            <span className="text-8xl md:text-[11rem] font-bold text-gray-200 tracking-tighter px-4">
              Secure. Invest. Grow. Succeed.
            </span>
            <span className="text-8xl md:text-[11rem] font-bold text-gray-200 tracking-tighter px-4">
              Secure. Invest. Grow. Succeed.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

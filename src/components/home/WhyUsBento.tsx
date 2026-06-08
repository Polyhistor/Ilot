import Image from 'next/image'

export function WhyUsBento() {
  return (
    <section className="py-12 md:py-24 bg-[#F4F4F0] text-gray-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

            {/* Title Area */}
            <div className="flex flex-col justify-center pr-0 md:pr-8 pb-4 md:pb-0">
              <h2 className="text-xl md:text-5xl font-bold text-[#0B0B1A] mb-3 md:mb-6 leading-tight">
                A superior alternative to fragmented agencies.
              </h2>
              <p className="text-gray-600 text-sm md:text-lg">
                We eliminate the traditional friction of Indonesian bureaucracy, replacing it with a managed, elite experience.
              </p>
            </div>

            {/* Card 1 */}
            <div className="rounded-2xl md:rounded-3xl p-5 md:p-8 flex flex-col justify-between min-h-[180px] md:min-h-[320px] relative overflow-hidden group">
              <Image
                src="/bento/Frictionless%20access.webp"
                alt="Frictionless Access"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/70" />
              <h3 className="text-base md:text-2xl font-bold text-white relative z-10">Frictionless Access</h3>
              <p className="text-white/85 text-xs md:text-base leading-relaxed mt-3 md:mt-8 relative z-10">
                Skip the endless forms. Our One-Touch system connects you instantly with a dedicated specialist ready to execute your request.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl md:rounded-3xl p-5 md:p-8 flex flex-col justify-between min-h-[180px] md:min-h-[320px] relative overflow-hidden group">
              <Image
                src="/bento/regulatory%20Authority.webp"
                alt="Regulatory Authority"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/70" />
              <h3 className="text-base md:text-2xl font-bold text-white relative z-10">Regulatory Authority</h3>
              <p className="text-white/85 text-xs md:text-base leading-relaxed mt-3 md:mt-8 relative z-10">
                Operate with absolute peace of mind. We are a Meta-verified, fully compliant legal firm recognized across all Indonesian jurisdictions.
              </p>
            </div>

            {/* Card 3 — spans 2 columns, image focal panel */}
            <div className="md:col-span-2 rounded-2xl md:rounded-3xl p-5 md:p-8 flex flex-col justify-between min-h-[200px] md:min-h-[360px] relative overflow-hidden group">
              <Image
                src="/bento/strategic%20efficiencies.webp"
                alt="Strategic Efficiency"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/70" />
              <h3 className="text-base md:text-2xl font-bold text-white relative z-10">Strategic Efficiency</h3>
              <p className="text-white/85 font-medium text-xs md:text-base leading-relaxed max-w-md relative z-10">
                Time is your most valuable asset. We eliminate administrative red tape to deliver rapid, legally sound results without the wait.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl md:rounded-3xl p-5 md:p-8 flex flex-col justify-between min-h-[200px] md:min-h-[360px] relative overflow-hidden group">
              <Image
                src="/bento/Absolute%20Transparency.webp"
                alt="Absolute Transparency"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/70" />
              <h3 className="text-base md:text-2xl font-bold text-white relative z-10">Absolute Transparency</h3>
              <p className="text-white/85 text-xs md:text-base leading-relaxed mt-3 md:mt-8 relative z-10">
                No black boxes. Enjoy real-time visibility and crystal-clear communication directly through our secure WhatsApp ecosystem.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

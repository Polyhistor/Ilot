import Image from 'next/image'

export function WhyUsBento() {
  return (
    <section className="py-24 bg-[#F4F4F0] text-gray-900">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Title Area */}
            <div className="flex flex-col justify-center pr-8 pb-8 md:pb-0">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0B0B1A] mb-6 leading-tight">
                A superior alternative to fragmented agencies.
              </h2>
              <p className="text-gray-600 text-lg">
                We eliminate the traditional friction of Indonesian bureaucracy, replacing it with a managed, elite experience.
              </p>
            </div>

            {/* Card 1 */}
            <div className="bg-[#F9F9F6] rounded-3xl p-8 flex flex-col justify-between min-h-[320px]">
              <h3 className="text-2xl font-bold text-[#0B0B1A]">Frictionless Access</h3>
              <p className="text-gray-600 text-base leading-relaxed mt-8">
                Skip the endless forms. Our One-Touch system connects you instantly with a dedicated specialist ready to execute your request.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-50 rounded-3xl p-8 flex flex-col justify-between min-h-[320px]">
              <h3 className="text-2xl font-bold text-[#0B0B1A]">Regulatory Authority</h3>
              <p className="text-gray-600 text-base leading-relaxed mt-8">
                Operate with absolute peace of mind. We are a Meta-verified, fully compliant legal firm recognized across all Indonesian jurisdictions.
              </p>
            </div>

            {/* Card 3 — spans 2 columns */}
            <div className="md:col-span-2 rounded-3xl p-8 flex flex-col justify-between min-h-[360px] relative overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
                alt="Strategic Efficiency"
                fill
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/20 to-white/90" />
              <h3 className="text-2xl font-bold text-[#0B0B1A] relative z-10">Strategic Efficiency</h3>
              <p className="text-gray-800 font-medium text-base leading-relaxed relative z-10 max-w-md">
                Time is your most valuable asset. We eliminate administrative red tape to deliver rapid, legally sound results without the wait.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-3xl p-8 flex flex-col justify-between min-h-[360px] relative overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=800&auto=format&fit=crop"
                alt="Absolute Transparency"
                fill
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/20 to-white/90" />
              <h3 className="text-2xl font-bold text-[#0B0B1A] relative z-10">Absolute Transparency</h3>
              <p className="text-gray-800 font-medium text-base leading-relaxed relative z-10">
                No black boxes. Enjoy real-time visibility and crystal-clear communication directly through our secure WhatsApp ecosystem.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

import Image from 'next/image'

const TESTIMONIALS = [
  {
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    quote: 'Setting up a PT PMA and securing my Investor KITAS felt daunting from abroad. ILOT cut through the Indonesian bureaucracy with incredible speed. Their professional handling meant my company was operational weeks ahead of schedule.',
    name: 'Marcus V.',
    role: 'Tech Entrepreneur, Germany',
  },
  {
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    quote: "When investing in Bali real estate, you hear horror stories. ILOT's property due diligence and land verification gave me absolute security. Their legal advice is bulletproof. I wouldn't buy a square meter without them.",
    name: 'Sarah Jenkins',
    role: 'Real Estate Investor, Australia',
  },
  {
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    quote: "Relocating my life and remote work setup to Jakarta was entirely stress-free. ILOT managed everything seamlessly in the background. It's the ultimate concierge legal service for expats.",
    name: 'David C.',
    role: 'Remote Executive, UK',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-12 md:py-32 bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-16 text-left">
          <div className="inline-flex items-center space-x-2 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-3 md:mb-6">
            <span>Testimonials</span>
          </div>
          <h2 className="text-2xl md:text-6xl font-medium text-[#0B0B1A] tracking-tight leading-[1.1]">
            Don&apos;t take our word for it!<br />
            Hear it from our partners.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {TESTIMONIALS.map(({ photo, quote, name, role }) => (
            <div key={name} className="bg-white p-5 md:p-10 rounded-2xl md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full">
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden mb-4 md:mb-8">
                <Image src={photo} alt={name} fill className="object-cover" sizes="48px" />
              </div>
              <p className="text-[#0B0B1A] text-xs md:text-[15px] leading-relaxed mb-6 md:mb-12 flex-grow">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="mt-auto">
                <h4 className="font-[Caveat] text-2xl md:text-3xl text-[#0B0B1A] mb-1">{name}</h4>
                <p className="text-[10px] md:text-xs text-gray-500">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

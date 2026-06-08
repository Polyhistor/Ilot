import Image from 'next/image'

export function AboutSection() {
  return (
    <section className="py-12 md:py-24 bg-white text-gray-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-16">
        <div className="md:w-1/3">
          <div className="w-full max-w-md md:max-w-none aspect-square rounded-2xl overflow-hidden relative">
            <Image
              src="/About_Ilot.webp"
              alt="About Ilot"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          </div>
          <p className="text-sm text-gray-500 mt-6 leading-relaxed text-center">
            Since inception, we have significantly invested in and developed our legal and corporate assets globally.
          </p>
        </div>
        <div className="md:w-2/3 flex items-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-500 leading-tight">
            ILOT is managing comprehensive{' '}
            <span className="text-[#0B0B1A] font-bold">legal, immigration, and corporate structuring</span>
            {' '}for foreign entities in Indonesia, ensuring absolute compliance and guaranteed success in every jurisdiction.
          </h2>
        </div>
      </div>
    </section>
  )
}

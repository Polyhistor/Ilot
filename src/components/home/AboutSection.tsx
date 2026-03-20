import Image from 'next/image'

export function AboutSection() {
  return (
    <section className="py-24 bg-white text-gray-900">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-16">
        <div className="md:w-1/3">
          <div className="w-48 h-48 bg-gray-200 rounded-lg overflow-hidden relative">
            <Image
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
              alt="Building"
              fill
              className="w-full h-full object-cover opacity-80"
              sizes="192px"
            />
          </div>
          <p className="text-sm text-gray-500 mt-6 leading-relaxed">
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

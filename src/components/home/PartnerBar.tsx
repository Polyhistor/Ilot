const PARTNERS = ['Deloitte.', 'KPMG', 'PwC', 'EY', 'Standard Chartered', 'McKinsey & Company']

export function PartnerBar() {
  return (
    <section className="border-b border-gray-200 bg-white py-8 text-gray-900 overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/4 shrink-0 md:border-r border-gray-200 md:pr-8 text-center md:text-left">
          <p className="font-bold text-lg leading-tight">
            110+ happy clients <br />already on board.
          </p>
        </div>
        <div className="md:w-3/4 overflow-hidden relative flex items-center w-full">
          {/* Gradient masks for smooth fade in/out */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />

          <div className="flex w-max animate-scroll-left opacity-60 grayscale items-center">
            {/* Original Set */}
            <div className="flex space-x-16 px-8 items-center">
              {PARTNERS.map((name) => (
                <div key={name} className="text-xl font-bold whitespace-nowrap">{name}</div>
              ))}
            </div>
            {/* Duplicated Set */}
            <div className="flex space-x-16 px-8 items-center">
              {PARTNERS.map((name) => (
                <div key={`d-${name}`} className="text-xl font-bold whitespace-nowrap">{name}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

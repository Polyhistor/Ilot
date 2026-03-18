const PARTNERS = ['Deloitte', 'KPMG', 'PwC', 'EY', 'BDO', 'Grant Thornton', 'RSM']

export function PartnerBar() {
  const doubled = [...PARTNERS, ...PARTNERS]
  return (
    <section className="bg-surface py-12 overflow-hidden">
      <div className="container-site px-6 md:px-12 mb-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted font-semibold">
          Trusted by clients advised by
        </p>
        <span className="text-foreground font-bold">110+ happy clients</span>
      </div>
      <div className="relative flex">
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((name, i) => (
            <span
              key={i}
              className="mx-12 text-lg font-bold text-foreground/30 hover:text-foreground/60 transition-colors cursor-default"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

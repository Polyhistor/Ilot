'use client'

import { WhatsAppCTA } from './WhatsAppCTA'

export function WhatsAppFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <WhatsAppCTA
        variant="primary"
        size="md"
        label=""
        className="w-14 h-14 rounded-full justify-center shadow-2xl px-0!"
        aria-label="Contact us on WhatsApp"
      />
    </div>
  )
}

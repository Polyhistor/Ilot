'use client'

import { Search, X } from 'lucide-react'
import { useServiceSearch } from './CategoryServices'

export function ServiceSearch() {
  const { query, setQuery, totalResults, inputRef } = useServiceSearch()

  return (
    <div className="flex-1 max-w-xl w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services..."
          className="w-full pl-11 pr-11 py-3 text-sm rounded-xl bg-[#F4F4F0] text-[#0B0B1A] placeholder:text-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B0B1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {query && (
        <p className="text-xs text-muted mt-2 ml-1">
          {totalResults} {totalResults === 1 ? 'service' : 'services'} found
        </p>
      )}
    </div>
  )
}

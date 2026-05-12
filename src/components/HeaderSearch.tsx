'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/artists?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }

  return (
    <form className="nav-search" onSubmit={handleSearch} role="search">
      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <input
        className="nav-search-input"
        placeholder="Search artists, shows, venues…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search iHYPE"
      />
      <span className="nav-search-kbd">⌘</span>
      <span className="nav-search-kbd">K</span>
    </form>
  );
}

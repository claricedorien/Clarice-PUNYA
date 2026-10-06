import React, { useState } from 'react';
import { Book, BOOKS, CATEGORIES, CategoryFilter } from '../data/books';
import { Volume2, VolumeX, BookOpen, Compass, List, X, Search, ChevronRight, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { cursorManager } from './CustomCursor';

interface LibraryHUDProps {
  activeCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  hoveredBook: Book | null;
  onSelectBook: (book: Book) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ambientTheme: 'astral' | 'golden' | 'emerald';
  onChangeTheme: (theme: 'astral' | 'golden' | 'emerald') => void;
}

export const LibraryHUD: React.FC<LibraryHUDProps> = ({
  activeCategory,
  onSelectCategory,
  hoveredBook,
  onSelectBook,
  soundEnabled,
  onToggleSound,
  ambientTheme,
  onChangeTheme,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = BOOKS.filter((b) => {
    const matchCat = activeCategory === 'All Codices' || b.category === activeCategory;
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* TOP HEADER HUD */}
      <header className="fixed top-0 left-0 right-0 z-30 px-6 py-5 flex items-center justify-between pointer-events-none">
        {/* Left: Brand Identity */}
        <div
          onPointerEnter={() => cursorManager.setMode('hover-button')}
          onPointerLeave={() => cursorManager.setMode('default')}
          className="pointer-events-auto flex items-center space-x-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400" />
          <div className="flex flex-col">
            <span className="font-accent text-xs tracking-[0.25em] text-white uppercase font-bold">
              Aetheria
            </span>
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono">
              Floating Story Library
            </span>
          </div>
        </div>

        {/* Center: Category Filter Tabs */}
        <nav className="pointer-events-auto hidden md:flex items-center space-x-1.5 bg-black/50 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-full">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All Codices'
                ? BOOKS.length
                : BOOKS.filter((b) => b.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onPointerEnter={() => cursorManager.setMode('hover-button')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => {
                  sound.playClick(440);
                  onSelectCategory(cat);
                }}
                className={`text-xs px-3.5 py-1 rounded-full transition-all tracking-wider ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{cat}</span>
                <span className={`ml-1.5 text-[10px] ${isActive ? 'text-black/60' : 'text-neutral-500'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Sound, Ambient Theme & Catalog Drawer Trigger */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {/* Theme selector */}
          <div className="hidden sm:flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1.5">
            <button
              onPointerEnter={() => cursorManager.setMode('hover-button')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={() => {
                sound.playClick(500);
                onChangeTheme('astral');
              }}
              className={`w-3.5 h-3.5 rounded-full transition-transform mr-1.5 ${
                ambientTheme === 'astral' ? 'scale-125 ring-2 ring-sky-400' : 'opacity-60'
              }`}
              style={{ backgroundColor: '#38bdf8' }}
              title="Astral Void"
            />
            <button
              onPointerEnter={() => cursorManager.setMode('hover-button')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={() => {
                sound.playClick(600);
                onChangeTheme('golden');
              }}
              className={`w-3.5 h-3.5 rounded-full transition-transform mr-1.5 ${
                ambientTheme === 'golden' ? 'scale-125 ring-2 ring-amber-400' : 'opacity-60'
              }`}
              style={{ backgroundColor: '#e2b45e' }}
              title="Golden Stardust"
            />
            <button
              onPointerEnter={() => cursorManager.setMode('hover-button')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={() => {
                sound.playClick(700);
                onChangeTheme('emerald');
              }}
              className={`w-3.5 h-3.5 rounded-full transition-transform ${
                ambientTheme === 'emerald' ? 'scale-125 ring-2 ring-emerald-400' : 'opacity-60'
              }`}
              style={{ backgroundColor: '#34d399' }}
              title="Emerald Void"
            />
          </div>

          {/* Sound Toggle */}
          <button
            onPointerEnter={() => cursorManager.setMode('hover-button')}
            onPointerLeave={() => cursorManager.setMode('default')}
            onClick={() => {
              onToggleSound();
            }}
            className="flex items-center space-x-2 bg-black/40 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-xs text-neutral-300 hover:text-white hover:border-white/30 transition-colors"
            title={soundEnabled ? 'Mute Atmospheric Audio' : 'Unmute Ambient Sound'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-amber-300 font-mono">
                  Audio On
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
                  Muted
                </span>
              </>
            )}
          </button>

          {/* Catalog Index Button */}
          <button
            onPointerEnter={() => cursorManager.setMode('hover-button')}
            onPointerLeave={() => cursorManager.setMode('default')}
            onClick={() => {
              sound.playClick(440);
              setDrawerOpen(true);
            }}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs uppercase tracking-widest transition-all font-medium"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Codex Index</span>
          </button>
        </div>
      </header>

      {/* FLOATING HOVER CARD WITH DEPTH & READ BUTTON */}
      {hoveredBook && (
        <aside
          aria-label="Book preview"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-all duration-300 ease-out animate-fadeIn"
        >
          <div className="w-[340px] sm:w-[380px] p-4 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/90 flex items-center space-x-4">
            <img
              src={hoveredBook.coverImage}
              alt={hoveredBook.title}
              className="w-14 h-20 object-cover rounded-lg border border-white/20 shrink-0 shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase mb-0.5">
                <span style={{ color: hoveredBook.accentColor }}>{hoveredBook.category}</span>
                <span className="text-neutral-400">{hoveredBook.readingTime}</span>
              </div>
              <h3 className="font-accent text-sm text-white font-bold tracking-wide truncate">
                {hoveredBook.title}
              </h3>
              <p className="text-xs text-neutral-300 italic font-serif-display truncate mb-2">
                {hoveredBook.subtitle}
              </p>
              <button
                onPointerEnter={() => cursorManager.setMode('hover-button')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => {
                  sound.playBookOpen();
                  onSelectBook(hoveredBook);
                }}
                className="w-full flex items-center justify-center space-x-2 py-1 px-3 rounded-full text-[11px] font-mono tracking-widest uppercase text-black bg-white hover:bg-amber-300 transition-colors font-semibold"
              >
                <span>OPEN PORTAL</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* BOTTOM FOOTER HUD INSTRUCTIONS */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between pointer-events-none">
        {/* Left Instruction */}
        <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-neutral-400 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
          <Compass className="w-3.5 h-3.5 text-neutral-400" />
          <span>DRAG TO ROTATE · SCROLL TO ZOOM · HOVER & CLICK TO ENTER</span>
        </div>

        {/* Center: Mobile Category Selector */}
        <div className="md:hidden pointer-events-auto flex items-center bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs">
          <select
            value={activeCategory}
            onChange={(e) => onSelectCategory(e.target.value as CategoryFilter)}
            className="bg-transparent text-white text-xs outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-neutral-900 text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Right Book Jump Pill */}
        <div className="pointer-events-auto flex items-center space-x-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
          <span className="text-[10px] font-mono text-neutral-500 mr-1 hidden sm:inline">CODICES:</span>
          {BOOKS.map((b, idx) => (
            <button
              key={b.id}
              onPointerEnter={() => cursorManager.setMode('hover-button')}
              onPointerLeave={() => cursorManager.setMode('default')}
              onClick={() => {
                sound.playBookOpen();
                onSelectBook(b);
              }}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono text-neutral-400 hover:text-white hover:bg-white/20 transition-colors"
              title={`Read: ${b.title}`}
            >
              0{idx + 1}
            </button>
          ))}
        </div>
      </footer>

      {/* CODEX CATALOG DRAWER (SLIDE-OUT) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md h-full bg-[#0a0a0f] border-l border-white/15 p-6 flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="font-accent text-sm tracking-[0.2em] text-white uppercase">
                  Library Codex Index
                </h3>
              </div>
              <button
                onPointerEnter={() => cursorManager.setMode('hover-button')}
                onPointerLeave={() => cursorManager.setMode('default')}
                onClick={() => {
                  sound.playClick(320);
                  setDrawerOpen(false);
                }}
                className="p-1 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="my-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search codices by title, author, or lore..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Book List in Drawer */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  onPointerEnter={() => cursorManager.setMode('hover-button')}
                  onPointerLeave={() => cursorManager.setMode('default')}
                  onClick={() => {
                    sound.playBookOpen();
                    setDrawerOpen(false);
                    onSelectBook(book);
                  }}
                  className="group p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 cursor-pointer transition-all flex items-center space-x-4"
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded border border-white/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-0.5">
                      <span style={{ color: book.accentColor }}>{book.category}</span>
                      <span className="text-neutral-500">{book.readingTime}</span>
                    </div>
                    <h4 className="font-accent text-sm text-white font-medium truncate group-hover:text-amber-300 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-neutral-400 italic font-serif-display truncate">
                      {book.subtitle}
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono block mt-1">
                      {book.year}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-white/10 text-center text-[10px] font-mono text-neutral-500">
              AETHERIA ARCHIVAL SYSTEM · 7 CODICES SUSPENDED IN ZERO GRAVITY
            </div>
          </div>
        </div>
      )}
    </>
  );
};

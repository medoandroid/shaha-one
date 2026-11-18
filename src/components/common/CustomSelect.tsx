import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search, X, Sparkles } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
  badgeColor?: string;
  colorDot?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'اختر من القائمة...',
  label,
  required,
  disabled = false,
  searchable = true,
  searchPlaceholder = 'ابحث في الخيارات...',
  className = '',
  error,
  size = 'md',
  clearable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);
  const selectId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = searchQuery.trim()
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (opt.badge && opt.badge.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      if (searchable && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
      // Set initial highlighted index to selected item if available
      const selectedIdx = filteredOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    } else {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Keep highlighted item in view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionsListRef.current) {
      const activeEl = optionsListRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Height and padding sizing
  const sizeClasses = {
    sm: 'py-2 px-3 text-xs rounded-xl min-h-[38px]',
    md: 'py-2.5 px-3.5 text-xs sm:text-sm rounded-2xl min-h-[44px]',
    lg: 'py-3.5 px-4 text-sm sm:text-base rounded-2xl min-h-[50px]'
  }[size];

  return (
    <div className={`relative w-full text-right ${className}`} ref={containerRef} dir="rtl">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 select-none"
        >
          {label}
          {required && <span className="text-rose-500 mr-1">*</span>}
        </label>
      )}

      {/* Trigger Button with Native Feel & Custom Visuals */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2.5 border transition-all duration-200 cursor-pointer select-none outline-none ${sizeClasses} ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
            : isOpen
            ? 'bg-white dark:bg-slate-900 border-blue-500 ring-4 ring-blue-500/15 text-slate-900 dark:text-white shadow-md'
            : error
            ? 'bg-white dark:bg-slate-900 border-rose-400 dark:border-rose-700 text-slate-900 dark:text-white ring-2 ring-rose-500/10'
            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-blue-400/80 dark:hover:border-blue-500/60 text-slate-800 dark:text-slate-100 shadow-2xs hover:shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedOption ? (
            <>
              {selectedOption.colorDot && (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: selectedOption.colorDot }}
                />
              )}
              {selectedOption.icon && (
                <span className="shrink-0 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  {selectedOption.icon}
                </span>
              )}
              <span className="truncate font-bold text-slate-900 dark:text-white">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                    selectedOption.badgeColor || 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-medium truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {clearable && selectedOption && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="مسح الاختيار"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div
            className={`p-1 rounded-xl transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {error && <p className="text-[11px] text-rose-500 font-bold mt-1.5 mr-1">{error}</p>}

      {/* Floating Dropdown Menu with Spring Animation */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 w-full mt-2 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top"
          style={{ minWidth: '100%' }}
        >
          {/* Search bar inside dropdown */}
          {searchable && options.length > 4 && (
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full pr-9 pl-8 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div
            ref={optionsListRef}
            className="max-h-64 sm:max-h-72 overflow-y-auto p-1.5 space-y-1 overscroll-contain scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center space-y-1">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  لا توجد نتائج مطابقة لبحثك
                </p>
                <p className="text-[11px] text-slate-400">جرب كتابة كلمة أخرى أو تصفح القائمة</p>
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none text-right ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                        : isHighlighted
                        ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white translate-x-[-2px]'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {opt.colorDot && (
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isSelected ? 'border-2 border-white' : ''
                          }`}
                          style={{ backgroundColor: opt.colorDot }}
                        />
                      )}
                      {opt.icon && (
                        <span
                          className={`shrink-0 flex items-center justify-center ${
                            isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-400'
                          }`}
                        >
                          {opt.icon}
                        </span>
                      )}
                      <div className="truncate text-right">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div
                            className={`text-[11px] font-normal truncate mt-0.5 ${
                              isSelected
                                ? 'text-blue-100'
                                : 'text-slate-400 dark:text-slate-400'
                            }`}
                          >
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : opt.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

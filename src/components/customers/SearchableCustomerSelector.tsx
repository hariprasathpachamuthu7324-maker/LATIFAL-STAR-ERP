"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Customer } from "@/lib/data/customers-mock";
import {
  Building2,
  Search,
  Check,
  ChevronsUpDown,
  X,
  User,
  Phone,
  Hash,
  AlertCircle,
  RefreshCw,
  Plus,
} from "lucide-react";

export interface SearchableCustomerSelectorProps {
  value: string;
  onChange: (customer: Customer | null) => void;
  customers: Customer[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
  fetchError?: string | null;
  onRetry?: () => void;
  onCreateNew?: () => void;
  className?: string;
}

export function SearchableCustomerSelector({
  value,
  onChange,
  customers = [],
  label = "Select Client / Company",
  placeholder = "Search by company name, customer code, TRN, contact...",
  required = false,
  error,
  disabled = false,
  isLoading = false,
  fetchError = null,
  onRetry,
  onCreateNew,
  className,
}: SearchableCustomerSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const selectedCustomer = React.useMemo(() => {
    if (!value) return null;
    return customers.find((c) => c.id === value) || null;
  }, [customers, value]);

  // Filter customers across company name, code, contact person, TRN, email, phone, city
  const filteredCustomers = React.useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.toLowerCase().trim();
    return customers.filter((c) => {
      const matchName = c.companyName?.toLowerCase().includes(query);
      const matchCode = c.customerCode?.toLowerCase().includes(query);
      const matchContact = c.contactPerson?.toLowerCase().includes(query);
      const matchTrn = c.taxRegistrationNumber?.toLowerCase().includes(query);
      const matchEmail = c.email?.toLowerCase().includes(query);
      const matchPhone = c.phone?.toLowerCase().includes(query);
      const matchCity = c.city?.toLowerCase().includes(query);
      return (
        matchName ||
        matchCode ||
        matchContact ||
        matchTrn ||
        matchEmail ||
        matchPhone ||
        matchCity
      );
    });
  }, [customers, searchQuery]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Reset highlight index when query or open state changes
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, isOpen]);

  // Focus search input when popover opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (isOpen && listRef.current) {
      const activeElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (customer: Customer) => {
    onChange(customer);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredCustomers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCustomers[highlightedIndex]) {
        handleSelect(filteredCustomers[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("w-full space-y-1.5 text-left relative", className)}
    >
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#334155] tracking-wide uppercase">
            {label}
            {required && <span className="text-[#B91C1C] ml-1">*</span>}
          </label>
          {selectedCustomer && !disabled && (
            <span className="text-[11px] font-mono text-[#2563EB] font-medium">
              {selectedCustomer.customerCode}
            </span>
          )}
        </div>
      )}

      {/* Main Trigger Button / Field */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full min-h-[42px] px-3 py-2 text-sm bg-white border rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 select-none",
          error
            ? "border-[#B91C1C] ring-1 ring-[#B91C1C]/20"
            : isOpen
            ? "border-[#2563EB] ring-2 ring-[#2563EB]/15"
            : "border-[#E2E8F0] hover:border-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15",
          disabled && "bg-slate-50 text-slate-400 cursor-not-allowed opacity-75"
        )}
      >
        {selectedCustomer ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#0F172A] truncate text-sm">
                  {selectedCustomer.companyName}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedCustomer.customerCode}
                </span>
              </div>
              <div className="text-xs text-slate-500 truncate flex items-center gap-2">
                {selectedCustomer.contactPerson && (
                  <span>Attn: {selectedCustomer.contactPerson}</span>
                )}
                {selectedCustomer.taxRegistrationNumber && (
                  <span className="text-[11px] font-mono text-slate-400">
                    • TRN: {selectedCustomer.taxRegistrationNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 flex-1 min-w-0">
            <Building2 className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="truncate">{placeholder}</span>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {selectedCustomer && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronsUpDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-[#B91C1C] font-medium mt-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#CBD5E1] rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-slate-100 bg-[#F8FAFC]">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type company, code, TRN, or contact person..."
                className="w-full h-9 pl-9 pr-8 text-xs bg-white border border-slate-200 rounded-md text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-64 overflow-y-auto">
            {fetchError ? (
              <div className="p-4 text-center space-y-2">
                <div className="inline-flex p-2 rounded-full bg-red-50 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <p className="text-xs text-red-700 font-medium">
                  {fetchError}
                </p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry Loading
                  </button>
                )}
              </div>
            ) : isLoading ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto text-[#2563EB]" />
                <p>Loading clients from database...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="p-6 text-center space-y-2.5">
                <div className="w-8 h-8 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    No Registered Clients
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                    No customers exist in the database yet. Create your first client profile to proceed.
                  </p>
                </div>
                {onCreateNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onCreateNew();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2563EB] text-white text-xs font-medium hover:bg-[#1D4ED8] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create New Client
                  </button>
                )}
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-500">
                <p className="font-medium text-slate-700">No matching clients found</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  No records matched &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <ul ref={listRef} role="listbox" className="p-1 space-y-0.5">
                {filteredCustomers.map((c, index) => {
                  const isSelected = c.id === value;
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <li
                      key={c.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(c)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "px-3 py-2 rounded-md text-xs cursor-pointer flex items-start justify-between gap-3 transition-colors",
                        isHighlighted
                          ? "bg-[#2563EB]/10 text-[#0F172A]"
                          : "text-[#334155] hover:bg-slate-50",
                        isSelected && "bg-[#2563EB]/15 font-medium"
                      )}
                    >
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0F172A] truncate">
                            {c.companyName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {c.customerCode}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                          {c.contactPerson && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {c.contactPerson}
                            </span>
                          )}
                          {c.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {c.phone}
                            </span>
                          )}
                          {c.taxRegistrationNumber && (
                            <span className="font-mono text-slate-500">
                              TRN: {c.taxRegistrationNumber}
                            </span>
                          )}
                          {c.city && (
                            <span className="text-slate-400">({c.city})</span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {filteredCustomers.length} of {customers.length} client(s)
            </span>
            {onCreateNew && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onCreateNew();
                }}
                className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Client
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useLinkedInSearch, SearchType } from '@/hooks/outreach/useLinkedInSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2, X, LucideIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchSelectItem {
  id: string;
  label: string;
}

interface LinkedInSearchSelectProps {
  type: SearchType;
  value: SearchSelectItem[];
  onChange: (value: SearchSelectItem[]) => void;
  placeholder?: string;
  icon?: LucideIcon;
  label?: string;
}

export function LinkedInSearchSelect({ 
  type, 
  value, 
  onChange, 
  placeholder = 'Search...',
  icon: Icon,
  label
}: LinkedInSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { results, isLoading, error, search, clearResults } = useLinkedInSearch(type);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.length >= 2) {
      debounceRef.current = setTimeout(() => {
        search(searchTerm);
      }, 400);
    } else {
      clearResults();
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, search, clearResults]);

  const handleSelect = (item: { id: string; title: string }) => {
    const exists = value.some(v => v.id === item.id);
    if (exists) {
      onChange(value.filter(v => v.id !== item.id));
    } else {
      onChange([...value, { id: item.id, label: item.title }]);
    }
  };

  const handleRemove = (id: string) => {
    onChange(value.filter(v => v.id !== id));
  };

  const isSelected = (id: string) => value.some(v => v.id === id);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground/80">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal h-11 bg-background/50 border-border/50",
              "hover:bg-background/80 hover:border-primary/30 transition-all",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            )}
          >
            <span className="flex items-center gap-2 text-muted-foreground truncate">
              {Icon ? (
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
              ) : (
                <Search className="h-4 w-4 shrink-0 text-muted-foreground/70" />
              )}
              {value.length > 0 ? (
                <span className="text-foreground">{value.length} selected</span>
              ) : (
                placeholder
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border-border/50" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b border-border/50 px-3">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder={`Search ${type.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </div>
            <CommandList className="max-h-[200px]">
              {error && (
                <div className="p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}
              {!isLoading && searchTerm.length >= 2 && results.length === 0 && !error && (
                <CommandEmpty className="py-6 text-sm text-muted-foreground">No results found.</CommandEmpty>
              )}
              {searchTerm.length < 2 && (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Type at least 2 characters to search
                </div>
              )}
              {results.length > 0 && (
                <CommandGroup>
                  {results.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer px-3 py-2.5 hover:bg-primary/10"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-primary",
                          isSelected(item.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected items as badges with animation */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className={cn(
                "flex items-center gap-1 pr-1 bg-primary/10 text-primary border border-primary/20",
                "hover:bg-primary/15 transition-all animate-scale-in"
              )}
            >
              <span className="max-w-[150px] truncate">{item.label}</span>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

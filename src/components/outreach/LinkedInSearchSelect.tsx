import { useState, useEffect, useRef } from 'react';
import { useLinkedInSearch, SearchType } from '@/hooks/outreach/useLinkedInSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
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
}

export function LinkedInSearchSelect({ 
  type, 
  value, 
  onChange, 
  placeholder = 'Search...' 
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="text-muted-foreground truncate">
              {value.length > 0 ? `${value.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Input
                placeholder={`Search ${type.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <CommandList>
              {error && (
                <div className="p-2 text-sm text-destructive text-center">
                  {error}
                </div>
              )}
              {!isLoading && searchTerm.length >= 2 && results.length === 0 && !error && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
              {searchTerm.length < 2 && (
                <div className="p-2 text-sm text-muted-foreground text-center">
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
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected(item.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected items as badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {item.label}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
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

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ApiOption {
  id: string;
  title: string;
}

interface ApiMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  apiEndpoint: string;
  apiHeaders: Record<string, string>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

export function ApiMultiSelect({
  value = [],
  onChange,
  apiEndpoint,
  apiHeaders,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyText = "No results found."
}: ApiMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ApiOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOptions = useCallback(async (keywords: string) => {
    if (!keywords.trim()) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const url = `${apiEndpoint}${encodeURIComponent(keywords)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: apiHeaders
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        setOptions(data.items.map((item: any) => ({
          id: item.id || item.title,
          title: item.title
        })));
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, apiHeaders]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchOptions(searchTerm);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, fetchOptions]);

  const handleSelect = (optionTitle: string) => {
    const newValue = value.includes(optionTitle)
      ? value.filter((v) => v !== optionTitle)
      : [...value, optionTitle];
    onChange(newValue);
  };

  const handleRemove = (optionTitle: string) => {
    onChange(value.filter((v) => v !== optionTitle));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 px-4 bg-background hover:bg-accent/5 border-border/50 rounded-xl transition-all duration-200"
          >
            <span className="text-muted-foreground font-normal truncate">
              {value.length > 0 ? `${value.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover/95 backdrop-blur-xl border-border/50 shadow-lg" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-12 border-b border-border/50 text-sm"
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                {loading ? "Loading..." : emptyText}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.title}
                    onSelect={() => handleSelect(option.title)}
                    className="py-3 cursor-pointer data-[selected=true]:bg-accent/50 border-b border-border/10 last:border-0"
                  >
                    <Check
                      className={cn(
                        "mr-3 h-4 w-4 text-primary",
                        value.includes(option.title) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{option.title}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <span className="mr-1.5 text-sm">{item}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(item);
                }}
                className="ml-1 hover:text-primary/80 transition-colors"
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

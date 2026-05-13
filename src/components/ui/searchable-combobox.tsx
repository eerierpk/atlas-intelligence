import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ComboOption {
  value: string;
  label: string;
  group?: string;
  aliases?: string[];
}

interface BaseProps {
  options: ComboOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  id?: string;
  ariaLabel?: string;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string | null;
  onChange: (v: string | null) => void;
  allowClear?: boolean;
}

interface MultiProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (v: string[]) => void;
  maxChips?: number;
}

export function SearchableCombobox(props: SingleProps | MultiProps) {
  const [open, setOpen] = React.useState(false);
  const { options, placeholder = "Select…", searchPlaceholder = "Search…", emptyText = "No matches", disabled, triggerClassName, ariaLabel, id } = props;

  const grouped = React.useMemo(() => {
    const map = new Map<string, ComboOption[]>();
    for (const o of options) {
      const k = o.group ?? "";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(o);
    }
    return Array.from(map.entries());
  }, [options]);

  const isMulti = props.multiple === true;
  const selectedValues: string[] = isMulti ? (props as MultiProps).value : (props as SingleProps).value ? [(props as SingleProps).value as string] : [];
  const labelOf = (v: string) => options.find(o => o.value === v)?.label ?? v;

  const handleSelect = (v: string) => {
    if (isMulti) {
      const cur = (props as MultiProps).value;
      const next = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v];
      (props as MultiProps).onChange(next);
    } else {
      const sp = props as SingleProps;
      sp.onChange(sp.value === v ? null : v);
      setOpen(false);
    }
  };

  const removeChip = (v: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMulti) {
      const sp = props as MultiProps;
      sp.onChange(sp.value.filter(x => x !== v));
    } else {
      (props as SingleProps).onChange(null);
    }
  };

  const showClear = !isMulti && (props as SingleProps).allowClear !== false && (props as SingleProps).value;
  const maxChips = isMulti ? (props as MultiProps).maxChips ?? 4 : 0;
  const visibleChips = isMulti ? selectedValues.slice(0, maxChips) : [];
  const overflow = isMulti ? Math.max(0, selectedValues.length - maxChips) : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-label={ariaLabel ?? placeholder}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "min-h-11 w-full rounded-md border border-border bg-[var(--color-input)] px-3 py-1.5 text-left text-sm flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/60 focus-visible:border-primary disabled:opacity-60",
            triggerClassName,
          )}
        >
          <div className="flex-1 min-w-0 flex flex-wrap gap-1 items-center">
            {selectedValues.length === 0 && (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
            {!isMulti && selectedValues.length === 1 && (
              <span className="truncate">{labelOf(selectedValues[0])}</span>
            )}
            {isMulti && visibleChips.map(v => (
              <span key={v} className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent)]/60 border border-border px-1.5 py-0.5 text-xs">
                {labelOf(v)}
                <button type="button" onClick={(e) => removeChip(v, e)} aria-label={`Remove ${labelOf(v)}`} className="size-4 grid place-items-center hover:text-[var(--color-destructive)]">
                  <X className="size-3" />
                </button>
              </span>
            ))}
            {overflow > 0 && <span className="text-xs text-muted-foreground">+{overflow} more</span>}
          </div>
          {showClear ? (
            <button
              type="button"
              onClick={(e) => removeChip(selectedValues[0], e)}
              aria-label="Clear selection"
              className="size-6 grid place-items-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0 w-[--radix-popover-trigger-width] min-w-[240px]", props.className)} align="start">
        <Command
          filter={(value, search) => {
            const opt = options.find(o => o.value === value);
            if (!opt) return 0;
            const hay = [opt.label, ...(opt.aliases ?? []), opt.group ?? ""].join(" ").toLowerCase();
            return hay.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} className="h-10" />
          <CommandList className="max-h-72">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {grouped.map(([groupName, opts]) => (
              <CommandGroup key={groupName || "_"} heading={groupName || undefined}>
                {opts.map(o => {
                  const selected = selectedValues.includes(o.value);
                  return (
                    <CommandItem
                      key={o.value}
                      value={o.value}
                      onSelect={() => handleSelect(o.value)}
                      className="cursor-pointer"
                    >
                      <Check className={cn("mr-2 size-4 shrink-0", selected ? "opacity-100 text-[var(--color-primary)]" : "opacity-0")} />
                      <span className="truncate">{o.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Check,
  ChevronDown,
  Search,
  X,
  XCircle,
  WandSparkles,
} from "lucide-react";

import { Button } from "./button";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";
import { cn } from "@workspace/ui/lib/utils";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 text-primary bg-primary/10 hover:bg-primary/20",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

type MultiSelectProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> &
  VariantProps<typeof multiSelectVariants> & {
    options: Option[];
    selected?: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    animation?: number;
    maxCount?: number;
    disabled?: boolean;
    className?: string;
  };

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      selected = [],
      onChange,
      variant,
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      className,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isAnimating, setIsAnimating] = React.useState(false);

    const filteredOptions = React.useMemo(() => {
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }, [options, searchQuery]);

    const handleToggleOption = (value: string) => {
      const newSelected = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onChange(newSelected);
    };

    const handleClear = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      onChange([]);
      setSearchQuery("");
    };

    const handleSelectAll = () => {
      if (selected.length === options.length) {
        handleClear();
      } else {
        onChange(options.map((opt) => opt.value));
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !searchQuery && selected.length > 0) {
        onChange(selected.slice(0, -1));
      }
    };

    return (
      <div className="relative w-full">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              {...props}
              className={cn(
                "flex w-full p-1 rounded-md border min-h-10 h-auto bg-background items-center justify-between hover:bg-background shadow-none",
                className,
              )}
              disabled={disabled}
              variant="default"
            >
              <div className="flex flex-wrap items-center gap-1 flex-1">
                {selected.length === 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {placeholder}
                  </span>
                )}
                {selected.slice(0, maxCount).map((value) => {
                  const option = options.find((opt) => opt.value === value);
                  const IconComponent = option?.icon;
                  return (
                    <Badge
                      key={value}
                      className={cn(
                        isAnimating ? "animate-bounce" : "",
                        multiSelectVariants({ variant }),
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {IconComponent && (
                        <IconComponent className="h-4 w-4 mr-2" />
                      )}
                      {option?.label}
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleOption(value);
                        }}
                      >
                        <XCircle className="ml-2 h-4 w-4 cursor-pointer" />
                      </div>
                    </Badge>
                  );
                })}
                {selected.length > maxCount && (
                  <Badge variant="secondary">
                    +{selected.length - maxCount} more
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                {selected.length > 0 && (
                  <>
                    <div onClick={handleClear}>
                      <X className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" />
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                  </>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-full min-w-[350px] max-w-[400px] p-0"
            align="start"
          >
            <div className="flex items-center p-2 border-b">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="max-h-[300px] overflow-auto">
              <div
                className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent"
                onClick={handleSelectAll}
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    selected.length === options.length
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible",
                  )}
                >
                  <Check className="h-4 w-4" />
                </div>
                <span>Select All</span>
              </div>
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent"
                  onClick={() => handleToggleOption(option.value)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  {option.icon && (
                    <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{option.label}</span>
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t p-1">
              {selected.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                  <Separator orientation="vertical" className="h-4" />
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        {animation > 0 && selected.length > 0 && (
          <WandSparkles
            className={cn(
              "absolute -right-6 top-1/2 -translate-y-1/2 cursor-pointer h-4 w-4",
              isAnimating ? "text-foreground" : "text-muted-foreground",
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </div>
    );
  },
);

MultiSelect.displayName = "MultiSelect";

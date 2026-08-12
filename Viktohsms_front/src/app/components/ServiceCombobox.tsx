import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from './ui/drawer';
import { useIsMobile } from './ui/use-mobile';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface Service {
  code: string;
  name: string;
  available_count?: number;
}

interface ServiceComboboxProps {
  services: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service | null) => void;
  disabled?: boolean;
}

interface SearchContentProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filteredServices: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

function SearchContent({
  searchQuery,
  onSearchChange,
  filteredServices,
  selectedService,
  onSelectService,
  searchInputRef
}: SearchContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#2E2050] bg-white dark:bg-[#0A0612] flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-12 text-[16px] border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] focus-visible:ring-1 focus-visible:ring-[#8B00FF] dark:focus-visible:ring-[#BF5FFF]"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="text"
          />
          {searchQuery && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2E2050]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Services List */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3">
        {filteredServices.length > 0 ? (
          <div className="space-y-1.5">
            {filteredServices.map((service) => (
              <button
                key={service.code}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectService(service)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-3.5 rounded-lg text-left transition-all touch-manipulation",
                  selectedService?.code === service.code
                    ? "bg-purple-100 dark:bg-purple-950/50 text-[#8B00FF] dark:text-[#BF5FFF] border-2 border-[#8B00FF] dark:border-[#BF5FFF]"
                    : "hover:bg-gray-100 dark:hover:bg-[#2E2050] text-gray-900 dark:text-white border-2 border-transparent active:bg-gray-200 dark:active:bg-[#3E3050]"
                )}
              >
                <span className="flex-1 font-medium truncate text-[15px]">{service.name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {service.available_count !== undefined && service.available_count > 0 && (
                    <Badge className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-0 text-xs px-2 py-0.5">
                      {service.available_count.toLocaleString()}
                    </Badge>
                  )}
                  {selectedService?.code === service.code && (
                    <Check className="h-5 w-5 text-[#8B00FF] dark:text-[#BF5FFF]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mb-3">
              <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No services found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServiceCombobox({
  services,
  selectedService,
  onSelectService,
  disabled = false
}: ServiceComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (service: Service) => {
    onSelectService(service.code === selectedService?.code ? null : service);
    setOpen(false);
    setSearchQuery('');
  };

  // Focus search input when dialog/drawer opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="h-12 w-full justify-between border-2 border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E] hover:border-[#8B00FF] dark:hover:border-[#BF5FFF] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] hover:bg-white dark:hover:bg-[#1C1530]"
      >
        <span className={cn(
          "truncate text-left",
          !selectedService && "text-gray-500 dark:text-gray-400"
        )}>
          {selectedService ? selectedService.name : "Select a service..."}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="bg-white dark:bg-[#0A0612] max-h-[85vh] flex flex-col">
            <DrawerHeader className="border-b border-gray-200 dark:border-[#2E2050] flex flex-row items-center justify-between px-4 py-3">
              <DrawerTitle className="text-gray-900 dark:text-white text-lg">Select USA Service</DrawerTitle>
              <DrawerClose className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2E2050]">
                <X className="w-5 h-5" />
              </DrawerClose>
            </DrawerHeader>
            <SearchContent
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filteredServices={filteredServices}
              selectedService={selectedService}
              onSelectService={handleSelect}
              searchInputRef={searchInputRef}
            />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md max-h-[600px] p-0 gap-0 bg-white dark:bg-[#0A0612] flex flex-col">
            <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-[#2E2050] flex-shrink-0">
              <DialogTitle className="text-gray-900 dark:text-white text-lg">Select USA Service</DialogTitle>
            </DialogHeader>
            <SearchContent
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filteredServices={filteredServices}
              selectedService={selectedService}
              onSelectService={handleSelect}
              searchInputRef={searchInputRef}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
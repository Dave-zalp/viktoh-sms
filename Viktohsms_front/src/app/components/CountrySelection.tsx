import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

interface Country {
  id: string;
  name: string;
  flag: string;
  available: number;
}

interface CountrySelectionProps {
  onSelectCountry: (country: Country) => void;
}

export default function CountrySelection({ onSelectCountry }: CountrySelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const countries: Country[] = [
    { id: "us", name: "United States", flag: "🇺🇸", available: 245 },
    { id: "uk", name: "United Kingdom", flag: "🇬🇧", available: 189 },
    { id: "ca", name: "Canada", flag: "🇨🇦", available: 156 },
    { id: "de", name: "Germany", flag: "🇩🇪", available: 203 },
    { id: "fr", name: "France", flag: "🇫🇷", available: 178 },
    { id: "au", name: "Australia", flag: "🇦🇺", available: 134 },
    { id: "jp", name: "Japan", flag: "🇯🇵", available: 167 },
    { id: "in", name: "India", flag: "🇮🇳", available: 298 },
    { id: "br", name: "Brazil", flag: "🇧🇷", available: 142 },
    { id: "es", name: "Spain", flag: "🇪🇸", available: 123 },
    { id: "it", name: "Italy", flag: "🇮🇹", available: 109 },
    { id: "nl", name: "Netherlands", flag: "🇳🇱", available: 98 },
    { id: "se", name: "Sweden", flag: "🇸🇪", available: 87 },
    { id: "pl", name: "Poland", flag: "🇵🇱", available: 76 },
    { id: "mx", name: "Mexico", flag: "🇲🇽", available: 102 },
    { id: "kr", name: "South Korea", flag: "🇰🇷", available: 134 },
    { id: "sg", name: "Singapore", flag: "🇸🇬", available: 67 },
    { id: "ae", name: "UAE", flag: "🇦🇪", available: 89 }
  ];

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Search countries..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 bg-white text-gray-900 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Country Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCountries.map((country) => (
          <Card 
            key={country.id}
            className="border-0 bg-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group overflow-hidden"
            onClick={() => onSelectCountry(country)}
          >
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
            <CardContent className="pt-6 relative">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                  <div className="text-3xl">{country.flag}</div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-gray-900">{country.name}</h3>
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-sm shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    {country.available} available
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No countries found matching your search.</p>
        </div>
      )}
    </div>
  );
}

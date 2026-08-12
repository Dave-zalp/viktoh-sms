import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { ChevronLeft } from "lucide-react";

interface Country {
  id: string;
  name: string;
  flag: string;
  available: number;
}

interface PhoneNumber {
  id: string;
  number: string;
  service: string;
  price: number;
}

interface NumberSelectionProps {
  country: Country;
  onBack: () => void;
  onSelectNumber: (number: PhoneNumber) => void;
}

export default function NumberSelection({ country, onBack, onSelectNumber }: NumberSelectionProps) {
  const [selectedService, setSelectedService] = useState("all");

  const numbers: PhoneNumber[] = [
    { id: "1", number: "+1 (555) 123-4567", service: "Telegram", price: 0.50 },
    { id: "2", number: "+1 (555) 234-5678", service: "WhatsApp", price: 0.50 },
    { id: "3", number: "+1 (555) 345-6789", service: "Any Service", price: 0.75 },
    { id: "4", number: "+1 (555) 456-7890", service: "Instagram", price: 0.60 },
    { id: "5", number: "+1 (555) 567-8901", service: "Facebook", price: 0.60 },
    { id: "6", number: "+1 (555) 678-9012", service: "Twitter", price: 0.55 },
    { id: "7", number: "+1 (555) 789-0123", service: "Telegram", price: 0.50 },
    { id: "8", number: "+1 (555) 890-1234", service: "Any Service", price: 0.75 },
    { id: "9", number: "+1 (555) 901-2345", service: "Google", price: 0.65 },
    { id: "10", number: "+1 (555) 012-3456", service: "WhatsApp", price: 0.50 }
  ];

  const filteredNumbers = selectedService === "all" 
    ? numbers 
    : numbers.filter(n => n.service === selectedService);

  const services = ["All Services", "Telegram", "WhatsApp", "Instagram", "Facebook", "Twitter", "Google", "Any Service"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={onBack} 
                  className="cursor-pointer flex items-center gap-1 text-[#2563EB] hover:text-[#1d4ed8]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Countries
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <span className="text-xl">{country.flag}</span>
                  {country.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="mb-2 text-black">Select Number</h1>
            <p className="text-[#6B7280]">{country.available} numbers available</p>
          </div>

          {/* Service Filter */}
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-full sm:w-[200px] border-gray-300 bg-white">
              <SelectValue placeholder="Filter by service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="Telegram">Telegram</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Any Service">Any Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Numbers Table */}
        <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                <tr>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm text-gray-700">Phone Number</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm text-gray-700">Service</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm text-gray-700">Price</th>
                  <th className="px-3 sm:px-6 py-4 text-right text-xs sm:text-sm text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredNumbers.map((number, index) => (
                  <tr 
                    key={number.id}
                    className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-4 text-sm sm:text-base text-black">{number.number}</td>
                    <td className="px-3 sm:px-6 py-4">
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 text-xs border-0"
                      >
                        {number.service}
                      </Badge>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className="text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">₦{number.price.toFixed(2)}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right">
                      <Button 
                        onClick={() => onSelectNumber(number)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm px-3 sm:px-4 shadow-md hover:shadow-lg transition-all"
                        size="sm"
                      >
                        Get Number
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredNumbers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-[#6B7280]">No numbers available for this service.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import type { RecordTypeFilter } from "@/lib/utils/blockchain-utils";

interface BlockchainSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: RecordTypeFilter;
  onTypeFilterChange: (value: RecordTypeFilter) => void;
  filterOptions: {
    label: string;
    value: RecordTypeFilter;
    count: number;
  }[];
}

export function BlockchainSearchFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  filterOptions,
}: BlockchainSearchFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by applicant name or transaction hash..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      typeFilter === option.value ? "default" : "outline"
                    }
                    size="sm"
                    className={
                      typeFilter === option.value
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : undefined
                    }
                    onClick={() => onTypeFilterChange(option.value)}
                  >
                    <span className="hidden sm:inline">{option.label}</span>
                    <span className="sm:hidden">
                      {option.value === "ALL"
                        ? "All"
                        : option.value === "APPLICATION"
                        ? "App"
                        : "Award"}
                    </span>
                    <span className="ml-1">({option.count})</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



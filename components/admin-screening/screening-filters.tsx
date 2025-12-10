"use client";

import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScreeningApplication } from "@/types/components";

interface StatusFilter {
  label: string;
  value: "ALL" | ScreeningApplication["status"];
  count: number;
}

interface ScreeningFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOrder: "default" | "az" | "za";
  onSortChange: (value: "default" | "az" | "za") => void;
  statusFilter: "ALL" | ScreeningApplication["status"];
  statusFilters: StatusFilter[];
  onStatusFilterChange: (value: "ALL" | ScreeningApplication["status"]) => void;
}

export function ScreeningFilters({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
  statusFilter,
  statusFilters,
  onStatusFilterChange,
}: ScreeningFiltersProps): React.JSX.Element {
  return (
    <>
      {/* Search Bar and Sort */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, email, or type..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select
            value={sortOrder}
            onValueChange={(value: "default" | "az" | "za") =>
              onSortChange(value)
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <SelectValue placeholder="Sort by name" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="az">A-Z</SelectItem>
              <SelectItem value="za">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3 bg-white border rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                size="sm"
                className={
                  statusFilter === filter.value
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : undefined
                }
                onClick={() => onStatusFilterChange(filter.value)}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserSearchBarProps } from "@/types/components";

export function UserSearchBar({
  searchQuery,
  onSearchChange,
  resultCount,
  activeFilter,
  onFilterChange,
  filterOptions,
}: UserSearchBarProps): React.JSX.Element {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {resultCount} user{resultCount !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter by role:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={activeFilter === option.value ? "default" : "outline"}
                  size="sm"
                  className={
                    activeFilter === option.value
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : undefined
                  }
                  onClick={() => onFilterChange(option.value)}
                >
                  {option.label} ({option.count})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}


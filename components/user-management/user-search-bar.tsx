"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserSearchBarProps } from "@/types/components";

export function UserSearchBar({
  searchQuery,
  onSearchChange,
  resultCount,
}: UserSearchBarProps): React.JSX.Element {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {resultCount} user{resultCount !== 1 ? "s" : ""} found
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}


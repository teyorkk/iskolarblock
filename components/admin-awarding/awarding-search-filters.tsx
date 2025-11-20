import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import type { AwardingStatus, LevelFilter } from "@/lib/utils/awarding-utils";
import { formatLevel } from "@/lib/utils/awarding-utils";

interface AwardingSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilters: Set<AwardingStatus>;
  onToggleStatusFilter: (status: AwardingStatus) => void;
  levelFilters: Set<LevelFilter>;
  onToggleLevelFilter: (level: LevelFilter) => void;
}

export function AwardingSearchFilters({
  searchTerm,
  onSearchChange,
  statusFilters,
  onToggleStatusFilter,
  levelFilters,
  onToggleLevelFilter,
}: AwardingSearchFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by name, email, or type..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["APPROVED", "GRANTED"] as AwardingStatus[]).map((status) => (
            <Button
              key={status}
              type="button"
              variant={statusFilters.has(status) ? "default" : "outline"}
              size="sm"
              className={
                statusFilters.has(status)
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : undefined
              }
              onClick={() => onToggleStatusFilter(status)}
            >
              {status === "GRANTED" ? "Granted" : "Pending"}
            </Button>
          ))}
          {(["SENIOR_HIGH", "COLLEGE"] as LevelFilter[]).map((level) => (
            <Button
              key={level}
              type="button"
              variant={levelFilters.has(level) ? "default" : "outline"}
              size="sm"
              className={
                levelFilters.has(level)
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : undefined
              }
              onClick={() => onToggleLevelFilter(level)}
            >
              {formatLevel(level)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}



import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FilterTabsProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  counts: {
    all: number;
    pending: number;
    approved: number;
    granted: number;
    rejected: number;
  };
}

export function FilterTabs({
  filter,
  onFilterChange,
  counts,
}: FilterTabsProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("all")}
          >
            All ({counts.all})
          </Button>
          <Button
            variant={filter === "PENDING" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("PENDING")}
          >
            Pending ({counts.pending})
          </Button>
          <Button
            variant={filter === "APPROVED" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("APPROVED")}
          >
            Approved ({counts.approved})
          </Button>
          <Button
            variant={filter === "GRANTED" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("GRANTED")}
          >
            Granted ({counts.granted})
          </Button>
          <Button
            variant={filter === "REJECTED" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("REJECTED")}
          >
            Rejected ({counts.rejected})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


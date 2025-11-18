import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

interface PeriodSelectorProps {
  periods: ApplicationPeriod[];
  selectedPeriodId: string | null;
  onPeriodChange: (periodId: string) => void;
}

export function PeriodSelector({
  periods,
  selectedPeriodId,
  onPeriodChange,
}: PeriodSelectorProps) {
  if (periods.length === 0) return null;

  return (
    <div className="mb-6 flex items-center gap-4">
      <Label htmlFor="period-select" className="text-sm font-medium">
        View Period:
      </Label>
      <Select
        value={selectedPeriodId || undefined}
        onValueChange={onPeriodChange}
      >
        <SelectTrigger id="period-select" className="w-[300px]">
          <SelectValue placeholder="Select application period" />
        </SelectTrigger>
        <SelectContent>
          {periods.map((period) => (
            <SelectItem key={period.id} value={period.id}>
              {period.title} (
              {new Date(period.startDate).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}{" "}
              -{" "}
              {new Date(period.endDate).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
              )
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


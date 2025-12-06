"use client";

import { useState, useEffect } from "react";
import { Settings, AlertTriangle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getCurrentTimePH } from "@/lib/utils/date-formatting";

interface LatestCycle {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  createdAt: string;
}

export function ApplicationPeriodDialog(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState<string>("");
  const [latestCycle, setLatestCycle] = useState<LatestCycle | null>(null);
  const [isCheckingCycle, setIsCheckingCycle] = useState(false);
  const [minDate, setMinDate] = useState<string>("");

  // Validate date is not today
  const validateDateNotToday = (
    dateValue: string,
    fieldName: string
  ): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(dateValue);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      toast.error(
        `${fieldName} cannot be today or earlier. Please select a future date.`
      );
      return false;
    }
    return true;
  };

  // Fetch latest application cycle when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchLatestCycle = async () => {
        setIsCheckingCycle(true);
        try {
          const supabase = getSupabaseBrowserClient();
          const { data, error } = await supabase
            .from("ApplicationPeriod")
            .select("id, title, startDate, endDate, isOpen, createdAt")
            .order("createdAt", { ascending: false })
            .limit(1)
            .single();

          if (error && error.code !== "PGRST116") {
            // PGRST116 is "no rows returned" which is fine
            console.error("Error fetching latest cycle:", error);
          }

          if (data) {
            setLatestCycle(data);
            // Set minimum date to be the day after the latest period's end date
            const latestEndDate = new Date(data.endDate);
            latestEndDate.setDate(latestEndDate.getDate() + 1);
            const minDateStr = latestEndDate.toISOString().split("T")[0];
            setMinDate(minDateStr);
          } else {
            // No existing periods, allow any future date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setMinDate(tomorrow.toISOString().split("T")[0]);
          }
        } catch (error) {
          console.error("Error fetching latest cycle:", error);
        } finally {
          setIsCheckingCycle(false);
        }
      };

      void fetchLatestCycle();
    } else {
      // Reset when dialog closes
      setLatestCycle(null);
      setMinDate("");
      setStartDate("");
      setEndDate("");
    }
  }, [isOpen]);

  // Check if current cycle is still active (not done)
  const isCurrentCycleActive = (): boolean => {
    if (!latestCycle) return false;
    const now = new Date();
    const cycleEndDate = new Date(latestCycle.endDate);
    // Cycle is active if end date is in the future (after today)
    // Use > instead of >= to allow creating new cycle on the day after end date
    return cycleEndDate > now;
  };

  const handleSave = async (): Promise<void> => {
    // Check if current cycle is still active
    if (isCurrentCycleActive()) {
      toast.error(
        "Cannot create a new application cycle while the current cycle is still active. Please wait until the current cycle ends."
      );
      return;
    }

    // Validate title
    if (!title.trim()) {
      toast.error("Please enter a title for the application cycle");
      return;
    }

    // Validate dates
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    // Validate that start date is at least tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const selectedStartDate = new Date(startDate);
    selectedStartDate.setHours(0, 0, 0, 0);

    if (selectedStartDate < tomorrow) {
      toast.error("Start date must be at least tomorrow");
      return;
    }

    // Validate that start date is after the latest cycle's end date
    if (latestCycle) {
      const latestEndDate = new Date(latestCycle.endDate);
      const cycleStartDate = new Date(startDate);
      latestEndDate.setDate(latestEndDate.getDate() + 1); // Day after end date

      if (cycleStartDate < latestEndDate) {
        toast.error(
          `Start date must be after ${new Date(
            latestCycle.endDate
          ).toLocaleDateString()}. The new cycle cannot overlap with the previous cycle.`
        );
        return;
      }
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    // Validate budget
    if (!budget.trim()) {
      toast.error("Please enter a budget amount");
      return;
    }

    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      toast.error("Please enter a valid budget amount greater than 0");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // Create Budget first
      const budgetAmount = parseFloat(budget);
      const budgetId = uuidv4();

      const { data: budgetData, error: budgetError } = await supabase
        .from("Budget")
        .insert({
          id: budgetId,
          totalAmount: budgetAmount,
          remainingAmount: budgetAmount,
          createdAt: getCurrentTimePH(),
          updatedAt: getCurrentTimePH(),
        })
        .select("id")
        .single();

      if (budgetError || !budgetData) {
        console.error("Budget creation error:", {
          error: budgetError,
          message: budgetError?.message,
          details: budgetError?.details,
          hint: budgetError?.hint,
          code: budgetError?.code,
        });
        toast.error(
          budgetError?.message || "Failed to create budget. Please try again."
        );
        setIsLoading(false);
        return;
      }

      // Create ApplicationPeriod with reference to Budget

      // Set end date to 11:59 PM (23:59:59)
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      // Generate UUID for ApplicationPeriod
      const periodId = uuidv4();

      const { error: periodError } = await supabase
        .from("ApplicationPeriod")
        .insert({
          id: periodId,
          title: title.trim(),
          description: description.trim() || "Scholarship application period",
          startDate: new Date(startDate).toISOString(),
          endDate: endDateTime.toISOString(),
          isOpen: false,
          budgetId: budgetData.id,
          createdAt: getCurrentTimePH(),
          updatedAt: getCurrentTimePH(),
        });

      if (periodError) {
        console.error("ApplicationPeriod creation error:", periodError);
        // Rollback: delete the budget if period creation fails
        await supabase.from("Budget").delete().eq("id", budgetData.id);
        toast.error("Failed to create application cycle. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Application cycle and budget created successfully!");

      try {
        await fetch("/api/log-events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventType: "ADMIN_PERIOD_CREATED",
            message: `Configured application cycle ${title.trim()}`,
            metadata: {
              startDate,
              endDate,
              budget: budgetAmount,
            },
          }),
        });
      } catch (error) {
        console.error("Failed to log cycle creation:", error);
      }
      setIsOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setBudget("");

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error creating application cycle:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isCycleActive = isCurrentCycleActive();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-white text-red-600 hover:bg-gray-100"
          disabled={isCycleActive}
          title={
            isCycleActive
              ? "Cannot create new cycle while current cycle is active"
              : "Set Application Cycle and Budget"
          }
        >
          <Settings className="w-4 h-4 mr-2" />
          Set Application Cycle and Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Application Cycle and Budget</DialogTitle>
          <DialogDescription>
            Define the start, end dates and the budget allocation for the
            scholarship application cycle.
            {latestCycle && (
              <span className="block mt-2 text-sm text-amber-600">
                Latest cycle: {latestCycle.title} (ends{" "}
                {new Date(latestCycle.endDate).toLocaleDateString()})
              </span>
            )}
            {isCycleActive && (
              <span className="flex items-center gap-2 mt-2 text-sm text-red-600 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Cannot create a new cycle while the current cycle is still
                active.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Academic Year 2024-2025"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <div className="col-span-3 space-y-2">
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value && !validateDateNotToday(value, "Start date")) {
                    return;
                  }
                  setStartDate(value);
                }}
                min={minDate || undefined}
                disabled={isCheckingCycle || isCycleActive}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least tomorrow or later
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !validateDateNotToday(value, "End date")) {
                  return;
                }
                setEndDate(value);
              }}
              min={startDate || minDate || undefined}
              disabled={isCheckingCycle || isCycleActive}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget" className="text-right">
              Budget
            </Label>
            <div className="relative col-span-3">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
                ₱
              </span>
              <Input
                id="budget"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={budget}
                placeholder="Enter budget amount"
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  setBudget(numericValue);
                }}
                className="pl-7"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={isLoading || isCycleActive || isCheckingCycle}
          >
            {isLoading
              ? "Saving..."
              : isCycleActive
              ? "Current Cycle Active"
              : "Save Cycle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

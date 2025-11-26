"use client";

import { useState, useEffect } from "react";
import { Settings, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";
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

interface LatestPeriod {
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
  const [isAccepting, setIsAccepting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState<string>("");
  const [latestPeriod, setLatestPeriod] = useState<LatestPeriod | null>(null);
  const [isCheckingPeriod, setIsCheckingPeriod] = useState(false);
  const [minDate, setMinDate] = useState<string>("");

  // Fetch latest application period when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchLatestPeriod = async () => {
        setIsCheckingPeriod(true);
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
            console.error("Error fetching latest period:", error);
          }

          if (data) {
            setLatestPeriod(data);
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
          console.error("Error fetching latest period:", error);
        } finally {
          setIsCheckingPeriod(false);
        }
      };

      void fetchLatestPeriod();
    } else {
      // Reset when dialog closes
      setLatestPeriod(null);
      setMinDate("");
      setStartDate("");
      setEndDate("");
    }
  }, [isOpen]);

  // Check if current period is still active (not done)
  const isCurrentPeriodActive = (): boolean => {
    if (!latestPeriod) return false;
    const now = new Date();
    const periodEndDate = new Date(latestPeriod.endDate);
    // Period is active if end date is in the future
    return periodEndDate >= now;
  };

  const handleSave = async (): Promise<void> => {
    // Check if current period is still active
    if (isCurrentPeriodActive()) {
      toast.error(
        "Cannot create a new application period while the current period is still active. Please wait until the current period ends."
      );
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title for the application period");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    // Validate that start date is after the latest period's end date
    if (latestPeriod) {
      const latestEndDate = new Date(latestPeriod.endDate);
      const selectedStartDate = new Date(startDate);
      latestEndDate.setDate(latestEndDate.getDate() + 1); // Day after end date

      if (selectedStartDate < latestEndDate) {
        toast.error(
          `Start date must be after ${new Date(
            latestPeriod.endDate
          ).toLocaleDateString()}. The new period cannot overlap with the previous period.`
        );
        return;
      }
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    if (!budget || parseFloat(budget) <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // Create Budget first
      const budgetId = crypto.randomUUID();
      const budgetAmount = parseFloat(budget);

      const { error: budgetError } = await supabase.from("Budget").insert({
        id: budgetId,
        totalAmount: budgetAmount,
        remainingAmount: budgetAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (budgetError) {
        console.error("Budget creation error:", budgetError);
        toast.error("Failed to create budget. Please try again.");
        setIsLoading(false);
        return;
      }

      // Create ApplicationPeriod with reference to Budget
      const periodId = crypto.randomUUID();
      const { error: periodError } = await supabase
        .from("ApplicationPeriod")
        .insert({
          id: periodId,
          title: title.trim(),
          description: description.trim() || "Scholarship application period",
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          isOpen: isAccepting,
          budgetId: budgetId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (periodError) {
        console.error("ApplicationPeriod creation error:", periodError);
        // Rollback: delete the budget if period creation fails
        await supabase.from("Budget").delete().eq("id", budgetId);
        toast.error("Failed to create application period. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Application period and budget created successfully!");

      try {
        await fetch("/api/log-events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventType: "ADMIN_PERIOD_CREATED",
            message: `Configured application period ${title.trim()}`,
            metadata: {
              startDate,
              endDate,
              budget: budgetAmount,
              isAccepting,
            },
          }),
        });
      } catch (error) {
        console.error("Failed to log period creation:", error);
      }
      setIsOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setIsAccepting(false);

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error creating application period:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPeriodActive = isCurrentPeriodActive();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-white text-red-600 hover:bg-gray-100"
          disabled={isPeriodActive}
          title={
            isPeriodActive
              ? "Cannot create new period while current period is active"
              : "Set Application Period and Budget"
          }
        >
          <Settings className="w-4 h-4 mr-2" />
          Set Application Period and Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Application Period and Budget</DialogTitle>
          <DialogDescription>
            Define the start, end dates and the budget allocation for the
            scholarship application period.
            {latestPeriod && (
              <span className="block mt-2 text-sm text-amber-600">
                Latest period: {latestPeriod.title} (ends{" "}
                {new Date(latestPeriod.endDate).toLocaleDateString()})
              </span>
            )}
            {isPeriodActive && (
              <span className="flex items-center gap-2 mt-2 text-sm text-red-600 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Cannot create a new period while the current period is still
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
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minDate || undefined}
              disabled={isCheckingPeriod || isPeriodActive}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || minDate || undefined}
              disabled={isCheckingPeriod || isPeriodActive}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Accepting Applications</Label>
            <div className="col-span-3 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAccepting(!isAccepting)}
                className="flex items-center gap-2"
              >
                {isAccepting ? (
                  <ToggleRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
                <span
                  className={isAccepting ? "text-green-600" : "text-gray-500"}
                >
                  {isAccepting ? "Open" : "Closed"}
                </span>
              </Button>
              <p className="text-sm text-gray-500">
                {isAccepting
                  ? "Applications are being accepted"
                  : "Applications are not being accepted"}
              </p>
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
            disabled={isLoading || isPeriodActive || isCheckingPeriod}
          >
            {isLoading
              ? "Saving..."
              : isPeriodActive
              ? "Current Period Active"
              : "Save Period"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

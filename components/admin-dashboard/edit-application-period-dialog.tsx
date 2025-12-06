"use client";

import { useState, useEffect } from "react";
import { Edit, Plus, Minus, AlertTriangle } from "lucide-react";
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

interface ApplicationPeriod {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  budgetId: string | null;
}

interface Budget {
  id: string;
  totalAmount: number;
  remainingAmount: number;
}

interface EditApplicationPeriodDialogProps {
  period: ApplicationPeriod;
  onUpdate?: () => void;
}

export function EditApplicationPeriodDialog({
  period,
  onUpdate,
}: EditApplicationPeriodDialogProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(period.title);
  const [description, setDescription] = useState(period.description);
  const [startDate, setStartDate] = useState(
    new Date(period.startDate).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(period.endDate).toISOString().split("T")[0]
  );
  const [isAccepting, setIsAccepting] = useState(period.isOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [budgetAdjustment, setBudgetAdjustment] = useState<string>("");
  const [isLoadingBudget, setIsLoadingBudget] = useState(false);

  // Fetch budget when dialog opens
  useEffect(() => {
    if (isOpen && period.budgetId) {
      const fetchBudget = async () => {
        setIsLoadingBudget(true);
        try {
          const supabase = getSupabaseBrowserClient();
          const { data, error } = await supabase
            .from("Budget")
            .select("*")
            .eq("id", period.budgetId)
            .single();

          if (error) {
            console.error("Error fetching budget:", error);
            toast.error("Failed to load budget information");
          } else if (data) {
            setBudget(data);
          }
        } catch (error) {
          console.error("Error fetching budget:", error);
        } finally {
          setIsLoadingBudget(false);
        }
      };

      void fetchBudget();
    } else if (isOpen && !period.budgetId) {
      setBudget(null);
    }
  }, [isOpen, period.budgetId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setTitle(period.title);
      setDescription(period.description);
      setStartDate(new Date(period.startDate).toISOString().split("T")[0]);
      setEndDate(new Date(period.endDate).toISOString().split("T")[0]);
      setIsAccepting(period.isOpen);
      setBudgetAdjustment("");
    }
  }, [isOpen, period]);

  const handleSave = async (): Promise<void> => {
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

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // Update ApplicationPeriod
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      const { error: periodError } = await supabase
        .from("ApplicationPeriod")
        .update({
          title: title.trim(),
          description: description.trim() || "Scholarship application period",
          startDate: new Date(startDate).toISOString(),
          endDate: endDateTime.toISOString(),
          isOpen: isAccepting,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", period.id);

      if (periodError) {
        console.error("Error updating application period:", periodError);
        toast.error("Failed to update application cycle. Please try again.");
        setIsLoading(false);
        return;
      }

      // Update budget if adjustment is provided
      if (budgetAdjustment.trim() && budget) {
        const adjustmentValue = parseFloat(budgetAdjustment);
        if (!isNaN(adjustmentValue) && adjustmentValue !== 0) {
          const newTotalAmount = budget.totalAmount + adjustmentValue;
          const newRemainingAmount = budget.remainingAmount + adjustmentValue;

          if (newTotalAmount < 0) {
            toast.error("Budget cannot be negative");
            setIsLoading(false);
            return;
          }

          if (newRemainingAmount < 0) {
            toast.error(
              "Remaining budget cannot be negative. Current remaining: ₱" +
                budget.remainingAmount.toLocaleString()
            );
            setIsLoading(false);
            return;
          }

          const { error: budgetError } = await supabase
            .from("Budget")
            .update({
              totalAmount: newTotalAmount,
              remainingAmount: Math.max(0, newRemainingAmount),
              updatedAt: new Date().toISOString(),
            })
            .eq("id", budget.id);

          if (budgetError) {
            console.error("Error updating budget:", budgetError);
            toast.error("Failed to update budget. Please try again.");
            setIsLoading(false);
            return;
          }
        }
      }

      toast.success("Application cycle updated successfully!");

      try {
        await fetch("/api/log-events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventType: "ADMIN_PERIOD_UPDATED",
            message: `Updated application cycle ${title.trim()}`,
            metadata: {
              periodId: period.id,
              startDate,
              endDate,
              budgetAdjustment: budgetAdjustment || 0,
            },
          }),
        });
      } catch (error) {
        console.error("Failed to log cycle update:", error);
      }

      setIsOpen(false);
      setBudgetAdjustment("");

      // Call onUpdate callback to refresh data
      if (onUpdate) {
        onUpdate();
      } else {
        // Fallback: reload page
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating application cycle:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBudgetAdd = () => {
    if (!budgetAdjustment.trim()) {
      toast.error("Please enter an amount");
      return;
    }
    const value = parseFloat(budgetAdjustment);
    if (isNaN(value) || value <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }
    // Keep the positive value for adding
    setBudgetAdjustment(value.toString());
  };

  const handleBudgetSubtract = () => {
    if (!budgetAdjustment.trim()) {
      toast.error("Please enter an amount");
      return;
    }
    const value = parseFloat(budgetAdjustment);
    if (isNaN(value) || value <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }
    // Make it negative for subtracting
    setBudgetAdjustment((-value).toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          size="sm"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Application Cycle</DialogTitle>
          <DialogDescription>
            Update the application cycle details and adjust the budget if needed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-title" className="text-right">
              Title
            </Label>
            <Input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Academic Year 2024-2025"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Description
            </Label>
            <Input
              id="edit-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="edit-startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="edit-endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              className="col-span-3"
            />
          </div>

          {/* Budget Section */}
          {budget && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Budget</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Total Budget:</span>
                    <span className="font-semibold text-green-600">
                      ₱{budget.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-semibold text-orange-600">
                      ₱{budget.remainingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget-adjustment" className="text-right">
                  Adjust Budget
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
                        ₱
                      </span>
                      <Input
                        id="budget-adjustment"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={budgetAdjustment}
                        placeholder="Enter amount"
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/[^0-9.-]/g, "");
                          setBudgetAdjustment(numericValue);
                        }}
                        className="pl-7"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleBudgetAdd}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleBudgetSubtract}
                      className="flex items-center gap-1"
                    >
                      <Minus className="w-4 h-4" />
                      Minus
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter amount and click Add or Minus to adjust the budget
                  </p>
                  {budgetAdjustment && (
                    <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-gray-700">
                        {parseFloat(budgetAdjustment) > 0 ? "Adding" : "Subtracting"}{" "}
                        ₱{Math.abs(parseFloat(budgetAdjustment) || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isLoadingBudget && (
            <div className="text-center py-2 text-sm text-gray-500">
              Loading budget information...
            </div>
          )}

          {!budget && !isLoadingBudget && (
            <div className="text-center py-2 text-sm text-amber-600">
              No budget information available for this period
            </div>
          )}

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
                  <span className="text-green-600">Open</span>
                ) : (
                  <span className="text-gray-500">Closed</span>
                )}
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
          <Button type="submit" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


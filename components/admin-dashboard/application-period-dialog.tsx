"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
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
export function ApplicationPeriodDialog(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState<string>("");

  const handleSave = async (): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsOpen(false);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-white text-red-600 hover:bg-gray-100"
        >
          <Settings className="w-4 h-4 mr-2" />
          Set Application Period and Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Application Period and Budget</DialogTitle>
          <DialogDescription>
            Define the start, end dates and the budget allocation for the
            scholarship application period.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
          <Button type="submit" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Period"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

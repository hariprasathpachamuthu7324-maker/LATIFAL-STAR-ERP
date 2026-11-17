"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { UNIT_OPTIONS, type WorkItem, type WorkItemStatus } from "@/lib/work-completion/calculations";
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export function WorkItemEditor({
  items,
  onChange,
}: {
  items: WorkItem[];
  onChange: (items: WorkItem[]) => void;
}) {
  const handleAddItem = () => {
    const newItem: WorkItem = {
      id: `wcr-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: "",
      quantity: 1,
      unit: "NOS",
      status: "COMPLETED",
      completionPercentage: 100,
      remarks: "",
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleUpdateItem = (index: number, updates: Partial<WorkItem>) => {
    const updated = items.map((item, idx) => {
      if (idx === index) {
        const itemUpdated = { ...item, ...updates };
        if (updates.status === "COMPLETED") {
          itemUpdated.completionPercentage = 100;
        } else if (updates.status === "PENDING") {
          itemUpdated.completionPercentage = 0;
        }
        return itemUpdated;
      }
      return item;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider">
            Executed Work & Service Scope Items
          </h4>
          <p className="text-[11px] text-slate-500">
            Document each technical activity, completion percentage, and engineering remarks.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          leftIcon={<Plus className="w-3.5 h-3.5 text-[#2563EB]" />}
          className="text-xs h-8"
        >
          Add Work Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2.5 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-[#0B1F33] flex items-center gap-1.5 font-numeric">
                <span className="w-5 h-5 rounded-full bg-[#0B1F33] text-white flex items-center justify-center text-[10px]">
                  {index + 1}
                </span>
                Work Item #{index + 1}
              </span>
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                  title="Remove Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-6">
                <Input
                  label="Description of Execution"
                  placeholder="e.g. Overhaul of Trane compressor and replacement of shaft bearings"
                  value={item.description}
                  onChange={(e) =>
                    handleUpdateItem(index, { description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Qty"
                  type="number"
                  min="1"
                  value={item.quantity || 1}
                  onChange={(e) =>
                    handleUpdateItem(index, {
                      quantity: Number(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <Select
                  allowCustom
                  label="Unit"
                  value={item.unit || "NOS"}
                  onChange={(e) =>
                    handleUpdateItem(index, { unit: e.target.value })
                  }
                  options={UNIT_OPTIONS}
                />
              </div>

              <div className="sm:col-span-2">
                <Select
                  allowCustom
                  label="Status"
                  value={item.status}
                  onChange={(e) =>
                    handleUpdateItem(index, {
                      status: e.target.value as WorkItemStatus,
                    })
                  }
                  options={[
                    { value: "COMPLETED", label: "Completed" },
                    { value: "IN_PROGRESS", label: "In Progress" },
                    { value: "PENDING", label: "Pending" },
                  ]}
                />
              </div>

              <div className="sm:col-span-3">
                <Input
                  label="Completion % (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={item.completionPercentage}
                  onChange={(e) =>
                    handleUpdateItem(index, {
                      completionPercentage: Math.max(
                        0,
                        Math.min(100, Number(e.target.value) || 0)
                      ),
                    })
                  }
                />
              </div>

              <div className="sm:col-span-9">
                <Input
                  label="Engineering Remarks / Test Observations"
                  placeholder="e.g. Tested at 16 bar hydro pressure with zero leakage"
                  value={item.remarks || ""}
                  onChange={(e) =>
                    handleUpdateItem(index, { remarks: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

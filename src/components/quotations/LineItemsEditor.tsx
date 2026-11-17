"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatAED } from "@/lib/utils";
import {
  UNIT_OPTIONS,
  calculateLineItem,
  DEFAULT_VAT_RATE,
  type CalculatedItem,
  type QuotationItemInput,
} from "@/lib/quotations/calculations";
import { Plus, Trash2, Layers } from "lucide-react";

export function LineItemsEditor({
  items,
  onChange,
  vatRate = DEFAULT_VAT_RATE,
}: {
  items: CalculatedItem[];
  onChange: (items: CalculatedItem[]) => void;
  vatRate?: number;
}) {
  const handleAddItem = () => {
    const newItem = calculateLineItem(
      {
        description: "",
        quantity: 1,
        unit: "NOS",
        unitPrice: 0,
        discount: 0,
      },
      vatRate
    );
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateItem = (
    index: number,
    fields: Partial<QuotationItemInput>
  ) => {
    const current = items[index];
    const updatedRaw: QuotationItemInput = {
      id: current.id,
      description: fields.description !== undefined ? fields.description : current.description,
      quantity: fields.quantity !== undefined ? fields.quantity : current.quantity,
      unit: fields.unit !== undefined ? fields.unit : current.unit,
      unitPrice: fields.unitPrice !== undefined ? fields.unitPrice : current.unitPrice,
      discount: fields.discount !== undefined ? fields.discount : current.discount,
    };

    const calculated = calculateLineItem(updatedRaw, vatRate);
    const newItems = [...items];
    newItems[index] = calculated;
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
            Scope of Works & Bill of Quantities (BOQ)
          </h4>
          <p className="text-[11px] text-slate-500">
            Specify technical line items, quantities, unit rates, and itemized discounts.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5 text-[#2563EB]" />}
          onClick={handleAddItem}
          className="text-xs font-semibold"
        >
          Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 relative space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-numeric">
                Item #{index + 1}
              </span>

              {items.length > 1 && (
                <IconButton
                  variant="destructive"
                  size="xs"
                  aria-label="Remove line item"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </IconButton>
              )}
            </div>

            {/* Description */}
            <div>
              <Textarea
                placeholder="Detailed technical description of materials, labour, equipment, testing, and execution scope..."
                rows={2}
                value={item.description}
                onChange={(e) =>
                  handleUpdateItem(index, { description: e.target.value })
                }
              />
            </div>

            {/* Quantity, Unit, Price, Discount, Amount */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-end">
              <div>
                <Input
                  label="Qty"
                  type="number"
                  min="0.01"
                  step="any"
                  value={item.quantity || ""}
                  onChange={(e) =>
                    handleUpdateItem(index, {
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Select
                  label="Unit"
                  value={item.unit}
                  onChange={(e) =>
                    handleUpdateItem(index, { unit: e.target.value })
                  }
                  options={UNIT_OPTIONS}
                />
              </div>

              <div>
                <Input
                  label="Rate (AED)"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={item.unitPrice || ""}
                  onChange={(e) =>
                    handleUpdateItem(index, {
                      unitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Input
                  label="Disc. (AED)"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={item.discount || ""}
                  onChange={(e) =>
                    handleUpdateItem(index, {
                      discount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-md border border-slate-200 text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Amount
                </span>
                <span className="text-xs font-bold text-slate-900 font-numeric block truncate">
                  {formatAED(item.taxableAmount)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

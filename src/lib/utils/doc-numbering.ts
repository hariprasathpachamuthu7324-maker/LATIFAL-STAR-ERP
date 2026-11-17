import { createClient } from "@/lib/supabase/client";

const YEAR = new Date().getFullYear();

type DocType = "quotation" | "invoice" | "purchase_order" | "work_completion" | "customer";

const TABLE_MAP: Record<DocType, { table: string; col: string; prefix: string }> = {
  quotation:        { table: "quotations",               col: "quotation_number",      prefix: `LSTS-Q-${YEAR}-` },
  invoice:          { table: "invoices",                 col: "invoice_number",        prefix: `LSTS-INV-${YEAR}-` },
  purchase_order:   { table: "purchase_orders",          col: "purchase_order_number", prefix: `LSTS-PO-${YEAR}-` },
  work_completion:  { table: "work_completion_reports",  col: "report_number",         prefix: `LSTS-WCR-${YEAR}-` },
  customer:         { table: "customers",                col: "customer_code",         prefix: `CUS-${YEAR}-` },
};

/**
 * Fetches the next sequential document number from Supabase.
 * Falls back to 001 if the table is empty or on any error.
 * Format: PREFIX001, PREFIX002, ...
 */
export async function getNextDocNumber(type: DocType): Promise<string> {
  const { table, col, prefix } = TABLE_MAP[type];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(table)
      .select(col)
      .like(col, `${prefix}%`)
      .order(col, { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return `${prefix}001`;
    }

    const lastNum = data[0][col] as string;
    const seq = parseInt(lastNum.replace(prefix, ""), 10);
    const next = isNaN(seq) ? 1 : seq + 1;
    return `${prefix}${String(next).padStart(3, "0")}`;
  } catch {
    return `${prefix}001`;
  }
}

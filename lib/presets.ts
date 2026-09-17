export type PresetType = "Freelance" | "Business" | "Personal" | "Creator";
export type CategoryType = "IN" | "OUT";

export interface PresetCategory {
  name: string;
  type: CategoryType;
}

export interface Preset {
  preset: PresetType;
  categories: PresetCategory[];
}

export const PRESETS: Preset[] = [
  {
    preset: "Freelance",
    categories: [
      { name: "Client Income", type: "IN" },
      { name: "Retainer", type: "IN" },
      { name: "Business Expenses", type: "OUT" },
      { name: "Software & Tools", type: "OUT" },
      { name: "Taxes", type: "OUT" },
    ],
  },
  {
    preset: "Business",
    categories: [
      { name: "Sales", type: "IN" },
      { name: "Product Revenue", type: "IN" },
      { name: "Rent", type: "OUT" },
      { name: "Supplies", type: "OUT" },
      { name: "Marketing", type: "OUT" },
      { name: "Payroll", type: "OUT" },
    ],
  },
  {
    preset: "Personal",
    categories: [
      { name: "Salary", type: "IN" },
      { name: "Side Income", type: "IN" },
      { name: "Rent", type: "OUT" },
      { name: "Groceries", type: "OUT" },
      { name: "Transport", type: "OUT" },
      { name: "Dining", type: "OUT" },
      { name: "Utilities", type: "OUT" },
      { name: "Entertainment", type: "OUT" },
    ],
  },
  {
    preset: "Creator",
    categories: [
      { name: "Brand Deals", type: "IN" },
      { name: "Sponsorships", type: "IN" },
      { name: "Ad Revenue", type: "IN" },
      { name: "Merch", type: "IN" },
      { name: "Camera & Gear", type: "OUT" },
      { name: "Software", type: "OUT" },
      { name: "Production", type: "OUT" },
      { name: "Marketing", type: "OUT" },
      { name: "Shipping", type: "OUT" },
    ],
  },
];

export function getPreset(preset: PresetType): Preset {
  const found = PRESETS.find((p) => p.preset === preset);
  if (!found) throw new Error(`Unknown preset: ${preset}`);
  return found;
}
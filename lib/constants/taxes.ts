/**
 * Tax Calculation System
 * Rwanda Tax Configuration
 */

export const TAX_RATES = {
  VAT: 18, // Value Added Tax (VAT) in Rwanda is 18%
  WITHHOLDING_TAX: 15, // Withholding tax for services
  EXCISE_DUTY: 0, // Generally not applicable for services
} as const;

export const TAX_TYPES = {
  VAT: 'vat',
  WITHHOLDING: 'withholding',
  EXCISE: 'excise',
  NONE: 'none',
} as const;

export type TaxType = typeof TAX_TYPES[keyof typeof TAX_TYPES];

export interface TaxConfiguration {
  enabled: boolean;
  rate: number;
  tax_type: TaxType;
  tax_id?: string; // Business TIN (Tax Identification Number)
  company_name?: string;
  apply_to_services: boolean;
  apply_to_materials: boolean;
  apply_to_labor: boolean;
  apply_to_equipment: boolean;
}

export const DEFAULT_TAX_CONFIG: TaxConfiguration = {
  enabled: true,
  rate: TAX_RATES.VAT,
  tax_type: TAX_TYPES.VAT,
  apply_to_services: true,
  apply_to_materials: true,
  apply_to_labor: true,
  apply_to_equipment: true,
};

/**
 * Calculate tax amount
 */
export function calculateTax(
  subtotal: number,
  taxRate: number = TAX_RATES.VAT
): number {
  return (subtotal * taxRate) / 100;
}

/**
 * Calculate total with tax
 */
export function calculateTotalWithTax(
  subtotal: number,
  taxRate: number = TAX_RATES.VAT
): number {
  const taxAmount = calculateTax(subtotal, taxRate);
  return subtotal + taxAmount;
}

/**
 * Calculate subtotal from total (reverse calculation)
 */
export function calculateSubtotalFromTotal(
  total: number,
  taxRate: number = TAX_RATES.VAT
): number {
  return total / (1 + taxRate / 100);
}

/**
 * Calculate tax breakdown for invoice
 */
export interface TaxBreakdown {
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  tax_type: string;
  formatted: {
    subtotal: string;
    tax_amount: string;
    total: string;
    tax_label: string;
  };
}

export function calculateTaxBreakdown(
  subtotal: number,
  taxConfig: Partial<TaxConfiguration> = DEFAULT_TAX_CONFIG
): TaxBreakdown {
  const config = { ...DEFAULT_TAX_CONFIG, ...taxConfig };
  
  if (!config.enabled) {
    return {
      subtotal,
      tax_rate: 0,
      tax_amount: 0,
      total: subtotal,
      tax_type: TAX_TYPES.NONE,
      formatted: {
        subtotal: formatCurrency(subtotal),
        tax_amount: formatCurrency(0),
        total: formatCurrency(subtotal),
        tax_label: 'No Tax',
      },
    };
  }

  const taxAmount = calculateTax(subtotal, config.rate);
  const total = subtotal + taxAmount;

  return {
    subtotal,
    tax_rate: config.rate,
    tax_amount: taxAmount,
    total,
    tax_type: config.tax_type,
    formatted: {
      subtotal: formatCurrency(subtotal),
      tax_amount: formatCurrency(taxAmount),
      total: formatCurrency(total),
      tax_label: getTaxLabel(config.tax_type, config.rate),
    },
  };
}

/**
 * Get tax label for display
 */
export function getTaxLabel(taxType: TaxType, rate: number): string {
  switch (taxType) {
    case TAX_TYPES.VAT:
      return `VAT (${rate}%)`;
    case TAX_TYPES.WITHHOLDING:
      return `Withholding Tax (${rate}%)`;
    case TAX_TYPES.EXCISE:
      return `Excise Duty (${rate}%)`;
    default:
      return 'Tax';
  }
}

/**
 * Format currency for Rwanda (RWF)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format tax rate as percentage
 */
export function formatTaxRate(rate: number): string {
  return `${rate}%`;
}

/**
 * Calculate itemized tax breakdown
 */
export interface ItemizedTaxBreakdown {
  service_cost: number;
  service_tax: number;
  materials_cost: number;
  materials_tax: number;
  labor_cost: number;
  labor_tax: number;
  equipment_cost: number;
  equipment_tax: number;
  subtotal: number;
  total_tax: number;
  grand_total: number;
}

export function calculateItemizedTax(
  costs: {
    service?: number;
    materials?: number;
    labor?: number;
    equipment?: number;
  },
  taxConfig: Partial<TaxConfiguration> = DEFAULT_TAX_CONFIG
): ItemizedTaxBreakdown {
  const config = { ...DEFAULT_TAX_CONFIG, ...taxConfig };

  const serviceCost = costs.service || 0;
  const materialsCost = costs.materials || 0;
  const laborCost = costs.labor || 0;
  const equipmentCost = costs.equipment || 0;

  const serviceTax = config.enabled && config.apply_to_services
    ? calculateTax(serviceCost, config.rate)
    : 0;

  const materialsTax = config.enabled && config.apply_to_materials
    ? calculateTax(materialsCost, config.rate)
    : 0;

  const laborTax = config.enabled && config.apply_to_labor
    ? calculateTax(laborCost, config.rate)
    : 0;

  const equipmentTax = config.enabled && config.apply_to_equipment
    ? calculateTax(equipmentCost, config.rate)
    : 0;

  const subtotal = serviceCost + materialsCost + laborCost + equipmentCost;
  const totalTax = serviceTax + materialsTax + laborTax + equipmentTax;
  const grandTotal = subtotal + totalTax;

  return {
    service_cost: serviceCost,
    service_tax: serviceTax,
    materials_cost: materialsCost,
    materials_tax: materialsTax,
    labor_cost: laborCost,
    labor_tax: laborTax,
    equipment_cost: equipmentCost,
    equipment_tax: equipmentTax,
    subtotal,
    total_tax: totalTax,
    grand_total: grandTotal,
  };
}

/**
 * Tax exemption categories
 */
export const TAX_EXEMPT_SERVICES = [
  'educational',
  'medical',
  'religious',
  'agricultural',
] as const;

export type TaxExemptCategory = typeof TAX_EXEMPT_SERVICES[number];

/**
 * Check if service is tax exempt
 */
export function isTaxExempt(category: string): boolean {
  return TAX_EXEMPT_SERVICES.includes(category as TaxExemptCategory);
}

/**
 * Rwanda Tax Compliance Information
 */
export const TAX_COMPLIANCE = {
  vat_registration_threshold: 20000000, // RWF 20 million annual turnover
  vat_filing_frequency: 'monthly', // Monthly VAT returns
  tin_format: /^\d{9}$/, // 9-digit TIN format
  payment_deadline_days: 15, // 15th of following month
  penalties: {
    late_filing: 0.05, // 5% of tax due
    late_payment: 0.02, // 2% per month
  },
} as const;

/**
 * Validate TIN format
 */
export function isValidTIN(tin: string): boolean {
  return TAX_COMPLIANCE.tin_format.test(tin);
}

/**
 * Calculate late payment penalty
 */
export function calculateLatePenalty(
  taxAmount: number,
  monthsLate: number
): number {
  return taxAmount * TAX_COMPLIANCE.penalties.late_payment * monthsLate;
}

/**
 * Generate tax invoice number
 */
export function generateTaxInvoiceNumber(prefix: string = 'INV'): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
}

/**
 * Tax report summary
 */
export interface TaxReportSummary {
  period_start: string;
  period_end: string;
  total_sales: number;
  taxable_amount: number;
  tax_collected: number;
  tax_rate: number;
  transactions_count: number;
}

/**
 * Calculate tax report for a period
 */
export function calculateTaxReport(
  transactions: Array<{ subtotal: number; tax_amount: number; date: string }>,
  periodStart: string,
  periodEnd: string
): TaxReportSummary {
  const filtered = transactions.filter(
    (t) => t.date >= periodStart && t.date <= periodEnd
  );

  const totalSales = filtered.reduce((sum, t) => sum + t.subtotal, 0);
  const taxCollected = filtered.reduce((sum, t) => sum + t.tax_amount, 0);

  return {
    period_start: periodStart,
    period_end: periodEnd,
    total_sales: totalSales,
    taxable_amount: totalSales,
    tax_collected: taxCollected,
    tax_rate: TAX_RATES.VAT,
    transactions_count: filtered.length,
  };
}

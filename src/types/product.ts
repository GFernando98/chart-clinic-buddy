export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  requiresPrescription: boolean;
  expirationDate?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ProductFormData {
  code: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  purchasePrice: number;
  salePrice: number;
  initialStock?: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  requiresPrescription: boolean;
  expirationDate?: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  type: 'Entry' | 'Exit';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  reason: string;
  referenceDocument?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface InventoryEntryData {
  productId: string;
  quantity: number;
  unitCost: number;
  reason: string;
  referenceDocument?: string;
  notes?: string;
}

export interface InventoryExitData {
  productId: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface ProductInvoiceLine {
  productId: string;
  quantity: number;
  customPrice?: number;
}

export interface CreateProductInvoiceData {
  patientId: string;
  products: ProductInvoiceLine[];
  discountPercentage?: number;
  discountAmount?: number;
  notes?: string;
}

export const PRODUCT_CATEGORIES = [
  'Higiene Oral',
  'Medicamentos',
  'Material Dental',
  'Consumibles',
  'Otros',
] as const;

export const PRODUCT_UNITS = [
  { value: 'pza', label: 'Pieza' },
  { value: 'caja', label: 'Caja' },
  { value: 'ml', label: 'Mililitros' },
  { value: 'litro', label: 'Litro' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'gramo', label: 'Gramo' },
  { value: 'otro', label: 'Otro' },
] as const;

export const ENTRY_REASONS = ['Compra', 'Devolución', 'Ajuste', 'Otro'] as const;
export const EXIT_REASONS = ['Pérdida', 'Ajuste', 'Vencido', 'Dañado', 'Otro'] as const;

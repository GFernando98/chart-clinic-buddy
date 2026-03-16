export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  productCount: number;
}

export interface CreateProductCategoryData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProductCategoryData {
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

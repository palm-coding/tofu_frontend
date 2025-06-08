// DTO used when creating a new ingredient
export interface Ingredient {
  _id: string;
  name: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateIngredientDto {
  name: string;
  unit: string;
}

// DTO used when updating an existing ingredient
export interface UpdateIngredientDto {
  name?: string; // Optional to allow partial updates
  quantity?: number;
}

// Interface representing a single ingredient returned from the API
export interface IngredientResponse {
  _id: string;
  name: string;
  quantity: number;
  createdAt?: string; // optional if API includes timestamps
  updatedAt?: string;
}

// Interface for a list of ingredients response
export interface IngredientsResponse {
  data: IngredientResponse[];
  total?: number; // optional if pagination is implemented
}

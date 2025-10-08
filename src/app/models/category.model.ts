export interface Category {
  id: number;
  title: string;
  description: string;
  image: string;
  consultant_count: number;
}

export interface CategoriesResponse {
  status: number;
  message: string;
  data: {
    data: Category[];
  };
}

// src/app/models/category-details.model.ts
export interface CategoryDetailsResponse {
    status: number;
    message: string;
    data: {
      category: {
        id: number;
        title: string;
        description: string;
        image: string;
        consultant_count: number;
      };
      consultants: {
        data: Consultant[];
        links: {
          first: string;
          last: string;
          prev: string | null;
          next: string | null;
        };
        meta: {
          current_page: number;
          from: number;
          last_page: number;
          links: {
            url: string | null;
            label: string;
            active: boolean;
          }[];
          path: string;
          per_page: number;
          to: number;
          total: number;
        };
      };
    };
  }
  
  interface Consultant {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    name: string;
    description: string;
    image: string;
    type: string;
    email: string;
    phone: string;
    rate: number;
    is_active: boolean;
    consultations_count: number;
    categories: {
      id: number;
      title: string;
      description: string;
      image: string;
      consultant_count: number;
    }[];
    created_at: string;
  }

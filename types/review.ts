export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewWithAuthor extends Review {
  author: {
    name: string;
    image: string | null;
  };
}

export interface ReviewActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  review?: Review;
}

export interface ReviewStats {
  count: number;
  average: number; // 0 when count is 0
}

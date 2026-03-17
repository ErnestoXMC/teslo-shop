export interface ProductResponse {
    id:          string;
    title:       string;
    price:       number;
    description: string | null;
    slug:        string;
    stock:       number;
    sizes:       string[];
    gender:      string;
    tags:        string[];
    isActive:    number;
    images:      string[];
    createdAt:   Date;
    updatedAt:   Date;
}

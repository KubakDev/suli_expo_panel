export interface CreateNews {
  title: string;
  description: string;
}
export interface News {
  id: number;
  images: string[];
  long_description: string;
  short_description: string;
  thumbnail: string;
  title: string;
}
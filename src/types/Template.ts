export interface Template {
  name: string;
  slug: string;
  description: string;
  size: {
    width: number;
    height: number;
    label: string;
  };
}

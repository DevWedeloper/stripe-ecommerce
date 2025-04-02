export type Variant = {
  variation: string;
  options: { value: string; id: number | string }[];
};

export type Option = {
  id: number | null;
  value: string;
  order: number;
};

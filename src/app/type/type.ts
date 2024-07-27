export type team = {
  id: number;
  created_at: Date;
  team: string;
};

export type Menu = {
  id: number;
  type: string;
  menu: string;
  price: number;
};

export type LunchChoice = {
  id: number;
  date: Date;
  menuId: number;
  menu: Menu;
};

import { MenuItem } from "./menu.interface";

export interface CartItem extends MenuItem {
  quantity: number;
  note: string;
}

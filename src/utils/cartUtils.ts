import { Article, Book } from '../types/AppMode';

export const addToCart = (cart: (Article | Book)[], item: Article | Book): (Article | Book)[] => {
  if (!cart.find((a) => a.id === item.id)) {
    return [...cart, item];

    // Déclencher l'animation directement sur l'élément
    // Animation is handled in the component
  }
  return cart;
};

export const clearCart = (): (Article | Book)[] => {
  return [];
};

export const removeFromCart = (cart: (Article | Book)[], itemId: number): (Article | Book)[] => {
  return cart.filter((a) => a.id !== itemId);
};

import { describe, it, expect } from 'vitest';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function calculateCartTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalPrice };
}

describe('Lógica de Carrito de Compras Cryzan Sport', () => {
  it('debe calcular el total de artículos y precio correctamente', () => {
    const items: CartItem[] = [
      { id: '1', name: 'Polo Deportivo Cryzan', price: 59.90, quantity: 2 },
      { id: '2', name: 'Zapatillas Running Cryzan Pro', price: 189.90, quantity: 1 },
    ];

    const { totalItems, totalPrice } = calculateCartTotals(items);

    expect(totalItems).toBe(3);
    expect(totalPrice).toBeCloseTo(309.70, 2);
  });

  it('debe retornar 0 para un carrito vacío', () => {
    const { totalItems, totalPrice } = calculateCartTotals([]);
    expect(totalItems).toBe(0);
    expect(totalPrice).toBe(0);
  });
});

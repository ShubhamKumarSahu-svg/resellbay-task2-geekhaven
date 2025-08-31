'use client';

import CartItem from './CartItem';

export default function CartItemsList({
  cart,
  onUpdate,
  onRemove,
  isUpdating,
}) {
  return (
    <div className="space-y-6">
      {cart.items.map((item) => (
        <CartItem
          key={item.product._id}
          item={item}
          onUpdate={onUpdate}
          onRemove={onRemove}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
}

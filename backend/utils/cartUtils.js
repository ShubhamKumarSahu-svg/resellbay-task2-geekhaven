const getCartSummary = (cart) => {
  if (!cart || !Array.isArray(cart.items)) {
    return { totalItems: 0, totalPrice: 0 };
  }

  const summary = cart.items.reduce(
    (acc, item) => {
      if (item.product && typeof item.product.price === 'number') {
        acc.totalItems += item.quantity;
        acc.totalPrice += item.product.price * item.quantity;
      }
      return acc;
    },
    { totalItems: 0, totalPrice: 0 }
  );

  summary.totalPrice = Math.round(summary.totalPrice * 100) / 100;

  return summary;
};

module.exports = { getCartSummary };

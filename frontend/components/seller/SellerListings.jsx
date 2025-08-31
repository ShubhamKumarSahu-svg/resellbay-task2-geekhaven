'use client';

import ProductCard from '../product/ProductCard';

export const SellerListings = ({ listings, sellerName }) => {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">More items from {sellerName}</h2>
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-muted text-muted-foreground rounded-lg p-8">
          <h3 className="text-lg font-semibold">No Active Listings</h3>
          <p>This seller currently has no other items for sale.</p>
        </div>
      )}
    </section>
  );
};

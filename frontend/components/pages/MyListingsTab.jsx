'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { STATUS } from '@/lib/constants';
import ProductCard from '../product/ProductCard';

export const MyListingsTab = ({ listings = [], status = STATUS.IDLE }) => {
  const productsArray = Array.isArray(listings) ? listings : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Listings ({productsArray.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {status === STATUS.LOADING ? (
          <p className="text-muted-foreground">Loading your listings...</p>
        ) : status === STATUS.ERROR ? (
          <p className="text-red-500">
            Failed to load listings. Please try again.
          </p>
        ) : productsArray.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsArray.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            You haven't listed any products yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

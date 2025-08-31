'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <ShoppingCart className="mx-auto h-20 w-20 text-muted-foreground" />
      <h1 className="mt-6 text-3xl font-bold">Your Cart is Empty</h1>
      <p className="mt-2 text-muted-foreground text-lg">
        Looks like you haven't added anything yet.
      </p>
      <Link
        href="/products"
        className="mt-6 rounded-xl bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground shadow hover:bg-primary/90 transition"
      >
        Start Shopping
      </Link>
    </div>
  );
}

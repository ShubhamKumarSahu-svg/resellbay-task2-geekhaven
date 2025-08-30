'use client';

import { AlertCircle, ShoppingCart, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect } from 'react';

import { ReviewList } from '@/components/review/ReviewList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LikeButton } from '@/components/ui/custom/LikeButton';
import { StarRating } from '@/components/ui/custom/StarRating';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useToast } from '@/hooks/useToast';
import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';
import useCartStore from '@/stores/useCartStore';
import useProductStore from '@/stores/useProductStore';

const ProductImage = ({ product }) => (
  <Card className="overflow-hidden">
    <div className="relative w-full aspect-square">
      <Image
        src={product.images?.[0] || 'https://placehold.co/600x600'}
        alt={product.title}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  </Card>
);

const ProductInfo = ({ product }) => (
  <div className="flex flex-col">
    <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
    <div className="mb-4">
      <StarRating
        rating={product.rating?.average}
        count={product.rating?.count}
      />
    </div>
    <Link
      href={`/sellers/${product.seller._id}`}
      className="text-lg text-primary hover:underline mb-4 flex items-center gap-2"
    >
      <UserIcon size={18} />
      Sold by {product.seller.name}
    </Link>
    <p className="text-4xl font-extrabold text-primary mb-6">
      ${product.price.toFixed(2)}
    </p>
    <p className="text-muted-foreground mb-6 flex-grow">
      {product.description}
    </p>
  </div>
);

const ProductActions = ({ product, onAddToCart }) => (
  <div className="flex flex-col sm:flex-row gap-4 mt-auto">
    <LikeButton productId={product._id} />
    <Button size="lg" onClick={onAddToCart} className="w-full">
      <ShoppingCart className="mr-2 h-5 w-5" />
      Add to Cart
    </Button>
  </div>
);

export default function ProductDetailPage({ params }) {
  const { id } = params;
  const { toast } = useToast();

  const {
    selectedProduct: product,
    status,
    error,
    fetchProductById,
    clearSelectedProduct,
  } = useProductStore();
  const { user } = useAppStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
    return () => clearSelectedProduct();
  }, [id, fetchProductById, clearSelectedProduct]);

  const handleAddToCart = useCallback(async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to add items to your cart.',
      });
      return;
    }
    try {
      await addToCart(product._id, 1);
      toast({
        title: 'Success!',
        description: `"${product.title}" has been added to your cart.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Could not add item to cart.',
      });
    }
  }, [user, product, addToCart, toast]);

  const renderContent = () => {
    if (status === STATUS.LOADING) {
      return <LoadingSpinner text="Loading product details..." />;
    }

    if (status === STATUS.ERROR) {
      return (
        <Alert variant="destructive" className="max-w-md mx-auto text-center">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{error?.title || 'An Error Occurred'}</AlertTitle>
          <AlertDescription>
            {error?.message ||
              "Sorry, we couldn't find the product you're looking for."}
          </AlertDescription>
        </Alert>
      );
    }

    if (!product) {
      return (
        <Alert className="max-w-md mx-auto text-center">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Product Not Found</AlertTitle>
        </Alert>
      );
    }

    return (
      <>
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProductImage product={product} />
              <div className="flex flex-col">
                <ProductInfo product={product} />
                <ProductActions
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-12">
          <ReviewList type="product" id={id} />
        </div>
      </>
    );
  };

  return <div className="container mx-auto py-8">{renderContent()}</div>;
}

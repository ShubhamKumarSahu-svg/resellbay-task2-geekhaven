'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function CartItem({ item, onUpdate, onRemove, isUpdating }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <div className="relative h-20 w-20 flex-shrink-0 md:h-24 md:w-24">
        <Image
          src={item.product.images?.[0] || 'https://placehold.co/150x150'}
          alt={item.product.title}
          fill
          className="rounded-lg object-cover"
          sizes="(max-width: 768px) 80px, 96px"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold leading-tight text-foreground line-clamp-2">
              {item.product.title}
            </h2>
            <p className="mt-1 text-lg font-bold text-primary">
              ${item.product.price.toFixed(2)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.product._id)}
            title="Remove item"
            disabled={isUpdating}
            className="ml-2 flex-shrink-0 transition hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 text-destructive md:h-5 md:w-5" />
          </Button>
        </div>

        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-10"
              onClick={() => onUpdate(item.product._id, item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
            >
              -
            </Button>
            <Input
              type="number"
              value={item.quantity}
              readOnly
              className="h-8 w-12 text-center font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-10"
              onClick={() => onUpdate(item.product._id, item.quantity + 1)}
              disabled={item.quantity >= item.product.stock || isUpdating}
            >
              +
            </Button>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="text-lg font-bold text-primary">
              ${(item.product.price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

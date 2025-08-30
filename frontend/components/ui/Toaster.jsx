'use client';

import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const toastVariants = cva(
  'pointer-events-auto relative mt-4 flex w-full max-w-sm items-center gap-4 overflow-hidden rounded-lg p-4 text-white shadow-lg',
  {
    variants: {
      variant: {
        success: 'bg-green-500',
        error: 'bg-red-500',
      },
    },
    defaultVariants: {
      variant: 'success',
    },
  }
);
const Toaster = ({ title, description, type, onDismiss }) => {
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(toastVariants({ variant: type }))}
      role="alert"
    >
      <Icon size={24} />
      <div className="flex-grow">
        <p className="font-bold">{title}</p>
        {description && <p className="text-sm">{description}</p>}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="rounded-full p-1 transition-colors hover:bg-white/10"
      >
        <X size={20} />
      </button>
    </motion.div>
  );
};

export default Toaster;

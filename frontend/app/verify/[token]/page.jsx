'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useEmailVerification } from '@/hooks/useEmailVerification';
import { STATUS } from '@/lib/constants';

const VerificationStatus = ({ status }) => {
  switch (status) {
    case STATUS.SUCCESS:
      return <CheckCircle className="mx-auto h-16 w-16 text-green-500" />;
    case STATUS.ERROR:
      return <AlertCircle className="mx-auto h-16 w-16 text-destructive" />;
    case STATUS.LOADING:
    default:
      return <LoadingSpinner />;
  }
};

export default function VerifyPage({ params }) {
  const { token } = params;
  const { status, message } = useEmailVerification(token);

  const title = {
    [STATUS.SUCCESS]: 'Verification Complete!',
    [STATUS.ERROR]: 'Verification Failed',
    [STATUS.LOADING]: 'Verifying Email...',
  }[status];

  return (
    <div className="flex justify-center items-center py-20">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <VerificationStatus status={status} />
          <CardTitle className="mt-6">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status !== STATUS.LOADING && (
            <Button asChild className="mt-4">
              <Link href="/login">Proceed to Login</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

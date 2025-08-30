'use client';

import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useToast } from '@/hooks/useToast';
import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, authStatus, authError, user, isAuthInitialized } =
    useAppStore();

  useEffect(() => {
    if (isAuthInitialized && user) {
      router.replace('/');
    }
  }, [user, isAuthInitialized, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await login({ email, password });
    if (result.success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
        variant: 'success',
      });
      router.push('/');
    }
  };

  if (!isAuthInitialized || user) {
    return <LoadingSpinner text="Loading..." />;
  }

  return (
    <div className="flex justify-center items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4">Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue to ResellBay.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {authStatus === STATUS.ERROR && authError && (
              <Alert variant="destructive">
                <AlertTitle>{authError.title || 'Login Failed'}</AlertTitle>
                <AlertDescription>
                  {authError.description || 'An unknown error occurred.'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              loading={authStatus === STATUS.LOADING}
              className="w-full"
            >
              Sign In
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

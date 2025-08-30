'use client';

import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useToast } from '@/hooks/useToast';
import useAppStore from '@/stores/useAppStore';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const registerAction = useAppStore((state) => state.register);
  const authError = useAppStore((state) => state.authError);
  const user = useAppStore((state) => state.user);
  const isAuthInitialized = useAppStore((state) => state.isAuthInitialized);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  useEffect(() => {
    if (isAuthInitialized && user) {
      router.replace('/');
    }
  }, [user, isAuthInitialized, router]);
  const onSubmit = async (data) => {
    const result = await registerAction(data);
    if (result.success) {
      toast({
        title: 'Account Created!',
        description:
          result.message || 'You can now log in with your new account.',
      });
      router.push('/login');
    } else {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description:
          result.error ||
          authError?.description ||
          'An unknown error occurred.',
      });
    }
  };

  if (!isAuthInitialized || user) {
    return <LoadingSpinner text="Loading..." />;
  }

  return (
    <div className="flex justify-center items-center py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4">Create Your Account</CardTitle>
          <CardDescription>
            Join our community of buyers and sellers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Full name is required.' })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required.' })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: 'Password is required.',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters.',
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password.',
                    validate: (value) =>
                      value === password || 'Passwords do not match.',
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Add Phone Number</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" {...register('phone')} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center space-x-2">
              <Controller
                name="agreeToTerms"
                control={control}
                rules={{ required: 'You must agree to the terms.' }}
                render={({ field }) => (
                  <Checkbox
                    id="agreeToTerms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="agreeToTerms" className="text-sm font-normal">
                I agree to the{' '}
                <Link href="/terms" className="underline text-primary">
                  Terms and Conditions
                </Link>
              </Label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-destructive">
                {errors.agreeToTerms.message}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <LoadingSpinner /> : 'Create Account'}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

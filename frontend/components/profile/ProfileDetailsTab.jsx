'use client';

import { Edit, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { ConfirmationDialog } from '@/components/ui/custom/ConfirmationDialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import useAppStore from '@/stores/useAppStore';
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '../ui/alert';

const DetailItem = ({ label, value }) => (
  <div className="space-y-1">
    <Label className="text-sm text-muted-foreground">{label}</Label>
    <Input
      value={value || 'Not provided'}
      disabled
      className="bg-muted/10 border border-gray-300 rounded-md outline-none cursor-not-allowed"
    />
  </div>
);

export const ProfileDetailsTab = () => {
  const { user, fetchUserProfile } = useAppStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      profileImage: user?.profileImage || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'India',
      },
    },
  });

  const onUpdateProfile = async (data) => {
    const originalData = user;
    const payload = {};

    if (data.name !== originalData.name) payload.name = data.name;
    if (data.phone !== (originalData.phone || '')) payload.phone = data.phone;
    if (data.profileImage !== (originalData.profileImage || ''))
      payload.profileImage = data.profileImage;

    const addressChanges = {};
    if (data.address) {
      if (data.address.street !== (originalData.address?.street || ''))
        addressChanges.street = data.address.street;
      if (data.address.city !== (originalData.address?.city || ''))
        addressChanges.city = data.address.city;
      if (data.address.state !== (originalData.address?.state || ''))
        addressChanges.state = data.address.state;
      if (data.address.zipCode !== (originalData.address?.zipCode || ''))
        addressChanges.zipCode = data.address.zipCode;
      if (data.address.country !== (originalData.address?.country || ''))
        addressChanges.country = data.address.country;

      if (Object.keys(addressChanges).length > 0)
        payload.address = addressChanges;
    }

    if (Object.keys(payload).length === 0) {
      toast({
        title: 'No Changes Detected',
        description: "You haven't changed any information.",
      });
      setIsEditing(false);
      return;
    }

    try {
      await api.put('/users/profile', payload);
      await fetchUserProfile();
      setIsEditing(false);
      toast({
        title: 'Success!',
        description: 'Profile updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.response?.data?.message || 'Server error',
      });
    }
  };

  const onResendVerification = async () => {
    try {
      const response = await api.post('/auth/resend-verification');
      toast({
        title: 'Verification Email Sent!',
        description: response.data?.message || 'Please check your email inbox.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Verification',
        description: error.response?.data?.message || 'Please try again later.',
      });
    }
  };

  const onBecomeSeller = async () => {
    try {
      await api.post('/users/become-seller');
      await fetchUserProfile();
      toast({
        title: 'Congratulations!',
        description: 'You are now a seller.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upgrade Failed',
        description: error.response?.data?.message || 'Server error',
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  if (!user) return null;

  return (
    <Card className="shadow-lg rounded-xl border border-gray-200">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Profile Details</CardTitle>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 transition hover:bg-primary/90"
          >
            <Edit size={16} />
            Edit Profile
          </Button>
        )}
      </CardHeader>

      <CardContent className="transition-all duration-300 ease-in-out space-y-6">
        {isEditing ? (
          <form id="profile-form" className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                className="border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+91 1234567890"
                className="border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image URL</Label>
              <Input
                id="profileImage"
                {...register('profileImage')}
                placeholder="https://example.com/image.jpg"
                className="border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['street', 'city', 'state', 'zipCode', 'country'].map(
                  (field) => (
                    <div className="space-y-1" key={field}>
                      <Label htmlFor={field}>
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </Label>
                      <Input
                        id={field}
                        {...register(`address.${field}`)}
                        className="border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <ConfirmationDialog
                title="Update Profile?"
                description="Are you sure you want to save these changes?"
                onConfirm={handleSubmit(onUpdateProfile)}
                trigger={
                  <Button type="button" className="flex items-center gap-2">
                    <Save size={16} />
                    Save Changes
                  </Button>
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <DetailItem label="Name" value={user.name} />
            <DetailItem label="Email" value={user.email} />
            <DetailItem label="Phone" value={user.phone} />
            <DetailItem label="Role" value={user.role} />

            {user.profileImage && (
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Profile Image
                </Label>
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover mt-2 border-2 border-primary shadow-sm"
                />
              </div>
            )}

            {user.address && (
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground mb-1">
                  Address
                </Label>
                <div className="space-y-1">
                  {user.address.street && <p>{user.address.street}</p>}
                  {user.address.city && <p>{user.address.city}</p>}
                  {user.address.state && <p>{user.address.state}</p>}
                  {user.address.zipCode && <p>{user.address.zipCode}</p>}
                  {user.address.country && <p>{user.address.country}</p>}
                </div>
              </div>
            )}

            {!user.isVerified && (
              <Alert variant="warning" className="mt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <AlertTitle>Email Not Verified</AlertTitle>
                    <AlertDescription>
                      Please verify your email address to access all features.
                    </AlertDescription>
                    <Button
                      onClick={onResendVerification}
                      variant="outline"
                      size="sm"
                      className="mt-3 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    >
                      Resend Verification Email
                    </Button>
                  </div>
                  <AlertIcon
                    variant="warning"
                    className="h-5 w-5 flex-shrink-0"
                  />
                </div>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      {user.role === 'buyer' && !isEditing && (
        <CardFooter className="border-t pt-6">
          <div className="flex flex-col items-start gap-2">
            <h3 className="font-semibold text-lg">Become a Seller</h3>
            <p className="text-sm text-muted-foreground">
              Ready to start selling? Upgrade your account to a seller profile.
            </p>
            <ConfirmationDialog
              title="Are you sure you want to upgrade?"
              description="This will allow you to list items for sale. This action cannot be undone."
              onConfirm={onBecomeSeller}
              trigger={
                <Button className="transition hover:bg-primary/90">
                  Upgrade to Seller Account
                </Button>
              }
            />
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

'use client';

import { PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

import { useToast } from '@/hooks/useToast';
import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';
import useProductStore from '@/stores/useProductStore';

const categories = [
  'Electronics',
  'Clothing',
  'Books',
  'Home',
  'Sports',
  'Other',
];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const FormField = ({ id, label, required, error, children }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
    {error && <p className="text-sm text-destructive mt-1">{error}</p>}
  </div>
);

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { user, isAuthInitialized } = useAppStore();
  const { createProduct, status } = useProductStore();

  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Other',
    condition: 'Good',
    images: [''],
  });
  const [formErrors, setFormErrors] = useState({});
  const isSubmitting = status === STATUS.SUBMITTING;

  useEffect(() => {
    if (!isAuthInitialized) return;
    if (!user) {
      toast({
        title: 'Access Denied',
        description: 'You must be logged in to sell items.',
        variant: 'destructive',
      });
      router.replace('/login');
    } else if (user.role !== 'seller') {
      toast({
        title: 'Permission Denied',
        description: "You don't have permission to sell items.",
        variant: 'destructive',
      });
      router.replace('/');
    }
  }, [user, isAuthInitialized, router, toast]);

  const validateForm = () => {
    const errors = {};
    if (productData.title.trim().length < 3)
      errors.title = 'Title must be at least 3 characters.';
    if (productData.description.trim().length < 10)
      errors.description = 'Description must be at least 10 characters.';
    if (
      parseFloat(productData.price) <= 0 ||
      isNaN(parseFloat(productData.price))
    )
      errors.price = 'Price must be a positive number.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name) => (value) => {
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...productData.images];
    newImages[index] = value;
    setProductData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    if (productData.images.length < 5) {
      setProductData((prev) => ({ ...prev, images: [...prev.images, ''] }));
    } else {
      toast({
        title: 'Image Limit Reached',
        description: 'You can add a maximum of 5 images.',
        variant: 'destructive',
      });
    }
  };

  const removeImageField = (index) => {
    const newImages = productData.images.filter((_, i) => i !== index);
    setProductData((prev) => ({
      ...prev,
      images: newImages.length > 0 ? newImages : [''],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Invalid Form',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const payload = {
        ...productData,
        price: parseFloat(productData.price),
        images: productData.images.filter((img) => img && img.trim() !== ''),
      };
      const newProduct = await createProduct(payload);
      toast({
        title: 'Success!',
        description: 'Your product has been listed successfully.',
      });
      router.push(`/products/${newProduct._id}`);
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthInitialized) {
    return <LoadingSpinner text="Verifying access..." />;
  }

  return (
    <section className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <PlusCircle className="mx-auto h-12 w-12 accent-text" />
          <CardTitle className="text-3xl mt-4">List a New Product</CardTitle>
          <p className="text-muted-foreground">
            Fill in the details below to put your item up for sale.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <FormField
              id="title"
              label="Product Title"
              required
              error={formErrors.title}
            >
              <Input
                name="title"
                value={productData.title}
                onChange={handleChange}
              />
            </FormField>

            <FormField
              id="description"
              label="Description"
              required
              error={formErrors.description}
            >
              <Textarea
                name="description"
                rows="5"
                value={productData.description}
                onChange={handleChange}
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                id="price"
                label="Price ($)"
                required
                error={formErrors.price}
              >
                <Input
                  name="price"
                  type="number"
                  value={productData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </FormField>

              <FormField id="category" label="Category">
                <Select
                  onValueChange={handleSelectChange('category')}
                  defaultValue={productData.category}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="condition" label="Condition">
                <Select
                  onValueChange={handleSelectChange('condition')}
                  defaultValue={productData.condition}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((con) => (
                      <SelectItem key={con} value={con}>
                        {con}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="space-y-4">
              <Label>Image URLs</Label>
              {productData.images.map((img, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={img}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder={`Image URL ${index + 1}`}
                  />
                  {productData.images.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImageField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-sm accent-text"
                onClick={addImageField}
              >
                + Add another image
              </Button>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" loading={isSubmitting} size="lg">
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Listing Product...' : 'List Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

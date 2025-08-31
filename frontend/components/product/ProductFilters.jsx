'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import useProductStore from '../../stores/useProductStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';

const categories = [
  'Electronics',
  'Clothing',
  'Books',
  'Home',
  'Sports',
  'Other',
];
const limitOptions = [12, 24, 36, 48];

export const ProductFilters = ({ onApplyFilters }) => {
  const { filters, setFilters } = useProductStore();
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name) => (value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value === 'all' ? '' : value,
    }));
  };

  const handleApply = () => setFilters(localFilters);

  const handleClear = () => {
    const clearedFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      limit: 12,
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            name="search"
            placeholder="Search by title..."
            value={localFilters.search}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select
            value={localFilters.category || 'all'}
            onValueChange={handleSelectChange('category')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <Label htmlFor="minPrice">Min Price</Label>
            <Input
              id="minPrice"
              name="minPrice"
              type="number"
              placeholder="0"
              value={localFilters.minPrice}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="maxPrice">Max Price</Label>
            <Input
              id="maxPrice"
              name="maxPrice"
              type="number"
              placeholder="Any"
              value={localFilters.maxPrice}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <Label>Per Page</Label>
          <Select
            value={String(localFilters.limit)}
            onValueChange={handleSelectChange('limit')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex gap-4">
        <Button onClick={handleApply}>
          <Search className="mr-2 h-4 w-4" /> Apply
        </Button>
        <Button variant="outline" onClick={handleClear}>
          <X className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  );
};

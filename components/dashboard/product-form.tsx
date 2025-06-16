"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X, DollarSign } from "lucide-react";

interface ProductFormProps {
  shop: any;
  product?: any;
}

export function ProductForm({ shop, product }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product ? (product.price_cents / 100).toString() : "");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(product?.image_urls || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length + imageUrls.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    setError(null);
  };

  const removeImage = (index: number, isUploaded: boolean = false) => {
    if (isUploaded) {
      setImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const supabase = createClient();
    const uploadedUrls: string[] = [...imageUrls];

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, image);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim() || !price) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (parseFloat(price) <= 0) {
      setError("Price must be greater than 0");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Upload new images if any
      let finalImageUrls = imageUrls;
      if (images.length > 0) {
        finalImageUrls = await uploadImages();
      }

      const productData = {
        shop_id: shop.id,
        name: name.trim(),
        description: description.trim(),
        price_cents: Math.round(parseFloat(price) * 100),
        image_urls: finalImageUrls,
        is_available: true,
      };

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
      }

      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>{product ? 'Edit Product' : 'Add Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Images */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Product Images {imageUrls.length + images.length > 0 && `(${imageUrls.length + images.length}/5)`}
            </Label>
            
            {/* Image Preview Grid */}
            {(imageUrls.length > 0 || images.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {imageUrls.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, true)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.map((file, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, false)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {imageUrls.length + images.length < 5 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-singleshop-blue transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload product images
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button type="button" variant="outline" asChild>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Product Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="What are you selling?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-singleshop-blue focus:ring-2 focus:ring-singleshop-blue/20 focus:ring-offset-0"
              required
            />
          </div>

          {/* Product Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <textarea
              id="description"
              placeholder="Tell customers about your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-singleshop-blue focus:ring-2 focus:ring-singleshop-blue/20 focus:ring-offset-0 resize-none"
            />
          </div>

          {/* Price */}
          <div className="space-y-3">
            <Label htmlFor="price" className="text-sm font-medium text-gray-700">
              Price *
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-12 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:border-singleshop-blue focus:ring-2 focus:ring-singleshop-blue/20 focus:ring-offset-0"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim() || !price}
              className="flex-1 bg-singleshop-blue hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {product ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
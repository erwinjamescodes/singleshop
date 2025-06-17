"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Package,
  DollarSign,
  Image as ImageIcon,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface ProductEditFormProps {
  product: any;
  shop: any;
}

export default function ProductEditForm({
  product,
  shop,
}: ProductEditFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: product.name || "",
    description: product.description || "",
    price_cents: product.price_cents || 0,
    currency: product.currency || "USD",
    is_available: product.is_available || true,
    inventory_count: product.inventory_count,
    image_urls: product.image_urls || [],
  });

  const [trackInventory, setTrackInventory] = useState(
    product.inventory_count !== null
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImageUrls = [...formData.image_urls];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${shop.id}/${
          product.id
        }/${Date.now()}-${i}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        newImageUrls.push(publicUrl);
      }

      setFormData({ ...formData, image_urls: newImageUrls });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "Failed to upload images: " + error.message,
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = formData.image_urls[index];
    const newImageUrls = formData.image_urls.filter(
      (_: string, i: number) => i !== index
    );

    // Extract file path from URL and delete from storage
    try {
      const urlParts = imageUrl.split("/");
      const fileName = urlParts.slice(-3).join("/"); // Get shop_id/product_id/filename.ext

      await supabase.storage.from("product-images").remove([fileName]);
    } catch (error) {
      console.error("Failed to delete image from storage:", error);
    }

    setFormData({ ...formData, image_urls: newImageUrls });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImageUrls = [...formData.image_urls];
    const [movedImage] = newImageUrls.splice(fromIndex, 1);
    newImageUrls.splice(toIndex, 0, movedImage);
    setFormData({ ...formData, image_urls: newImageUrls });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error("Product name is required");
      }
      if (formData.price_cents <= 0) {
        throw new Error("Product price must be greater than 0");
      }

      // Prepare update data
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price_cents: formData.price_cents,
        currency: formData.currency,
        is_available: formData.is_available,
        inventory_count: trackInventory ? formData.inventory_count : null,
        image_urls: formData.image_urls,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", product.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Product updated successfully!" });

      // Redirect after short delay
      setTimeout(() => {
        router.push("/dashboard/product/manage");
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update product",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => (cents / 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/product/manage">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Product
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">
              Update your product details and settings
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" asChild>
            <Link href={`/${shop.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview Shop
            </Link>
          </Button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    required
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.name.length}/100 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your product..."
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    maxLength={2000}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.description.length}/2000 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formatPrice(formData.price_cents)}
                        onChange={(e) =>
                          handleInputChange(
                            "price_cents",
                            Math.round(parseFloat(e.target.value || "0") * 100)
                          )
                        }
                        className="pl-9"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) =>
                        handleInputChange("currency", e.target.value)
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="PHP">PHP (₱)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Management */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="track-inventory"
                    checked={trackInventory}
                    onCheckedChange={(checked) =>
                      setTrackInventory(checked === true)
                    }
                  />
                  <Label htmlFor="track-inventory">
                    Track inventory quantities
                  </Label>
                </div>

                {trackInventory && (
                  <div>
                    <Label htmlFor="inventory">Inventory Count</Label>
                    <Input
                      id="inventory"
                      type="number"
                      min="0"
                      value={formData.inventory_count || 0}
                      onChange={(e) =>
                        handleInputChange(
                          "inventory_count",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Leave unchecked for unlimited inventory
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_available", checked === true)
                    }
                  />
                  <Label htmlFor="is-available">
                    Product is available for purchase
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Availability</span>
                  <Badge
                    variant={formData.is_available ? "default" : "secondary"}
                  >
                    {formData.is_available ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inventory</span>
                  <span className="text-sm">
                    {trackInventory
                      ? `${formData.inventory_count || 0} units`
                      : "Unlimited"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price</span>
                  <span className="text-sm font-semibold">
                    ${formatPrice(formData.price_cents)} {formData.currency}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Upload */}
                <div>
                  <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    disabled={uploadingImages}
                    onClick={() => document.getElementById("images")?.click()}
                  >
                    {uploadingImages ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Add Images
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload up to 10 images. JPG, PNG, or GIF. Max 5MB each.
                  </p>
                </div>

                {/* Image List */}
                {formData.image_urls.length > 0 ? (
                  <div className="space-y-2">
                    {formData.image_urls.map((url: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 border rounded-lg"
                      >
                        <img
                          src={url}
                          alt={`Product image ${index + 1}`}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {index === 0 && (
                              <Badge variant="outline" className="mr-2">
                                Primary
                              </Badge>
                            )}
                            Image {index + 1}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveImage(index, index - 1)}
                            >
                              ↑
                            </Button>
                          )}
                          {index < formData.image_urls.length - 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveImage(index, index + 1)}
                            >
                              ↓
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No images uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/product/manage">Cancel</Link>
          </Button>

          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

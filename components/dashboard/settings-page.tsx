"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Store,
  CreditCard,
  Bell,
  Shield,
  Camera,
  Save,
  ExternalLink,
  Check,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SettingsPageProps {
  user: any;
  profile: any;
  shop: any;
}

export default function SettingsPage({
  user,
  profile,
  shop,
}: SettingsPageProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    username: profile?.username || "",
  });

  // Shop form state
  const [shopForm, setShopForm] = useState({
    title: shop?.title || "",
    description: shop?.description || "",
    social_links: {
      website: "",
      instagram: "",
      twitter: "",
      facebook: "",
      youtube: "",
    },
  });

  const supabase = createClient();

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profileForm.display_name,
          bio: profileForm.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShopUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("shops")
        .update({
          title: shopForm.title,
          description: shopForm.description,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Shop settings updated successfully!",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update shop settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setMessage({ type: "success", text: "Avatar updated successfully!" });

      // Reload the page to show new avatar
      window.location.reload();
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to upload avatar",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPaymentAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/accounts/create", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to onboarding
        window.open(data.onboarding_link, "_blank");
        setMessage({
          type: "success",
          text: "Payment account setup started! Complete the process in the new tab.",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to create payment account",
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "shop", label: "Shop", icon: Store },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and shop preferences
        </p>
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

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-singleshop-blue text-singleshop-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid gap-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profileForm.display_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          display_name: e.target.value,
                        })
                      }
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="username">Username</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        singleshop.com/
                      </span>
                      <Input
                        id="username"
                        value={profileForm.username}
                        disabled
                        className="rounded-l-none"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Username cannot be changed after registration
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, bio: e.target.value })
                      }
                      placeholder="Tell people about yourself..."
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      maxLength={500}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {profileForm.bio.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                    <p className="text-sm text-muted-foreground mt-1">
                      Email cannot be changed from this page
                    </p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Save Profile</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upload new picture</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => document.getElementById("avatar")?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === "shop" && (
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Shop Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShopUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="shop_title">Shop Title</Label>
                    <Input
                      id="shop_title"
                      value={shopForm.title}
                      onChange={(e) =>
                        setShopForm({ ...shopForm, title: e.target.value })
                      }
                      placeholder="Your shop name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="shop_description">Shop Description</Label>
                    <textarea
                      id="shop_description"
                      value={shopForm.description}
                      onChange={(e) =>
                        setShopForm({
                          ...shopForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your shop..."
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      maxLength={1000}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {shopForm.description.length}/1000 characters
                    </p>
                  </div>

                  <div>
                    <Label>Shop URL</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        singleshop.com/
                      </span>
                      <Input
                        value={profile?.username || ""}
                        disabled
                        className="rounded-l-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-l-none border-l-0"
                        asChild
                      >
                        <a
                          href={`/${profile?.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Social Media Links</h4>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={shopForm.social_links.website}
                        onChange={(e) =>
                          setShopForm({
                            ...shopForm,
                            social_links: {
                              ...shopForm.social_links,
                              website: e.target.value,
                            },
                          })
                        }
                        placeholder="https://yourwebsite.com"
                        type="url"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          value={shopForm.social_links.instagram}
                          onChange={(e) =>
                            setShopForm({
                              ...shopForm,
                              social_links: {
                                ...shopForm.social_links,
                                instagram: e.target.value,
                              },
                            })
                          }
                          placeholder="@username"
                        />
                      </div>

                      <div>
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={shopForm.social_links.twitter}
                          onChange={(e) =>
                            setShopForm({
                              ...shopForm,
                              social_links: {
                                ...shopForm.social_links,
                                twitter: e.target.value,
                              },
                            })
                          }
                          placeholder="@username"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          value={shopForm.social_links.facebook}
                          onChange={(e) =>
                            setShopForm({
                              ...shopForm,
                              social_links: {
                                ...shopForm.social_links,
                                facebook: e.target.value,
                              },
                            })
                          }
                          placeholder="Page name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="youtube">YouTube</Label>
                        <Input
                          id="youtube"
                          value={shopForm.social_links.youtube}
                          onChange={(e) =>
                            setShopForm({
                              ...shopForm,
                              social_links: {
                                ...shopForm.social_links,
                                youtube: e.target.value,
                              },
                            })
                          }
                          placeholder="Channel name"
                        />
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      <Badge variant="secondary" className="mr-2">
                        Coming Soon
                      </Badge>
                      Social links will be displayed on your shop page
                    </p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Save Shop Settings</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Payment Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your bank account to receive payments
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile?.payment_onboarded ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Connected</Badge>
                    )}
                  </div>
                </div>

                {!profile?.payment_onboarded && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Setup Payment Account
                    </h4>
                    <p className="text-sm text-blue-800 mb-4">
                      To start receiving payments, you need to set up your
                      payment account. This is a simulated process for demo
                      purposes.
                    </p>
                    <Button onClick={createPaymentAccount} disabled={loading}>
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Setting up...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Setup Payment Account</span>
                        </div>
                      )}
                    </Button>
                  </div>
                )}

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Transaction Fees</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• 5% per transaction (Free tier)</p>
                    <p>• 3% per transaction + $9/month (Pro tier)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive emails for important updates
                      </p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Order Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you receive new orders
                      </p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Marketing Emails</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive tips and updates about SingleShop
                      </p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Update your account password
                      </p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Login History</h4>
                      <p className="text-sm text-muted-foreground">
                        See your recent login activity
                      </p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

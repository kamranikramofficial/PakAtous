"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Plus, Edit2, Trash2, Check } from "lucide-react";

interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingId(address._id);
      setFormData({
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      setEditingId(null);
      setFormData({
        label: "",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Pakistan",
        isDefault: false,
      });
    }
    setOpenDialog(true);
  };

  const handleSaveAddress = async () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/user/addresses/${editingId}`
        : "/api/user/addresses";
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save address");

      const data = await res.json();
      setAddresses(data.addresses || []);
      setOpenDialog(false);

      toast({
        title: "Success",
        description: editingId ? "Address updated successfully" : "Address added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setDeleting(addressId);
    try {
      const res = await fetch(`/api/user/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete address");

      const data = await res.json();
      setAddresses(data.addresses || []);

      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete address",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error("Failed to set default address");

      const data = await res.json();
      setAddresses(data.addresses || []);

      toast({
        title: "Success",
        description: "Default address updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set default address",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saved Addresses</h1>
          <p className="text-muted-foreground">Manage your delivery addresses</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No addresses saved yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first address to make checkout faster
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <Card key={address._id} className="relative">
              {address.isDefault && (
                <Badge className="absolute top-4 right-4">Default</Badge>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{address.label}</CardTitle>
                    <CardDescription>{address.fullName}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">{address.phone}</p>
                  <p className="text-muted-foreground">{address.address}</p>
                  <p className="text-muted-foreground">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-muted-foreground">{address.country}</p>
                </div>

                <div className="border-t pt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(address)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteAddress(address._id)}
                    disabled={deleting === address._id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>

                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => handleSetDefault(address._id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update your address information"
                : "Add a new delivery address"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="e.g., Home, Office"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="+92 3XX XXXXXXX"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="Street address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="Postal code"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isDefault" className="font-normal">
                Set as default address
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} disabled={submitting}>
              {submitting ? "Saving..." : "Save Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

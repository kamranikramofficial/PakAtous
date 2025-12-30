"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function StaffInventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [generators, setGenerators] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"generators" | "parts">("generators");

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user && (session.user.role === "ADMIN" || session.user.role === "STAFF")) {
      fetchInventory();
    }
  }, [session, status]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [genRes, partsRes] = await Promise.all([
        fetch("/api/admin/generators?limit=100"),
        fetch("/api/admin/parts?limit=100"),
      ]);

      if (genRes.ok) {
        const genData = await genRes.json();
        setGenerators(genData.generators || []);
      }

      if (partsRes.ok) {
        const partsData = await partsRes.json();
        setParts(partsData.parts || []);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number, threshold: number = 5) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (stock <= threshold) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const filteredGenerators = generators.filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredParts = parts.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockGenerators = generators.filter((g) => g.stock <= (g.lowStockThreshold || 5));
  const lowStockParts = parts.filter((p) => p.stock <= (p.lowStockThreshold || 10));

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">View stock levels for generators and parts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Generators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generators.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts.length}</div>
          </CardContent>
        </Card>
        <Card className={lowStockGenerators.length > 0 ? "border-yellow-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Generators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockGenerators.length}</div>
          </CardContent>
        </Card>
        <Card className={lowStockParts.length > 0 ? "border-yellow-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockParts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "generators" ? "default" : "outline"}
            onClick={() => setActiveTab("generators")}
          >
            Generators ({generators.length})
          </Button>
          <Button
            variant={activeTab === "parts" ? "default" : "outline"}
            onClick={() => setActiveTab("parts")}
          >
            Parts ({parts.length})
          </Button>
        </div>
        <div className="flex-1">
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "generators" ? "Generators" : "Parts"} Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">SKU</th>
                  <th className="text-center p-2">Stock</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-right p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === "generators" ? (
                  filteredGenerators.length > 0 ? (
                    filteredGenerators.map((item) => {
                      const stockStatus = getStockStatus(item.stock, item.lowStockThreshold);
                      return (
                        <tr key={item.id || item._id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.brand}</p>
                            </div>
                          </td>
                          <td className="p-2 text-muted-foreground">{item.sku || "-"}</td>
                          <td className="p-2 text-center font-medium">{item.stock}</td>
                          <td className="p-2 text-center">
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          </td>
                          <td className="p-2 text-right">PKR {item.price?.toLocaleString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No generators found
                      </td>
                    </tr>
                  )
                ) : (
                  filteredParts.length > 0 ? (
                    filteredParts.map((item) => {
                      const stockStatus = getStockStatus(item.stock, item.lowStockThreshold);
                      return (
                        <tr key={item.id || item._id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.brand || "-"}</p>
                            </div>
                          </td>
                          <td className="p-2 text-muted-foreground">{item.sku || "-"}</td>
                          <td className="p-2 text-center font-medium">{item.stock}</td>
                          <td className="p-2 text-center">
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          </td>
                          <td className="p-2 text-right">PKR {item.price?.toLocaleString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No parts found
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

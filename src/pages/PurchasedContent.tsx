import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Download, Eye, Calendar, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface PurchasedItem {
  id: string;
  title: string;
  description: string;
  type: 'essay' | 'profile' | 'guide' | 'template';
  price: number;
  purchasedAt: string;
  downloadUrl?: string;
  status: 'active' | 'expired' | 'pending';
  rating?: number;
}

const mockPurchasedItems: PurchasedItem[] = [
  {
    id: '1',
    title: 'Harvard Computer Science Essays Collection',
    description: '50+ successful Harvard CS application essays with analysis and tips',
    type: 'essay',
    price: 29.99,
    purchasedAt: '2024-10-15',
    status: 'active',
    rating: 4.8
  },
  {
    id: '2',
    title: 'MIT Engineering Profile Templates',
    description: 'Professional templates for MIT engineering applications',
    type: 'template',
    price: 19.99,
    purchasedAt: '2024-10-10',
    status: 'active',
    rating: 4.6
  },
  {
    id: '3',
    title: 'Ivy League Success Stories Guide',
    description: 'Comprehensive guide with 100+ student success stories',
    type: 'guide',
    price: 39.99,
    purchasedAt: '2024-10-05',
    status: 'active',
    rating: 4.9
  }
];

export default function PurchasedContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Simulate loading purchased content
    setTimeout(() => {
      setPurchasedItems(mockPurchasedItems);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'essay': return '📝';
      case 'profile': return '👤';
      case 'guide': return '📚';
      case 'template': return '📋';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'essay': return 'bg-blue-100 text-blue-800';
      case 'profile': return 'bg-green-100 text-green-800';
      case 'guide': return 'bg-purple-100 text-purple-800';
      case 'template': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer maxWidth="4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
              <p className="text-foreground/60">Loading your purchased content...</p>
            </div>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer maxWidth="4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              Purchased Content
            </h1>
            <p className="text-foreground/60 mt-1">
              Access your purchased essays, profiles, and guides
            </p>
          </div>
        </div>

        {purchasedItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No purchased content yet</h3>
              <p className="text-foreground/60 text-center mb-6 max-w-md">
                You haven't purchased any content yet. Browse our collection of essays, profiles, and guides to get started.
              </p>
              <Button onClick={() => navigate('/admitted-essays')}>
                Browse Content
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </Badge>
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground/60">Price:</span>
                      <span className="font-semibold">${item.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground/60">Purchased:</span>
                      <span>{new Date(item.purchasedAt).toLocaleDateString()}</span>
                    </div>
                    {item.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-foreground/60">{item.rating}/5</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {item.downloadUrl && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </Layout>
  );
}

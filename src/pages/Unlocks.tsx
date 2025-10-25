import { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Lock, 
  Unlock, 
  Star, 
  Users, 
  FileText, 
  BookOpen, 
  Zap, 
  Crown,
  Check,
  X,
  ShoppingCart,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface UnlockPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  icon: React.ComponentType<any>;
  features: string[];
  category: 'essays' | 'profiles' | 'guides' | 'templates' | 'premium';
  isPopular?: boolean;
  isNew?: boolean;
  unlockCount: number;
}

const unlockPackages: UnlockPackage[] = [
  {
    id: 'essays-basic',
    name: 'Essay Starter Pack',
    description: '50+ successful college essays with analysis',
    price: 19.99,
    originalPrice: 29.99,
    icon: FileText,
    features: [
      '50 Harvard & MIT essays',
      'Detailed analysis for each',
      'Common prompt breakdowns',
      'Writing tips & strategies'
    ],
    category: 'essays',
    isNew: true,
    unlockCount: 50
  },
  {
    id: 'profiles-premium',
    name: 'Elite Profiles Collection',
    description: '200+ admitted student profiles with full details',
    price: 39.99,
    originalPrice: 59.99,
    icon: Users,
    features: [
      '200+ Ivy League profiles',
      'Complete academic stats',
      'Activity breakdowns',
      'Decision outcomes',
      'Success patterns analysis'
    ],
    category: 'profiles',
    isPopular: true,
    unlockCount: 200
  },
  {
    id: 'guides-complete',
    name: 'Complete Application Guide',
    description: 'Step-by-step application strategy guide',
    price: 29.99,
    icon: BookOpen,
    features: [
      'Application timeline',
      'Essay writing framework',
      'Activity selection guide',
      'Interview preparation',
      'Financial aid strategies'
    ],
    category: 'guides',
    unlockCount: 1
  },
  {
    id: 'templates-pro',
    name: 'Professional Templates',
    description: 'Ready-to-use application templates',
    price: 24.99,
    icon: FileText,
    features: [
      'Resume templates',
      'Activity descriptions',
      'Essay outlines',
      'Interview prep sheets',
      'Recommendation request templates'
    ],
    category: 'templates',
    unlockCount: 15
  },
  {
    id: 'premium-all-access',
    name: 'All Access Pass',
    description: 'Unlock everything - the ultimate package',
    price: 89.99,
    originalPrice: 149.99,
    icon: Crown,
    features: [
      'Everything in all packages',
      'Exclusive premium content',
      'Priority support',
      'Monthly new content',
      'Advanced analytics'
    ],
    category: 'premium',
    isPopular: true,
    unlockCount: 999
  }
];

export default function Unlocks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', count: unlockPackages.length },
    { id: 'essays', label: 'Essays', count: unlockPackages.filter(p => p.category === 'essays').length },
    { id: 'profiles', label: 'Profiles', count: unlockPackages.filter(p => p.category === 'profiles').length },
    { id: 'guides', label: 'Guides', count: unlockPackages.filter(p => p.category === 'guides').length },
    { id: 'templates', label: 'Templates', count: unlockPackages.filter(p => p.category === 'templates').length },
    { id: 'premium', label: 'Premium', count: unlockPackages.filter(p => p.category === 'premium').length },
  ];

  const filteredPackages = unlockPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = (packageId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // TODO: Implement actual purchase logic
    console.log('Purchasing package:', packageId);
    // This would integrate with your payment system
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essays': return 'bg-blue-100 text-blue-800';
      case 'profiles': return 'bg-green-100 text-green-800';
      case 'guides': return 'bg-purple-100 text-purple-800';
      case 'templates': return 'bg-orange-100 text-orange-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <PageContainer maxWidth="6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Unlock className="h-8 w-8" />
            Unlock Premium Content
          </h1>
          <p className="text-foreground/60 text-lg">
            Access exclusive essays, profiles, guides, and templates to boost your college application
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search unlocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const Icon = pkg.icon;
            const discount = pkg.originalPrice ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100) : 0;
            
            return (
              <Card key={pkg.id} className="relative hover:shadow-lg transition-all duration-200 group">
                {/* Badges */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  {pkg.isPopular && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {pkg.isNew && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      New
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-brand/10">
                      <Icon className="h-6 w-6 text-brand" />
                    </div>
                    <Badge className={getCategoryColor(pkg.category)}>
                      {pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">${pkg.price}</span>
                    {pkg.originalPrice && (
                      <span className="text-lg text-foreground/60 line-through">
                        ${pkg.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Unlock Count */}
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Unlock className="h-4 w-4" />
                    <span>{pkg.unlockCount} items unlocked</span>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">What's included:</h4>
                    <ul className="space-y-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                          <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Purchase Button */}
                  <Button 
                    onClick={() => handlePurchase(pkg.id)}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Unlock for ${pkg.price}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Lock className="h-12 w-12 text-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No unlocks found</h3>
              <p className="text-foreground/60">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-brand/5 to-brand/10 border-brand/20">
            <CardContent className="py-8">
              <Crown className="h-12 w-12 text-brand mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Ready to unlock your potential?
              </h3>
              <p className="text-foreground/70 mb-4 max-w-2xl mx-auto">
                Join thousands of students who have used our premium content to get into their dream schools.
              </p>
              <Button size="lg" className="bg-brand hover:bg-brand/90">
                <Zap className="h-4 w-4 mr-2" />
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </Layout>
  );
}





import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { ArrowLeft } from 'lucide-react';

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: t('auth.signInFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.verifyEmail'),
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, displayName);
    
    if (error) {
      toast({
        title: t('auth.signUpFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('auth.accountCreated'),
        description: t('auth.verifyEmail'),
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center bg-white">

      <div className="relative z-10 w-full max-w-md p-4 flex flex-col items-center">
        <button
          className="mb-4 inline-flex items-center justify-center rounded-md border border-border bg-white/70 px-4 py-1 text-[12px] text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2 inline" />
          {t('auth.logIn')}
        </button>

        <Card className="border border-border bg-white/80 backdrop-blur-md shadow-[0_30px_60px_-20px_rgba(2,6,23,0.12),0_12px_24px_rgba(2,6,23,0.06)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">Welcome</CardTitle>
            <CardDescription className="text-center text-foreground/70">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 h-8 text-[12px] p-0.5">
                <TabsTrigger value="signin" className="py-1 text-[12px]">{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="signup" className="py-1 text-[12px]">{t('auth.signUp')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('auth.email')}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t('auth.password')}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-md border border-border bg-white/70 px-4 py-1 text-[12px] text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white disabled:opacity-50 disabled:pointer-events-none"
                    disabled={loading}
                  >
                    {loading ? t('auth.sending') : t('auth.signIn')}
                  </button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t('auth.displayName')}</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-md border border-border bg-white/70 px-4 py-1 text-[12px] text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white disabled:opacity-50 disabled:pointer-events-none"
                    disabled={loading}
                  >
                    {loading ? t('auth.saving') : t('auth.signUp')}
                  </button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
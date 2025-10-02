import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GenerateLinkProps {
  resourceType: string;
  title: string;
  snapshot: any;
  onLoad?: (data: any) => void;
  className?: string;
}

const GenerateLink: React.FC<GenerateLinkProps> = ({ 
  resourceType, 
  title, 
  snapshot, 
  onLoad,
  className = "" 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [importSlug, setImportSlug] = useState<string>("");

  const createShare = async () => {
    if (!user) { 
      toast({ 
        title: 'Login required', 
        description: 'Please log in to create a share link.', 
        variant: 'destructive' 
      }); 
      return; 
    }
    
    // Generate a random token
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2, 10);
    
    const { error } = await supabase
      .from('share_links')
      .insert({
        user_id: user.id,
        resource_type: resourceType,
        resource_id: null,
        token,
        title,
        snapshot,
      });
      
    if (error) { 
      toast({ 
        title: 'Share failed', 
        description: error.message, 
        variant: 'destructive' 
      }); 
      return; 
    }
    
    const url = `${window.location.origin}/personal-blueprint?share=${token}`;
    setGeneratedUrl(url);
    navigator.clipboard?.writeText(url).catch(() => {});
    toast({ 
      title: 'Share link created', 
      description: 'URL copied to clipboard.' 
    });
  };

  const importShare = async () => {
    if (!importSlug.trim()) return;
    const token = importSlug.trim().replace(/^.*[?&]share=/, '');
    
    const { data, error } = await (supabase as any).rpc('get_share_snapshot', { p_token: token });
    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      toast({ 
        title: 'Import failed', 
        description: error?.message || 'Blueprint not found.', 
        variant: 'destructive' 
      });
      return;
    }
    
    toast({ 
      title: 'Blueprint loaded', 
      description: 'Shared blueprint data imported successfully.' 
    });
    
    if (onLoad) {
      onLoad(data);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Generate Section */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-foreground/70">Create a shareable profile URL</span>
        <button 
          onClick={createShare} 
          className="rounded-md border border-border bg-white px-3 py-0 text-[12px] text-foreground/70 shadow-sm hover:bg-white h-[24px] min-h-0 leading-none"
        >
          Generate URL
        </button>
      </div>
      
      {generatedUrl && (
        <div className="text-[12px] text-foreground/70 break-all">{generatedUrl}</div>
      )}
      
      {/* Load Section */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Paste share URL or code"
          value={importSlug}
          onChange={(e) => setImportSlug(e.target.value)}
          className="flex-1 rounded-md border border-border bg-white px-3 py-1 text-[12px] text-foreground/70 placeholder:text-foreground/50 focus:outline-none focus:ring-1 focus:ring-border"
        />
        <button
          onClick={importShare}
          className="rounded-md border border-border bg-white px-3 py-1 text-[12px] text-foreground/70 shadow-sm hover:bg-white transition-colors"
        >
          Load
        </button>
      </div>
    </div>
  );
};

export default GenerateLink;

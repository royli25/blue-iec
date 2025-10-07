import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const HamburgerMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="bg-transparent hover:bg-transparent shadow-none border-0">
            <Menu className="h-4 w-4 text-foreground/70" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40 bg-white/90 backdrop-blur-md border border-border shadow-sm text-[12px] p-2">
          <DropdownMenuItem 
            onClick={() => navigate('/technology')} 
            className="text-[12px] text-foreground/70 hover:text-foreground hover:bg-white cursor-pointer px-3 py-2 rounded-sm"
          >
            About
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/personal-blueprint')} 
            className="text-[12px] text-foreground/70 hover:text-foreground hover:bg-white cursor-pointer px-3 py-2 rounded-sm"
          >
            My Blueprint
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/admitted-profiles')} 
            className="text-[12px] text-foreground/70 hover:text-foreground hover:bg-white cursor-pointer px-3 py-2 rounded-sm"
          >
            Admitted Profiles
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HamburgerMenu;
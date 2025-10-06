import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-card/95 backdrop-blur-sm border border-border text-[12px]">
          <DropdownMenuItem onClick={() => navigate('/technology')} className="font-normal">
            About
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/personal-blueprint')} className="font-normal">
            My Blueprint
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/admitted-profiles')} className="font-normal">
            Admitted Profiles
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HamburgerMenu;
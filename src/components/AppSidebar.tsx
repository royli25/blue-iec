import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquarePlus, NotebookText, UsersRound, Info } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  onNewChat?: () => void;
  onNavigate?: (path: string) => void;
}

export function AppSidebar({ onNewChat, onNavigate }: AppSidebarProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const handleNewChatClick = () => {
    if (onNewChat && location.pathname === "/") {
      onNewChat();
    } else {
      handleNavigation("/");
    }
  };

  const menuItems = [
    {
      icon: MessageSquarePlus,
      label: "New chat",
      tooltip: "New chat",
      action: handleNewChatClick,
      path: "/",
    },
    {
      icon: UsersRound,
      label: "Admitted Profiles",
      tooltip: "Admitted Profiles",
      path: "/admitted-profiles",
    },
    {
      icon: NotebookText,
      label: "My Blueprint",
      tooltip: "My Blueprint",
      path: "/personal-blueprint",
    },
    {
      icon: Info,
      label: "About",
      tooltip: "About",
      path: "/technology",
    },
  ];

  return (
    <Sidebar collapsible="icon" className="bg-[hsl(var(--sidebar-background))] border-r border-border">
      <SidebarHeader className="h-10 flex flex-row items-center justify-end px-4 py-2 group-data-[state=collapsed]:justify-center">
        <SidebarTrigger className="h-5 w-5" />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <div className="h-3" aria-hidden />
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={item.action ? item.action : () => handleNavigation(item.path)}
                    tooltip={item.tooltip}
                    className="pr-3"
                    isActive={isActive}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}


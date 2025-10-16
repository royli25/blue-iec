import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquarePlus, NotebookText, UsersRound, Info, Trash2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
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
import { fetchChatSessions, deleteChatSession, type ChatSession } from "@/lib/chat-utils";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

interface AppSidebarProps {
  onNewChat?: () => void;
  onNavigate?: (path: string) => void;
  onLoadChat?: (session: ChatSession) => void;
  currentChatId?: string | null;
  refreshTrigger?: number; // Add this to force refresh when a chat is saved
}

export function AppSidebar({ onNewChat, onNavigate, onLoadChat, currentChatId, refreshTrigger }: AppSidebarProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

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

  // Load recent chats when user is logged in and on the home page
  useEffect(() => {
    if (user && location.pathname === "/") {
      loadRecentChats();
    }
  }, [user, location.pathname, refreshTrigger]);

  const loadRecentChats = async () => {
    setIsLoadingChats(true);
    const sessions = await fetchChatSessions();
    setRecentChats(sessions.slice(0, 10)); // Show only 10 most recent
    setIsLoadingChats(false);
  };

  const handleDeleteChat = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent loading the chat
    const success = await deleteChatSession(sessionId);
    if (success) {
      setRecentChats(prev => prev.filter(chat => chat.id !== sessionId));
      // If we deleted the current chat, trigger new chat
      if (currentChatId === sessionId && onNewChat) {
        onNewChat();
      }
    }
  };

  const menuItems = [
    {
      icon: MessageSquarePlus,
      labelKey: "sidebar.newChat",
      tooltipKey: "sidebar.newChat",
      action: handleNewChatClick,
      path: "/",
    },
    {
      icon: UsersRound,
      labelKey: "sidebar.admittedProfiles",
      tooltipKey: "sidebar.admittedProfiles",
      path: "/admitted-profiles",
    },
    {
      icon: NotebookText,
      labelKey: "sidebar.myBlueprint",
      tooltipKey: "sidebar.myBlueprint",
      path: "/personal-blueprint",
    },
    {
      icon: Info,
      labelKey: "sidebar.about",
      tooltipKey: "sidebar.about",
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
              const isActive = location.pathname === item.path && !currentChatId;
              
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={item.action ? item.action : () => handleNavigation(item.path)}
                    tooltip={t(item.tooltipKey)}
                    className="pr-3"
                    isActive={isActive}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{t(item.labelKey)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Recent Chats Section */}
        {location.pathname === "/" && user && recentChats.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <div className="px-3 py-2 text-[11px] font-semibold text-sidebar-foreground/70">
                <span className="group-data-[collapsible=icon]:hidden">{t('sidebar.recent')}</span>
              </div>
              <SidebarMenu>
                {recentChats.map((chat) => {
                  const isActive = currentChatId === chat.id;
                  
                  return (
                    <SidebarMenuItem key={chat.id}>
                      <div className="group/chat-item relative flex items-center">
                        <SidebarMenuButton
                          onClick={() => onLoadChat?.(chat)}
                          className="pr-8 flex-1"
                          isActive={isActive}
                          tooltip={chat.title}
                        >
                          <span className="truncate">{chat.title}</span>
                        </SidebarMenuButton>
                        <button
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          className="absolute right-2 opacity-0 group-hover/chat-item:opacity-100 transition-opacity p-1 hover:bg-sidebar-accent rounded-md group-data-[collapsible=icon]:hidden"
                          title={t('sidebar.deleteChat')}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}

        {/* Language Toggle - Bottom of Sidebar */}
        <SidebarSeparator />
        <SidebarGroup className="mt-auto">
          <div className="px-3 py-2">
            <LanguageToggle />
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}


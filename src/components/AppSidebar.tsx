import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquarePlus, NotebookText, UsersRound, Info, Trash2, ShoppingBag, Unlock, Settings } from "lucide-react";
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
  refreshTrigger?: number;
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

  useEffect(() => {
    if (user && location.pathname === "/") {
      loadRecentChats();
    }
  }, [user, location.pathname, refreshTrigger]);

  const loadRecentChats = async () => {
    setIsLoadingChats(true);
    const sessions = await fetchChatSessions();
    setRecentChats(sessions.slice(0, 10));
    setIsLoadingChats(false);
  };

  const handleDeleteChat = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const success = await deleteChatSession(sessionId);
    if (success) {
      setRecentChats(prev => prev.filter(chat => chat.id !== sessionId));
      if (currentChatId === sessionId && onNewChat) {
        onNewChat();
      }
    }
  };

  const mainMenuItems = [
    {
      icon: MessageSquarePlus,
      labelKey: "sidebar.newChat",
      tooltipKey: "sidebar.newChat",
      action: handleNewChatClick,
      path: "/",
    },
    {
      icon: UsersRound,
      labelKey: "sidebar.admittedData",
      tooltipKey: "sidebar.admittedData",
      path: "/admitted-data",
    },
    {
      icon: NotebookText,
      labelKey: "sidebar.myBlueprint",
      tooltipKey: "sidebar.myBlueprint",
      path: "/personal-blueprint",
    },
  ];

  const secondaryMenuItems = [
    {
      icon: Unlock,
      labelKey: "sidebar.unlocks",
      tooltipKey: "sidebar.unlocks",
      path: "/unlocks",
    },
    {
      icon: ShoppingBag,
      labelKey: "sidebar.purchasedContent",
      tooltipKey: "sidebar.purchasedContent",
      path: "/purchased-content",
    },
  ];

  const bottomMenuItems = [
    {
      icon: Info,
      labelKey: "sidebar.about",
      tooltipKey: "sidebar.about",
      path: "/technology",
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white">
      {/* Header with Logo */}
      <SidebarHeader className="h-14 flex flex-row items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center gap-2 group-data-[state=collapsed]:hidden">
          <img src="/long_logo.svg" alt="Blueprint" className="h-4 w-auto" />
        </div>
        <div className="group-data-[state=collapsed]:hidden">
          <LanguageToggle />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarMenu>
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path && !currentChatId;
              
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={item.action ? item.action : () => handleNavigation(item.path)}
                    tooltip={t(item.tooltipKey)}
                    isActive={isActive}
                    className="h-9 text-sm font-normal text-gray-700 hover:bg-gray-100 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 rounded-lg"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="group-data-[state=collapsed]:hidden">{t(item.labelKey)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Recent Chats Section */}
        {location.pathname === "/" && user && recentChats.length > 0 && (
          <div className="group-data-[state=collapsed]:hidden mt-4">
            <SidebarGroup>
              <div className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                {t('sidebar.recent')}
              </div>
              <div className="relative">
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  <SidebarMenu>
                    {recentChats.map((chat) => {
                      const isActive = currentChatId === chat.id;
                      
                      return (
                        <SidebarMenuItem key={chat.id}>
                          <div className="group/chat-item relative flex items-center">
                            <SidebarMenuButton
                              onClick={() => onLoadChat?.(chat)}
                              className="h-8 pr-8 flex-1 text-sm text-gray-600 hover:bg-gray-100 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 rounded-lg"
                              isActive={isActive}
                              tooltip={chat.title}
                            >
                              <span className="truncate text-xs">{chat.title}</span>
                            </SidebarMenuButton>
                            <button
                              onClick={(e) => handleDeleteChat(e, chat.id)}
                              className="absolute right-2 opacity-0 group-hover/chat-item:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-md"
                              title={t('sidebar.deleteChat')}
                            >
                              <Trash2 className="h-3 w-3 text-gray-500" />
                            </button>
                          </div>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>
                
                {recentChats.length > 4 && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>
            </SidebarGroup>
          </div>
        )}

        {/* Secondary Menu */}
        <div className="mt-auto pt-4">
          <SidebarSeparator className="bg-gray-200" />
          <SidebarGroup className="mt-3">
            <SidebarMenu>
              {secondaryMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.path)}
                      tooltip={t(item.tooltipKey)}
                      isActive={isActive}
                      className="h-9 text-sm font-normal text-gray-700 hover:bg-gray-100 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 rounded-lg"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="group-data-[state=collapsed]:hidden">{t(item.labelKey)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* Bottom Menu */}
          <SidebarSeparator className="bg-gray-200 mt-3" />
          <SidebarGroup className="mt-3 pb-2">
            <SidebarMenu>
              {bottomMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.path)}
                      tooltip={t(item.tooltipKey)}
                      isActive={isActive}
                      className="h-9 text-sm font-normal text-gray-600 hover:bg-gray-100 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 rounded-lg"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="group-data-[state=collapsed]:hidden">{t(item.labelKey)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

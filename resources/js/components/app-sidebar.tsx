import { useState } from 'react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, Users, Settings, User, ChevronDown, ChevronRight,
    Code, Trophy, MessageSquare, BarChart3, BookOpen, Swords,
    HelpCircle, Target, GamepadIcon
} from 'lucide-react';
import AppLogo from './app-logo';

// Define the theme colors
const themeColors = {
  primary: '#00A650',
  lightBg: '#E6FFE6',
};

// Extended NavItem type that includes submenu items
interface NavItemWithSubmenu extends NavItem {
  submenu?: NavItem[];
  open?: boolean;
}

// Dropdown Menu Item Component
const DropdownMenuItem = ({ item, isActive }: { item: NavItemWithSubmenu, isActive: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const activeStyles = isActive ? 
    "bg-[#E6FFE6] text-[#00A650]" : 
    "text-gray-700 hover:text-[#00A650]";

  // If there's no submenu, render a regular link
  if (!item.submenu || item.submenu.length === 0) {
    return (
      <Link
        href={item.href}
        className={`flex items-center py-2 px-4 rounded-md transition-colors ${activeStyles}`}
      >
        {item.icon && <item.icon className="mr-2 h-5 w-5" />}
        <span>{item.title}</span>
      </Link>
    );
  }

  // Render a dropdown menu
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className={`flex items-center justify-between w-full py-2 px-4 rounded-md transition-colors ${activeStyles}`}
      >
        <div className="flex items-center">
          {item.icon && <item.icon className="mr-2 h-5 w-5" />}
          <span>{item.title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      
      {isOpen && (
        <div className="ml-6 mt-1 space-y-1">
          {item.submenu.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              className="flex items-center py-2 px-4 rounded-md text-gray-600 hover:text-[#00A650] hover:bg-[#E6FFE6] transition-colors"
            >
              {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
              <span className="text-sm">{subItem.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export function AppSidebar() {
    const { auth, url } = usePage().props as any;
    const userRole = auth.user?.role;
    const currentPath = url;

    // Helper function to check if current path matches
   const isActivePath = (href: string) => {
    if (typeof currentPath !== 'string') return false;
    return currentPath === href || currentPath.startsWith(href + '/');
};


    // Define navigation items based on user role
    let mainNavItems: NavItemWithSubmenu[] = [];
    
    // Admin navigation items
    if (userRole === 'admin') {
        mainNavItems = [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'User Management',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Challenge Management',
                href: '/admin/challenges',
                icon: Code,
            },
            {
                title: 'Reports & Analytics',
                href: '/admin/reports',
                icon: BarChart3,
            },
            {
                title: 'Feedback Management',
                href: '/admin/feedbacks',
                icon: MessageSquare,
            },
            // {
            //     title: 'System Settings',
            //     href: '/admin/settings',
            //     icon: Settings,
            // },
        ];
    } 
    // Participant navigation items
    else if (userRole === 'participant') {
        mainNavItems = [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Practice',
                href: '#',
                icon: BookOpen,
                submenu: [
                    {
                        title: 'Training Challenge',
                        href: '/play/solo',
                        icon: Target,
                    },
                    {
                        title: 'Duel Challenge',
                        href: '/play/duel',
                        icon: Swords,
                    }
                ]
            },
            {
                title: 'My Profile',
                href: '/profile',
                icon: User,
            },
            {
                title: 'Help & FAQ',
                href: '/faq',
                icon: HelpCircle,
            },
        ];
    }
    // Default navigation items (fallback)
    else {
        mainNavItems = [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Help & FAQ',
                href: '/faq',
                icon: HelpCircle,
            },
        ];
    }

    // Custom styles for the exact color theme
    const sidebarStyle = {
        borderColor: themeColors.primary,
    };

    return (
        <Sidebar 
            collapsible="icon" 
            variant="inset" 
            className="bg-white border-r dark:bg-gray-900"
            style={sidebarStyle}
        >
            <SidebarHeader className="border-b" style={sidebarStyle}>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="py-4">
                            <Link 
                                href="/dashboard"
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="p-4 space-y-2">
                    {mainNavItems.map((item, index) => (
                        <div key={index}>
                            <DropdownMenuItem 
                                item={item} 
                                isActive={isActivePath(item.href)}
                            />
                        </div>
                    ))}
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t" style={sidebarStyle}>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
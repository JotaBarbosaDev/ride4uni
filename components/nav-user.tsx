"use client"
import {useEffect, useState} from "react";
import {logout, getCurrentUser} from "@/api/authService";
import {useRouter} from "next/navigation";
import {getUserByID} from "@/api/userService";
import { setCookie,destroyCookie } from "nookies"; 
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  MessageSquare,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { LucideStar } from "lucide-react"

import {getDriverRating} from "@/api/ratingService"

export function NavUser({
  user,
}: {
  user: {
    name: string
    rating: {
      LucideStar: typeof LucideStar,
      ratingNumber: number
    }
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<typeof user | null>(null);

  useEffect(() => {
    const loadRating = async () => {
      try {
        const {data: currentUserId} = await getCurrentUser();
        if (currentUserId) {
          setCookie(null, "currentUserId", String(currentUserId), {
            path: "/",
            maxAge: 60 * 60 * 24, 
            sameSite: "lax",
          });
        }
        const {data: fetchedUser} = await getUserByID(currentUserId);
        const {data} = await getDriverRating(currentUserId);
        setUserInfo(fetchedUser);
        setRating(data?.averageRating ?? data ?? null);
      } catch (error) {
        console.error("Failed to load rating", error);
      }
    };
    loadRating();
  }, []);

  const handleLogout = async () => {
    try {
        await logout(); 
      } finally {
        destroyCookie(null, "currentUserId", { path: "/" });
      }
    
    router.push("/login");    
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userInfo?.avatar ?? user.avatar} alt={userInfo?.name ?? user.name} />
                <AvatarFallback className="rounded-lg">U</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userInfo?.name ?? user.name}</span>
                <span className="truncate text-xs flex flex-row items-center">
                  <LucideStar className="h-3 w-3 mr-1" />
                  {(rating ?? user.rating.ratingNumber) + " Rating"}{" "}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userInfo?.avatar ?? user.avatar} alt={userInfo?.name ?? user.name} />
                  <AvatarFallback className="rounded-lg">U</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {(userInfo?.name ?? user.name)}
                  </span>
                  <span className="truncate text-xs flex flex-row items-center">
                    <LucideStar className="h-3 w-3 mr-1" />
                    {(rating ?? user.rating.ratingNumber) + " Rating"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/perfil" className="flex items-center gap-2 w-full">
                  <BadgeCheck />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing" className="flex items-center gap-2 w-full">
                  <CreditCard />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="flex items-center gap-2 w-full">
                  <Bell />
                  Notifications
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/messages" className="flex items-center gap-2 w-full">
                  <MessageSquare />
                  Messages
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

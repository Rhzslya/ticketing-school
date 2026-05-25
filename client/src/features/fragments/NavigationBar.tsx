import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navigationMenuTriggerStyle } from "@/components/utils/navigationMenuTriggerStyle";
import { useUserQueries } from "@/hooks/user-queries";
import {
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  UserIcon,
  Home,
  Ticket,
  TicketPlus,
  ListChecks,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { UserService } from "@/service/user-service";
import { UserRole } from "@/enum/user";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { useProfile } = useUserQueries();
  const { data: user, isLoading: isLoadingUser } = useProfile();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleManualLogout = async () => {
    try {
      await UserService.logout();
    } catch {
      // Ignore Error
    }
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const getInitials = (name?: string) => {
    if (!name) return "HD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleMobileNav = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isPrivilegedUser =
    user && [UserRole.ADMIN].includes(user.role as UserRole);

  const renderAuthSection = () => {
    if (isLoadingUser) {
      return (
        <Loader2 className="animate-spin text-white/70 size-5 md:size-6" />
      );
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative p-0 h-8 w-8 md:h-10 md:w-10 rounded-full cursor-pointer bg-white outline-none border-2 border-primary shrink-0 ring-2 ring-transparent transition-all duration-300 transform-gpu antialiased
              hover:ring-primary/40 hover:ring-offset-2 hover:ring-offset-white hover:scale-105 hover:shadow-[0_0_15px_rgba(0,0,0,0.15)]
              data-[state=open]:border-primary data-[state=open]:ring-primary/40 data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-white data-[state=open]:scale-105 data-[state=open]:shadow-[0_0_15px_rgba(0,0,0,0.15)]"
              style={{
                backfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
              }}
            >
              <Avatar className="h-full w-full border-none transition-opacity hover:opacity-80">
                <AvatarFallback className="bg-primary/10 border-none text-primary text-xs md:text-sm font-bold flex items-center justify-center">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-white border border-slate-100 shadow-xl rounded-xl p-1.5"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-bold text-slate-800 leading-none truncate">
                  {user.fullName}
                </p>
                <p className="text-xs leading-none text-slate-500 truncate">
                  {user.email}
                </p>
                <span className="text-[10px] uppercase font-bold text-primary mt-1 w-fit bg-primary/10 px-2 py-0.5 rounded-md">
                  {user.role}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 my-1" />

            {isPrivilegedUser && (
              <DropdownMenuItem
                onClick={() => navigate("/dashboard")}
                className="cursor-pointer text-sm font-medium text-slate-600 py-2.5 focus:bg-slate-800 focus:text-primary transition-colors"
              >
                <LayoutDashboard className="mr-2.5 h-4 w-4 text-primary" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            )}

            {user.role === UserRole.TEACHER && (
              <DropdownMenuItem
                onClick={() => navigate("/tickets/my-tickets")}
                className="cursor-pointer text-sm font-medium text-slate-600 py-2.5 focus:bg-slate-800  focus:text-primary transition-colors"
              >
                <Ticket className="mr-2.5 h-4 w-4 text-emerald-500" />
                <span>My Tickets</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="cursor-pointer text-sm font-medium text-slate-600 py-2.5 focus:bg-slate-800  focus:text-primary transition-colors"
            >
              <UserIcon className="mr-2.5 h-4 w-4 text-slate-400" />
              <span>User Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-100 my-1" />

            <DropdownMenuItem
              onClick={handleManualLogout}
              className="cursor-pointer text-sm font-medium text-red-600 py-2.5 focus:bg-destructive focus:text-red-700 transition-colors"
            >
              <LogOut className="mr-2.5 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="flex gap-1.5 md:gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="cursor-pointer hover:bg-white/10 text-white text-xs md:text-sm px-2 md:px-4"
        >
          <Link to="/login">Login</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="cursor-pointer bg-white text-primary hover:bg-white/90 text-xs md:text-sm px-3 md:px-4 shadow-sm"
        >
          <Link to="/register">Register</Link>
        </Button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-primary shadow-sm">
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between relative">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetDescription className="sr-only"></SheetDescription>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/20 shrink-0 cursor-pointer"
                onClick={(e) => e.currentTarget.blur()}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[80vw] max-w-75 sm:max-w-sm flex flex-col p-0 bg-primary border-r-0"
            >
              <SheetHeader className="p-6 text-left border-b border-white/10 bg-primary">
                <SheetTitle className="text-xl font-bold text-white tracking-tight">
                  Helpdesk
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col py-4 px-3 gap-2 flex-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start w-full cursor-pointer text-blue-50 hover:bg-white/10 hover:text-background",
                    isActive("/") && "bg-white text-primary hover:bg-white/90",
                  )}
                  onClick={() => handleMobileNav("/")}
                >
                  <Home className="mr-3 h-4 w-4" /> Home
                </Button>

                {user && (
                  <>
                    <Button
                      variant="ghost"
                      className={cn(
                        "justify-start w-full cursor-pointer text-blue-50 hover:bg-white/10 hover:text-white",
                        isActive("/tickets/create") &&
                          "bg-white text-primary hover:bg-white/90",
                      )}
                      onClick={() => handleMobileNav("/tickets/create")}
                    >
                      <TicketPlus className="mr-3 h-4 w-4" /> Create Ticket
                    </Button>

                    <Button
                      variant="ghost"
                      className={cn(
                        "justify-start w-full cursor-pointer text-blue-50 hover:bg-white/10 hover:text-white",
                        isActive("/tickets/my-tickets") &&
                          "bg-white text-primary hover:bg-white/90",
                      )}
                      onClick={() => handleMobileNav("/tickets/my-tickets")}
                    >
                      <ListChecks className="mr-3 h-4 w-4" />
                      My Tickets
                    </Button>
                  </>
                )}

                {isPrivilegedUser && (
                  <Button
                    variant="ghost"
                    className={cn(
                      "justify-start w-full cursor-pointer text-blue-50 hover:bg-white/10 hover:text-background",
                      isActive("/dashboard") &&
                        "bg-white text-primary hover:bg-white/90",
                    )}
                    onClick={() => handleMobileNav("/dashboard")}
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4" /> Dashboard
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center">
            <span className="font-extrabold text-lg md:text-xl text-white tracking-tight cursor-pointer whitespace-nowrap">
              Helpdesk
            </span>
          </Link>
        </div>

        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                  active={isActive("/")}
                >
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {user && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                      active={isActive("/tickets/create")}
                    >
                      <Link to="/tickets/create">Create Ticket</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                      active={isActive("/tickets/my-tickets")}
                    >
                      <Link to="/tickets/my-tickets">My Tickets</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}

              {isPrivilegedUser && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                    active={isActive("/dashboard")}
                  >
                    <Link to="/dashboard">Dashboard</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 md:gap-4"
        >
          {renderAuthSection()}
        </motion.div>
      </div>
    </header>
  );
};

export default NavigationBar;

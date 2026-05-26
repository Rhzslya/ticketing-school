import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  ArrowUpDown,
  Check,
  X,
  Menu,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { DashboardHeader } from "@/features/fragments/DashboardHeader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { PaginationComponent } from "@/features/fragments/Pagination";
import { Priority, Status, TicketCategory } from "@/enum/ticket";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { handleApiError } from "@/lib/utils";
import { useTicketQueries } from "@/hooks/ticket-queries";
import { isAxiosError } from "axios";
import { motion, type Variants } from "framer-motion";
import type { SearchTicketRequest } from "@/model/ticket-model";

import { DashboardTicketTable } from "@/features/fragments/DashboardTicketTable";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const DashboardTicketPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const isTrashMode = searchParams.get("is_deleted") === "true";

  // QUERY PARAMS
  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const searchParam = searchParams.get("keyword") || "";
  const statusParam = searchParams.get("status") as Status | undefined;
  const priorityParam = searchParams.get("priority") as Priority | undefined;
  const ticketCategoryParam = searchParams.get("category") as
    | TicketCategory
    | undefined;
  const isDeletedApplied = searchParams.get("is_deleted") === "true";

  const sortByParam =
    (searchParams.get("sortBy") as "createdAt" | "priority" | "status") ||
    "createdAt";
  const sortOrderParam =
    (searchParams.get("sortOrder") as "desc" | "asc") || "desc";

  // STATES (Desktop)
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParam);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string | undefined>(statusParam);
  const [tempPriority, setTempPriority] = useState<string | undefined>(
    priorityParam,
  );
  const [tempTicketCategory, setTempTicketCategory] = useState<
    string | undefined
  >(ticketCategoryParam);

  if (searchParam !== prevSearchParam) {
    setPrevSearchParam(searchParam);
    setSearchTerm(searchParam);
  }

  // STATES (Mobile)
  const [isControlSheetOpen, setIsControlSheetOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(searchParam);
  const [mobileStatus, setMobileStatus] = useState<string | undefined>(
    statusParam,
  );
  const [mobilePriority, setMobilePriority] = useState<string | undefined>(
    priorityParam,
  );
  const [mobileCategory, setMobileCategory] = useState<string | undefined>(
    ticketCategoryParam,
  );
  const [mobileSort, setMobileSort] = useState(
    `${sortByParam}-${sortOrderParam}`,
  );
  const [mobileTrash, setMobileTrash] = useState(isDeletedApplied);

  const ticketQueries = useTicketQueries();

  const queryParams: SearchTicketRequest = {
    page: page,
    size: size,
    sortBy: sortByParam,
    sortOrder: sortOrderParam,
    keyword: searchParam || undefined,
    status: statusParam,
    priority: priorityParam,
    category: ticketCategoryParam,
    is_deleted: isDeletedApplied,
  };

  const { data, isLoading, isError, error, refetch } =
    ticketQueries.useList(queryParams);

  const tickets = data?.data || [];
  const totalPage = data?.paging?.total_page || 0;
  const isSearching = !!searchParam;

  useEffect(() => {
    if (isError) {
      handleApiError(error, "Gagal memuat data tiket");
    }
  }, [isError, error]);

  // --- HANDLERS (Desktop) ---
  const handleSearch = () => {
    setSearchParams((prev) => {
      if (searchTerm) prev.set("keyword", searchTerm);
      else prev.delete("keyword");
      prev.set("page", "1");
      return prev;
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    if (searchParam) {
      setSearchParams((prev) => {
        prev.delete("keyword");
        prev.set("page", "1");
        return prev;
      });
    }
  };

  const applyFilters = () => {
    setSearchParams((prev) => {
      if (tempStatus && tempStatus !== "ALL") prev.set("status", tempStatus);
      else prev.delete("status");

      if (tempPriority && tempPriority !== "ALL")
        prev.set("priority", tempPriority);
      else prev.delete("priority");

      if (tempTicketCategory && tempTicketCategory !== "ALL")
        prev.set("category", tempTicketCategory);
      else prev.delete("category");

      prev.set("page", "1");
      return prev;
    });
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setSearchParams((prev) => {
      prev.delete("status");
      prev.delete("priority");
      prev.delete("category");
      prev.set("page", "1");
      return prev;
    });
    setTempStatus(undefined);
    setTempPriority(undefined);
    setTempTicketCategory(undefined);
    setIsFilterOpen(false);
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    setSearchParams((prev) => {
      prev.set("sortBy", sortBy);
      prev.set("sortOrder", sortOrder);
      return prev;
    });
  };

  const toggleTrashMode = () => {
    setSearchParams((prev) => {
      if (isTrashMode) prev.delete("is_deleted");
      else prev.set("is_deleted", "true");

      prev.set("page", "1");
      return prev;
    });
    setSearchTerm("");
    setMobileTrash(!isTrashMode);
  };

  // --- HANDLERS (Mobile) ---
  const applyMobileSettings = () => {
    setSearchParams((prev) => {
      if (mobileSearch) prev.set("keyword", mobileSearch);
      else prev.delete("keyword");

      if (mobileStatus && mobileStatus !== "ALL")
        prev.set("status", mobileStatus);
      else prev.delete("status");

      if (mobilePriority && mobilePriority !== "ALL")
        prev.set("priority", mobilePriority);
      else prev.delete("priority");

      if (mobileCategory && mobileCategory !== "ALL")
        prev.set("category", mobileCategory);
      else prev.delete("category");

      if (mobileTrash) prev.set("is_deleted", "true");
      else prev.delete("is_deleted");

      const [sortBy, sortOrder] = mobileSort.split("-");
      if (sortBy && sortOrder) {
        prev.set("sortBy", sortBy);
        prev.set("sortOrder", sortOrder);
      }

      prev.set("page", "1");
      return prev;
    });
    setIsControlSheetOpen(false);
  };

  const clearMobileSettings = () => {
    setSearchParams((prev) => {
      prev.delete("keyword");
      prev.delete("status");
      prev.delete("priority");
      prev.delete("category");
      prev.delete("is_deleted");
      prev.set("sortBy", "createdAt");
      prev.set("sortOrder", "desc");
      prev.set("page", "1");
      return prev;
    });
    setIsControlSheetOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(newPage));
      return prev;
    });
  };

  // --- HELPERS ---
  const activeFiltersCount = [
    statusParam,
    priorityParam,
    ticketCategoryParam,
  ].filter(Boolean).length;
  const isFiltering = activeFiltersCount > 0;
  const isDatabaseEmpty = tickets.length === 0 && !isFiltering && !isSearching;

  const isSortActive = (by: string, order: string) =>
    sortByParam === by && sortOrderParam === order;

  const normalize = (val: string | undefined | null | boolean) => {
    if (!val || val === "ALL") return "";
    return String(val);
  };

  const hasChanges =
    normalize(tempStatus) !== normalize(statusParam) ||
    normalize(tempPriority) !== normalize(priorityParam) ||
    normalize(tempTicketCategory) !== normalize(ticketCategoryParam);

  const hasMobileChanges =
    normalize(mobileSearch) !== normalize(searchParam) ||
    normalize(mobileStatus) !== normalize(statusParam) ||
    normalize(mobilePriority) !== normalize(priorityParam) ||
    normalize(mobileCategory) !== normalize(ticketCategoryParam) ||
    mobileTrash !== isDeletedApplied ||
    mobileSort !== `${sortByParam}-${sortOrderParam}`;

  const activeMobileFiltersCount = [
    searchParam,
    statusParam,
    priorityParam,
    ticketCategoryParam,
    isDeletedApplied,
    sortByParam !== "createdAt" || sortOrderParam !== "desc",
  ].filter(Boolean).length;

  if (isError && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 px-4 text-center">
        <p className="text-destructive font-medium text-lg">
          Gagal memuat data tiket
        </p>
        <p className="text-sm text-muted-foreground">
          {isAxiosError(error) ? error.message : "Terjadi kesalahan sistem"}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col h-full space-y-4 sm:space-y-6 w-full min-w-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <DashboardHeader title="IT Ticket Management">
          {/* DESKTOP CONTROLS (Hidden on Mobile)                       */}
          <div className="hidden lg:flex flex-wrap items-center gap-2 xl:gap-3 w-full justify-end mb-2">
            <div className="relative w-40 xl:w-64 shrink-0 transition-all duration-300">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Keyword"
                className="pl-8 pr-8 bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-2 h-9 [&::-webkit-search-cancel-button]:appearance-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onBlur={handleSearch}
                disabled={isLoading || isDatabaseEmpty}
              />
              {searchTerm && (
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleClearSearch();
                  }}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 cursor-pointer shadow-sm bg-[#e74c3c] hover:bg-[#c0392b]"
                  disabled={tickets.length === 0}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span className="text-sm">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-foreground">
                <div className="p-2 text-xs font-semibold text-muted">
                  Date Created
                </div>
                <DropdownMenuItem
                  onClick={() => handleSortChange("createdAt", "desc")}
                  className="cursor-pointer text-muted"
                >
                  Newest{" "}
                  {isSortActive("createdAt", "desc") && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSortChange("createdAt", "asc")}
                  className="cursor-pointer text-muted"
                >
                  Oldest{" "}
                  {isSortActive("createdAt", "asc") && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2 text-xs font-semibold text-muted">
                  Priority
                </div>
                <DropdownMenuItem
                  onClick={() => handleSortChange("priority", "asc")}
                  className="cursor-pointer text-muted"
                >
                  High to Low{" "}
                  {isSortActive("priority", "asc") && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSortChange("priority", "desc")}
                  className="cursor-pointer text-muted"
                >
                  Low to High{" "}
                  {isSortActive("priority", "desc") && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover
              open={isFilterOpen}
              onOpenChange={(open) => {
                setIsFilterOpen(open);
                if (open) {
                  setTempStatus(statusParam);
                  setTempPriority(priorityParam);
                  setTempTicketCategory(ticketCategoryParam);
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 cursor-pointer shadow-sm bg-[#5191d1] hover:bg-[#3d7bbc]"
                  disabled={isDatabaseEmpty}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span className="text-sm">Filter</span>
                  {activeFiltersCount > 0 && (
                    <span className="ml-0.5 rounded-sm bg-green-500 px-1.5 py-0.5 font-bold text-foreground text-[10px]">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-sm">Filter Tickets</h4>
                    <p className="text-xs text-muted">
                      Filter data by category and status.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label className="text-xs">Status</Label>
                      <div className="col-span-2">
                        <Select
                          value={tempStatus || "ALL"}
                          onValueChange={setTempStatus}
                        >
                          <SelectTrigger className="h-9 text-sm cursor-pointer">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            {Object.values(Status).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label className="text-xs">Priority</Label>
                      <div className="col-span-2">
                        <Select
                          value={tempPriority || "ALL"}
                          onValueChange={setTempPriority}
                        >
                          <SelectTrigger className="h-9 text-sm cursor-pointer">
                            <SelectValue placeholder="All Priorities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Priorities</SelectItem>
                            {Object.values(Priority).map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label className="text-xs">Category</Label>
                      <div className="col-span-2">
                        <Select
                          value={tempTicketCategory || "ALL"}
                          onValueChange={setTempTicketCategory}
                        >
                          <SelectTrigger className="h-9 text-sm cursor-pointer">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Categories</SelectItem>
                            {Object.values(TicketCategory).map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t mt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={applyFilters}
                      className="flex-1 text-xs h-9 cursor-pointer"
                      disabled={!hasChanges}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="flex-1 text-xs h-9 text-destructive cursor-pointer hover:bg-destructive hover:text-white"
                      disabled={activeFiltersCount === 0}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {!isTrashMode && (
              <Link to="/tickets/create">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 cursor-pointer shadow-sm text-foreground duration-300 bg-[#f1c40f] hover:bg-[#f39c12]"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="text-sm">Add New Ticket</span>
                </Button>
              </Link>
            )}

            <Button
              variant={isTrashMode ? "destructive" : "outline"}
              size="sm"
              className="h-9 gap-1.5 w-auto px-3 shrink-0 cursor-pointer shadow-sm transition-colors"
              onClick={toggleTrashMode}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="text-sm">{isTrashMode ? "Exit" : "Trash"}</span>
            </Button>
          </div>

          <div className="flex lg:hidden items-center gap-2 ml-auto">
            {!isTrashMode && (
              <Link to="/tickets/create">
                <Button
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full shadow-sm cursor-pointer text-foreground duration-300"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Add New Ticket</span>
                </Button>
              </Link>
            )}

            <Sheet
              open={isControlSheetOpen}
              onOpenChange={(open) => {
                setIsControlSheetOpen(open);
                if (open) {
                  setMobileSearch(searchParam);
                  setMobileStatus(statusParam);
                  setMobilePriority(priorityParam);
                  setMobileCategory(ticketCategoryParam);
                  setMobileSort(`${sortByParam}-${sortOrderParam}`);
                  setMobileTrash(isDeletedApplied);
                }
              }}
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 shadow-sm cursor-pointer relative pr-3 bg-foreground text-muted"
                  disabled={isDatabaseEmpty && !isFiltering}
                >
                  <Menu className="h-4 w-4" />
                  <span className="text-xs font-medium">Options & Filters</span>
                  {activeMobileFiltersCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[9px] font-bold text-foreground shadow-sm">
                      {activeMobileFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[85vw] sm:max-w-md flex flex-col p-0 bg-white"
              >
                <SheetHeader className="p-4 sm:p-6 border-b border-border/50 text-left bg-primary">
                  <SheetTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    Ticket Filters
                  </SheetTitle>
                  <SheetDescription className="sr-only" />
                </SheetHeader>

                <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
                  {/* MOBILE SEARCH */}

                  <div className="space-y-2.5">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search Keyword"
                        className="pl-8 pr-8 bg-muted/20 h-9 text-xs sm:text-sm focus-visible:ring-primary focus-visible:ring-1 [&::-webkit-search-cancel-button]:appearance-none text-muted"
                        value={mobileSearch}
                        onChange={(e) => setMobileSearch(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && applyMobileSettings()
                        }
                      />
                      {mobileSearch && (
                        <button
                          onClick={() => setMobileSearch("")}
                          className="absolute right-2.5 top-2.5 text-muted-foreground cursor-pointer hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* MOBILE SORT */}
                  <div className="space-y-2.5">
                    <Label className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-widest">
                      Sort
                    </Label>
                    <Select value={mobileSort} onValueChange={setMobileSort}>
                      <SelectTrigger className="h-9 text-xs sm:text-sm bg-muted/20 hover:bg-primary hover:text-foreground">
                        <SelectValue placeholder="Select sorting" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt-desc">Newest</SelectItem>
                        <SelectItem value="createdAt-asc">Oldest</SelectItem>
                        <SelectItem value="priority-asc">
                          Priority: High to Low
                        </SelectItem>
                        <SelectItem value="priority-desc">
                          Priority: Low to High
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* MOBILE FILTER STATUS */}
                  <div className="space-y-2.5">
                    <Label className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-widest">
                      Status
                    </Label>
                    <Select
                      value={mobileStatus || "ALL"}
                      onValueChange={setMobileStatus}
                    >
                      <SelectTrigger className="h-9 text-xs sm:text-sm bg-muted/20 hover:bg-primary hover:text-foreground">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        {Object.values(Status).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* MOBILE FILTER PRIORITY */}
                  <div className="space-y-2.5">
                    <Label className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-widest">
                      Priority
                    </Label>
                    <Select
                      value={mobilePriority || "ALL"}
                      onValueChange={setMobilePriority}
                    >
                      <SelectTrigger className="h-9 text-xs sm:text-sm bg-muted/20 hover:bg-primary hover:text-foreground">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Priorities</SelectItem>
                        {Object.values(Priority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* MOBILE FILTER CATEGORY */}
                  <div className="space-y-2.5">
                    <Label className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-widest">
                      Category
                    </Label>
                    <Select
                      value={mobileCategory || "ALL"}
                      onValueChange={setMobileCategory}
                    >
                      <SelectTrigger className="h-9 text-xs sm:text-sm bg-muted/20 hover:bg-primary hover:text-foreground">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Categories</SelectItem>
                        {Object.values(TicketCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* --- MOBILE TOGGLES (TRASH) --- */}
                  <div className="space-y-2.5 pt-2 border-t border-border/50">
                    <Label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Preferences
                    </Label>
                    <div className="flex items-start space-x-3 border p-3.5 rounded-lg border-destructive/20 bg-destructive/5">
                      <Checkbox
                        id="mobile-trash"
                        checked={mobileTrash}
                        onCheckedChange={(checked) =>
                          setMobileTrash(checked === true)
                        }
                        className="size-4 sm:size-5 mt-0.5 border-destructive/50 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive data-[state=checked]:text-white"
                      />
                      <div className="grid gap-1">
                        <Label
                          htmlFor="mobile-trash"
                          className="text-xs sm:text-sm font-medium leading-none text-destructive cursor-pointer"
                        >
                          Trash
                        </Label>
                        <p className="text-[10px] text-destructive/70 leading-tight">
                          Show deleted reports
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <SheetFooter className="p-4 sm:p-6 border-t border-border/50 bg-white mt-auto grid grid-cols-2 gap-3">
                  <Button
                    variant="ghost"
                    className="w-full h-9 text-xs sm:text-sm text-destructive  hover:bg-destructive hover:text-white cursor-pointer"
                    onClick={clearMobileSettings}
                    disabled={activeFiltersCount === 0}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full h-9 text-xs sm:text-sm cursor-pointer"
                    onClick={applyMobileSettings}
                    disabled={!hasMobileChanges}
                  >
                    Apply
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </DashboardHeader>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex-1 overflow-auto rounded-lg border shadow-sm bg-white"
      >
        <DashboardTicketTable
          tickets={tickets}
          isLoading={isLoading}
          onSuccess={() => refetch()}
          isTrashView={isDeletedApplied}
        />
      </motion.div>

      {totalPage > 1 && (
        <motion.div variants={itemVariants}>
          <PaginationComponent
            currentPage={page}
            totalPages={totalPage}
            onPageChange={handlePageChange}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardTicketPage;

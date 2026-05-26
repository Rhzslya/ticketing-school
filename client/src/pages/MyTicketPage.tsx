import { useEffect, useState } from "react";
import type { SearchTicketRequest, TicketResponse } from "@/model/ticket-model";
import { Priority, Status, TicketCategory } from "@/enum/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams } from "react-router-dom";
import {
  Loader2,
  Search,
  AlertCircle,
  Plus,
  Ticket as TicketIcon,
  ArrowLeft,
  Clock,
  X,
  Filter,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { enUS as localeEn } from "date-fns/locale";
import { useTicketQueries } from "@/hooks/ticket-queries";
import { Badge } from "@/components/ui/badge";
import { PaginationComponent } from "@/features/fragments/Pagination";
import { handleApiError } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUserQueries } from "@/hooks/user-queries";
import {
  getCategoryTheme,
  getPriorityStyle,
  getStatusStyle,
} from "@/utils/get-style";

export const MyTicketPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { useProfile } = useUserQueries();
  const { data: user } = useProfile();

  // --- QUERY PARAMS ---
  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const searchParam = searchParams.get("keyword") || "";
  const statusParam = searchParams.get("status") as Status | undefined;
  const priorityParam = searchParams.get("priority") as Priority | undefined;
  const ticketCategoryParam = searchParams.get("category") as
    | TicketCategory
    | undefined;
  const sortByParam =
    (searchParams.get("sortBy") as "createdAt" | "priority" | "status") ||
    "createdAt";
  const sortOrderParam =
    (searchParams.get("sortOrder") as "desc" | "asc") || "desc";

  // --- STATES (Desktop) ---
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string | undefined>(statusParam);
  const [tempPriority, setTempPriority] = useState<string | undefined>(
    priorityParam,
  );
  const [tempTicketCategory, setTempTicketCategory] = useState<
    string | undefined
  >(ticketCategoryParam);

  const queryParams: SearchTicketRequest = {
    page: page,
    size: size,
    sortBy: sortByParam,
    sortOrder: sortOrderParam,
    keyword: searchParam || undefined,
    status: statusParam,
    priority: priorityParam,
    category: ticketCategoryParam,
    submitterId: user?.id,
  };

  const { useList } = useTicketQueries();
  const { data: response, isLoading, isError, error } = useList(queryParams);

  const tickets = response?.data || [];
  const totalPage = response?.paging?.total_page || 0;
  const isSearching = !!searchParam;

  const currentPage = response?.paging?.current_page || 1;

  useEffect(() => {
    if (isError) {
      handleApiError(error, "Failed to load ticket data");
    }
  }, [isError, error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchTerm(searchParam);
  }, [searchParam]);

  useEffect(() => {
    if (isFilterOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTempStatus(statusParam);
      setTempPriority(priorityParam);
      setTempTicketCategory(ticketCategoryParam);
    }
  }, [isFilterOpen, statusParam, priorityParam, ticketCategoryParam]);

  const handleSearch = () => {
    setSearchParams((prev) => {
      if (searchTerm.trim()) prev.set("keyword", searchTerm);
      else prev.delete("keyword");
      prev.set("page", "1");
      return prev;
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchParams((prev) => {
      prev.delete("keyword");
      prev.set("page", "1");
      return prev;
    });
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

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col lg:flex-row">
      <div className="lg:w-1/3 xl:w-[30%] bg-primary text-white p-6 sm:p-10 lg:min-h-screen lg:sticky lg:top-0 flex flex-col relative overflow-hidden shadow-2xl z-20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black opacity-10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full">
          <Link to="/" className="mb-10 inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-100 hover:text-white hover:bg-white/10 rounded-full px-4 border border-blue-100/20 cursor-pointer"
            >
              <ArrowLeft className="mr-2 size-4" /> Home
            </Button>
          </Link>

          <h1 className="text-3xl lg:text-4xl font-light text-white mb-3 tracking-wide">
            Your Tickets
          </h1>
          <p className="text-blue-100/80 text-sm mb-10 leading-relaxed">
            Find and monitor the status of issue reports you have submitted to
            the technical team in real-time.
          </p>

          <div className="space-y-4 mb-auto">
            <div className="relative transition-all duration-300">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-200" />
              <Input
                type="search"
                placeholder="Search ID / Title..."
                className="pl-10 pr-10 bg-white/10 border-white/10 text-white placeholder:text-blue-200/70 focus-visible:ring-white/50 h-12 rounded-xl backdrop-blur-sm [&::-webkit-search-cancel-button]:appearance-none"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/10 text-white hover:bg-white/20 hover:text-white h-11 rounded-xl shadow-sm cursor-pointer"
                  >
                    <ArrowUpDown className="mr-2 size-4 opacity-70" />
                    <span className="text-sm font-medium">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-48 bg-white border-slate-100"
                >
                  <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </div>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("createdAt", "desc")}
                    className="cursor-pointer text-slate-700"
                  >
                    NEWEST
                    {isSortActive("createdAt", "desc") && (
                      <Check className="ml-auto size-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("createdAt", "asc")}
                    className="cursor-pointer text-slate-700"
                  >
                    OLDEST
                    {isSortActive("createdAt", "asc") && (
                      <Check className="ml-auto size-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Priority
                  </div>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("priority", "asc")}
                    className="cursor-pointer text-slate-700"
                  >
                    HIGH
                    {isSortActive("priority", "asc") && (
                      <Check className="ml-auto size-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("priority", "desc")}
                    className="cursor-pointer text-slate-700"
                  >
                    LOW
                    {isSortActive("priority", "desc") && (
                      <Check className="ml-auto size-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/10 text-white hover:bg-white/20 hover:text-white h-11 rounded-xl relative shadow-sm cursor-pointer"
                    disabled={isDatabaseEmpty}
                  >
                    <Filter className="mr-2 size-4 opacity-70" />
                    <span className="text-sm font-medium">Filter</span>
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#f1c40f] text-[10px] font-bold text-slate-900 shadow-sm">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-5 bg-white border-slate-100 shadow-xl rounded-2xl"
                  align="start"
                >
                  <div className="grid gap-5">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-slate-800">
                        Filter Tickets
                      </h4>
                      <p className="text-xs text-slate-500">
                        Filter the list by status and category.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Status
                        </Label>
                        <Select
                          value={tempStatus || "ALL"}
                          onValueChange={setTempStatus}
                        >
                          <SelectTrigger className="h-10 text-sm cursor-pointer bg-slate-50 border-slate-200 focus:ring-primary/20">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            {Object.values(Status).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Priority
                        </Label>
                        <Select
                          value={tempPriority || "ALL"}
                          onValueChange={setTempPriority}
                        >
                          <SelectTrigger className="h-10 text-sm cursor-pointer bg-slate-50 border-slate-200 focus:ring-primary/20">
                            <SelectValue placeholder="All Priorities" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="ALL">All Priorities</SelectItem>
                            {Object.values(Priority).map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Category
                        </Label>
                        <Select
                          value={tempTicketCategory || "ALL"}
                          onValueChange={setTempTicketCategory}
                        >
                          <SelectTrigger className="h-10 text-sm cursor-pointer bg-slate-50 border-slate-200 focus:ring-primary/20">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
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

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="flex-1 text-sm h-10 border-slate-200 text-foreground hover:bg-muted hover:text-foreground/70 cursor-pointer"
                        disabled={activeFiltersCount === 0}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        onClick={applyFilters}
                        className="flex-1 text-sm h-10 bg-primary hover:bg-primary/90 text-white shadow-md cursor-pointer"
                        disabled={!hasChanges}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Link to="/tickets/create" className="block mt-4">
              <Button className="w-full h-12 bg-[#f1c40f] hover:bg-[#f39c12] text-slate-900 font-bold shadow-lg shadow-black/10 rounded-xl transition-transform hover:scale-[1.02] cursor-pointer">
                <Plus className="mr-2 size-5" /> Create New Ticket
              </Button>
            </Link>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 hidden lg:block">
            <div className="flex items-center gap-3 text-blue-200/60">
              <TicketIcon className="size-8" strokeWidth={1} />
              <span className="text-xs uppercase tracking-widest font-semibold">
                IT Ticketing System
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-2/3 xl:w-[70%] p-6 sm:p-10 lg:p-12 relative z-10 flex flex-col">
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Ticket List</h2>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4 flex-1">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-slate-500 font-medium">Loading ticket data...</p>
          </div>
        ) : isError ? (
          <div className="py-32 text-center bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle className="size-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">
              Failed to Load Data
            </h3>
            <p className="text-red-500/80">
              An error occurred. Please refresh the page.
            </p>
          </div>
        ) : tickets.length > 0 ? (
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {tickets.map((ticket: TicketResponse) => {
                const catTheme = getCategoryTheme(ticket.category);
                return (
                  <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full hover:-translate-y-1 relative overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${catTheme.bg.replace("/10", "")} opacity-70`}
                      ></div>

                      <div className="flex items-start justify-between gap-2 mb-4 pt-1">
                        <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-50 rounded-md border border-slate-100 h-fit">
                          {ticket.id}
                        </span>

                        <div className="flex gap-1.5 items-center flex-wrap justify-end">
                          <Badge
                            variant="outline"
                            className={`text-[9px] uppercase tracking-wider font-bold ${getStatusStyle(ticket.status)} border-transparent`}
                          >
                            {ticket.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[9px] uppercase tracking-wider font-bold ${getPriorityStyle(ticket.priority)} border-transparent`}
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>

                      <h3 className="text-base font-semibold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 mb-5 flex-1 leading-snug">
                        {ticket.title}
                      </h3>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                        <div
                          className={`flex items-center gap-1.5 ${catTheme.text} font-semibold text-xs`}
                        >
                          <TicketIcon className="size-3.5" />
                          <span>{ticket.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Clock className="size-3.5" />
                          {ticket.createdAt &&
                            format(new Date(ticket.createdAt), "dd MMM yy", {
                              locale: localeEn,
                            })}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPage > 1 && (
              <div className="mt-auto pt-10">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center text-center bg-white rounded-3xl border border-slate-200/60 shadow-sm flex-1 justify-center">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <Search className="size-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Tickets Found
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
              {searchTerm || isFiltering
                ? "No tickets match your filters or keywords."
                : "You haven't created any tickets yet. Your history will appear here."}
            </p>
            {searchTerm || isFiltering ? (
              <Button
                variant="outline"
                onClick={() => {
                  handleClearSearch();
                  clearFilters();
                }}
                className="min-w-1/8 border-muted text-foreground hover:bg-muted hover:text-foreground/70 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Clear Search & Filters
              </Button>
            ) : (
              <Link to="/tickets/create">
                <Button
                  variant="secondary"
                  className="cursor-pointer hover:text-white hover:bg-primary transition-colors"
                >
                  Create a Ticket Now
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

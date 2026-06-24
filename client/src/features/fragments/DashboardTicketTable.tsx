import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { enUS as localeEn } from "date-fns/locale";
import { motion, type Variants } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Status } from "@/enum/ticket";
import type { TicketResponse } from "@/model/ticket-model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  ArchiveRestore,
} from "lucide-react";
import { useTicketQueries } from "@/hooks/ticket-queries";
import NotFoundPage from "@/pages/NotFoundPage";
import { TruncatedTooltip } from "@/components/utils/truncatedTooltip";
import { getPriorityStyle, getStatusStyle } from "@/utils/get-style";

const tableRowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

interface DashboardTicketTableProps {
  tickets: TicketResponse[];
  isLoading: boolean;
  onSuccess?: () => void;
  isTrashView?: boolean;
}

export function DashboardTicketTable({
  tickets,
  isLoading,
  onSuccess,
  isTrashView,
}: DashboardTicketTableProps) {
  const navigate = useNavigate();
  const { deleteMutation, restoreMutation } = useTicketQueries();
  const { mutateAsync: deleteTicket } = deleteMutation;

  const isDeleting = deleteMutation.isPending;
  const isRestoring = restoreMutation.isPending;

  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  // --- HANDLERS ---
  const handleViewDetail = (ticket: TicketResponse) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleEditTicket = (ticket: TicketResponse) => {
    navigate(`/tickets/${ticket.id}/edit`);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTicket) return;
    try {
      await deleteTicket({ id: selectedTicket.id });
      setIsDeleteDialogOpen(false);
      if (onSuccess) onSuccess();
    } catch {
      // Error handled by mutation
    }
  };

  const handleRestoreConfirm = async () => {
    if (!selectedTicket) return;
    try {
      await restoreMutation.mutateAsync({ id: selectedTicket.id });
      setIsRestoreDialogOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-slate-500 font-medium">
          Loading table data...
        </p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full"
      >
        <NotFoundPage
          variant="minimal"
          isDashboard={true}
          entityName="Ticket"
          onGoBack={() => window.location.reload()}
        />
      </motion.div>
    );
  }

  return (
    <>
      <TooltipProvider>
        <div
          className="rounded-md bg-white shadow-sm w-full overflow-x-auto pb-2 sm:pb-0
            [&::-webkit-scrollbar]:h-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-primary/20 
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-primary
            transition-colors"
        >
          <Table className="min-w-225 w-full text-sm table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50 border-b-muted">
                <TableHead className="w-[10%] font-bold border-r border-border/60 text-center">
                  ID
                </TableHead>
                <TableHead className="w-[25%] font-bold">
                  Report Details
                </TableHead>
                <TableHead className="w-[15%] font-bold">Reporter</TableHead>
                <TableHead className="w-[15%] font-bold">Category</TableHead>
                <TableHead className="w-[10%] font-bold text-center">
                  Priority
                </TableHead>
                <TableHead className="w-[10%] font-bold text-center">
                  Status
                </TableHead>
                <TableHead className="w-[10%] font-bold">Date</TableHead>
                <TableHead className="w-[5%] text-right pr-6 font-bold">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket, index) => (
                <motion.tr
                  key={ticket.id}
                  className="border-b border-border transition-colors hover:bg-slate-50/80 h-14 sm:h-17"
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.03 }}
                >
                  <TableCell className="border-r border-border/60 text-center font-mono font-medium py-3 sm:py-4">
                    <TruncatedTooltip
                      text={ticket.id}
                      className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md"
                    />
                  </TableCell>

                  <TableCell className="py-3 sm:py-4">
                    <div className="flex flex-col gap-0.5 pr-2">
                      <TruncatedTooltip
                        text={ticket.title}
                        className="font-semibold text-background text-sm max-w-62.5"
                      />

                      <TruncatedTooltip
                        text={ticket.description}
                        className="text-xs text-muted truncate max-w-62.5"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-30">
                          {ticket.submitter?.fullName || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 sm:py-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <span className="truncate max-w-25">
                        {ticket.category}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 sm:py-4 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase tracking-wider font-bold ${getPriorityStyle(ticket.priority)} border-transparent px-2.5 py-0.5`}
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 sm:py-4 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase tracking-wider font-bold ${getStatusStyle(ticket.status)} border-transparent px-2.5 py-0.5`}
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 sm:py-4">
                    <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                      <span className="font-medium">
                        {format(new Date(ticket.createdAt), "dd MMM yyyy", {
                          locale: localeEn,
                        })}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right pr-6 py-3 sm:py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="size-8 p-0 rounded-full hover:bg-slate-200"
                        >
                          <MoreHorizontal className="size-4 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 rounded-xl shadow-xl border border-slate-100 p-1.5 bg-white"
                      >
                        {isTrashView ? (
                          <>
                            <DropdownMenuSeparator className="bg-slate-100 my-1" />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setIsRestoreDialogOpen(true);
                              }}
                              className="cursor-pointer text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 py-2.5"
                            >
                              <ArchiveRestore className="size-3.5 mr-2" />{" "}
                              Restore Ticket
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleViewDetail(ticket)}
                              className="cursor-pointer text-xs font-semibold text-slate-600 py-2.5 hover:bg-slate-50"
                            >
                              <Eye className="size-3.5 mr-2 text-primary" />{" "}
                              View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleEditTicket(ticket)}
                              className="cursor-pointer text-xs font-semibold text-slate-600 py-2.5 hover:bg-slate-50 data-disabled:opacity-50"
                              disabled={
                                ticket.status === Status.DONE ||
                                ticket.status === Status.REJECTED
                              }
                            >
                              <Edit2 className="size-3.5 mr-2 text-[#f1c40f]" />{" "}
                              Edit Ticket
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-slate-100 my-1" />

                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 py-2.5"
                            >
                              <Trash2 className="size-3.5 mr-2" /> Delete Ticket
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Issue Report?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ticket{" "}
              <span className="font-mono font-bold text-background">
                {selectedTicket?.id}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant="ghost"
              disabled={isDeleting}
              className="text-destructive"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              variant="outline"
              className="bg-destructive"
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="size-4 mr-2" />
              )}
              Yes, Delete Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-success">
              Restore Issue Report?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore ticket{" "}
              <span className="font-mono font-bold text-background">
                {selectedTicket?.id}
              </span>
              ? It will be moved back to the active tickets list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant="ghost"
              disabled={isRestoring}
              className="text-muted-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                handleRestoreConfirm();
              }}
              disabled={isRestoring}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isRestoring ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ArchiveRestore className="size-4 mr-2" />
              )}
              Yes, Restore Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

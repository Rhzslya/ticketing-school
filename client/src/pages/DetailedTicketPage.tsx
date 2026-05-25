import { useParams, useNavigate, Link } from "react-router-dom";
import { useTicketQueries } from "@/hooks/ticket-queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  User,
  Paperclip,
  CalendarDays,
  FileText,
  Activity,
  Ticket as TicketIcon,
  Edit2,
  Trash2,
  Home,
} from "lucide-react";
import { format } from "date-fns";
import { enUS as localeEn } from "date-fns/locale";
import { Priority, Status, TicketCategory } from "@/enum/ticket";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DetailedTicketPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { useDetail, deleteMutation } = useTicketQueries();
  const { data: ticket, isLoading, isError, error } = useDetail({ id: id! });
  const { mutateAsync: deleteTicket, isPending: isDeleting } = deleteMutation;

  const handleDelete = async () => {
    try {
      await deleteTicket({ id: ticket!.id });
      navigate("/tickets/my-tickets");
    } catch {
      //Ignore Error
    }
  };

  const getStatusStyle = (status?: Status) => {
    switch (status) {
      case Status.SUBMITTED:
        return "bg-slate-50 text-slate-600 border-slate-200";
      case Status.ONGOING:
        return "bg-blue-50 text-blue-600 border-blue-200";
      case Status.DONE:
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case Status.REJECTED:
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getPriorityStyle = (priority?: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return "text-red-600 bg-red-50 border-red-100";
      case Priority.MEDIUM:
        return "text-orange-600 bg-orange-50 border-orange-100";
      case Priority.LOW:
        return "text-teal-600 bg-teal-50 border-teal-100";
      default:
        return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const getCategoryLabel = (category?: TicketCategory) => {
    switch (category) {
      case TicketCategory.NETWORK:
        return "Network & Internet";
      case TicketCategory.HARDWARE:
        return "Hardware";
      case TicketCategory.SOFTWARE:
        return "Software";
      case TicketCategory.ELECTRICAL:
        return "Electrical";
      case TicketCategory.FACILITIES:
        return "Facilities";
      case TicketCategory.OTHERS:
        return "Others";
      default:
        return category;
    }
  };

  const getCategoryTheme = (category?: string) => {
    switch (category) {
      case "NETWORK":
        return { text: "text-[#2ecc71]", bg: "bg-[#2ecc71]/10" };
      case "HARDWARE":
        return { text: "text-[#3498db]", bg: "bg-[#3498db]/10" };
      case "SOFTWARE":
        return { text: "text-[#9b59b6]", bg: "bg-[#9b59b6]/10" };
      case "ELECTRICAL":
        return { text: "text-[#f1c40f]", bg: "bg-[#f1c40f]/10" };
      case "FACILITIES":
        return { text: "text-[#e67e22]", bg: "bg-[#e67e22]/10" };
      default:
        return { text: "text-[#e74c3c]", bg: "bg-[#e74c3c]/10" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading ticket details...</p>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm max-w-md w-full">
          <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Failed to Load Ticket
          </h3>
          <p className="text-slate-500 mb-6">
            {error?.message ||
              "The ticket you are looking for was not found or a system error occurred."}
          </p>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col lg:flex-row">
      {/* LEFT SIDE PANEL */}
      <div className="lg:w-1/3 xl:w-[30%] bg-primary text-white p-6 sm:p-10 lg:min-h-screen lg:sticky lg:top-0 flex flex-col relative overflow-hidden shadow-2xl z-20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black opacity-10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-center w-full mb-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-blue-100 hover:text-white hover:bg-white/10 rounded-full px-4 border border-blue-100/20 w-fit cursor-pointer transition-colors"
            >
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-blue-100 hover:text-white hover:bg-white/10 rounded-full px-4 border border-blue-100/20 w-fit cursor-pointer transition-colors"
            >
              <Home className="mr-2 size-4" /> Home
            </Button>
          </div>

          <h1 className="text-3xl lg:text-4xl font-light text-white mb-3 tracking-wide">
            Report Details
          </h1>
          <p className="text-blue-100/80 text-sm mb-8 leading-relaxed">
            View complete details of the issue report.
          </p>

          <div className="bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div>
              <p className="text-blue-200/70 text-xs font-semibold uppercase tracking-wider mb-1">
                Ticket ID
              </p>
              <p className="text-lg font-mono font-bold text-white">
                {ticket.id}
              </p>
            </div>
            <div className="pt-3 border-t border-white/10">
              <p className="text-blue-200/70 text-xs font-semibold uppercase tracking-wider mb-2">
                Reported By
              </p>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {ticket.submitter
                      ? ticket.submitter.fullName
                      : "Unknown User"}
                  </p>
                  <p className="text-xs text-blue-100/70">
                    @{ticket.submitter?.username || "unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL */}
      <div className="lg:w-2/3 xl:w-[70%] p-6 sm:p-10 lg:p-12 relative z-10">
        <div className="max-w-4xl space-y-6">
          <div className="bg-white border-b border-slate-200/60 sticky top-0 z-30 mb-6 rounded-t-3xl sm:rounded-none sm:bg-transparent sm:border-none sm:static">
            <div className="flex items-center justify-end py-3 sm:py-0">
              <div className="flex items-center gap-3">
                {ticket.status === Status.SUBMITTED && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="font-semibold shadow-sm cursor-pointer rounded-lg transition-transform hover:scale-105"
                      >
                        <Trash2 className="size-3.5 sm:mr-2" />
                        <span className="hidden sm:inline">Delete Ticket</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white rounded-2xl border-slate-100 shadow-xl max-w-sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-800">
                          Delete Issue Report?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500">
                          Are you sure you want to delete ticket report{" "}
                          <span className="font-mono font-bold text-slate-700">
                            {ticket.id}
                          </span>
                          ? This action will move the ticket to the trash and
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel disabled={isDeleting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                          }}
                          disabled={isDeleting}
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
                )}

                {ticket.status !== Status.DONE &&
                  ticket.status !== Status.REJECTED &&
                  ticket.status !== Status.ONGOING && (
                    <Link to={`/tickets/${ticket.id}/edit`}>
                      <Button
                        size="sm"
                        className="bg-[#f1c40f] hover:bg-[#f39c12] text-slate-900 font-semibold shadow-sm cursor-pointer rounded-lg transition-transform hover:scale-105"
                      >
                        <Edit2 className="size-3.5 sm:mr-2" />
                        <span className="hidden sm:inline">Edit Ticket</span>
                      </Button>
                    </Link>
                  )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="flex flex-wrap gap-2 mb-6 pt-2 justify-end">
              <Badge
                variant="outline"
                className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold ${getStatusStyle(ticket.status)} border-transparent p py-1.5`}
              >
                {ticket.status}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold ${getPriorityStyle(ticket.priority)} border-transparent px-3 py-1.5`}
              >
                {ticket.priority}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] sm:text-xs tracking-wider font-bold ${getCategoryTheme(ticket.category).bg} ${getCategoryTheme(ticket.category).text} border-transparent px-3 py-1.5 flex items-center gap-1.5`}
              >
                <TicketIcon className="size-3.5" />{" "}
                {getCategoryLabel(ticket.category)}
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 leading-snug">
              {ticket.title}
            </h2>

            <div className="bg-slate-50/50 rounded-2xl py-5 border border-slate-100">
              <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
                <FileText className="size-4" /> Issue Description
              </div>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {ticket.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta Info Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm h-fit">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Activity className="size-4 text-primary" /> Time History
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" /> Created At
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {format(new Date(ticket.createdAt), "dd MMMM yyyy, HH:mm", {
                      locale: localeEn,
                    })}
                  </span>
                </div>
                <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Clock className="size-3.5" /> Last Updated
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {format(new Date(ticket.updatedAt), "dd MMMM yyyy, HH:mm", {
                      locale: localeEn,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Attachment Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm h-fit">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Paperclip className="size-4 text-primary" /> Attachments (
                {ticket.attachment_url?.length || 0})
              </h3>
              {ticket.attachment_url && ticket.attachment_url.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {ticket.attachment_url.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block relative aspect-square rounded-2xl overflow-hidden border border-slate-200 hover:border-primary transition-colors bg-slate-50"
                    >
                      <img
                        src={url}
                        alt={`Attachment ${idx + 1}`}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement?.classList.add(
                            "flex",
                            "items-center",
                            "justify-center",
                          );
                        }}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No attachments provided.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedTicketPage;

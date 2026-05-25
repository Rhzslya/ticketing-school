import {
  AlertCircle,
  Calendar,
  Clock,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  TicketIcon,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

import { motion, type Variants } from "framer-motion";
import { format } from "date-fns";
import { Status } from "@/enum/ticket";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/enum/user";
import { useTicketQueries } from "@/hooks/ticket-queries";
import { useUserQueries } from "@/hooks/user-queries";

export default function TrackTicketPage() {
  const { id: identifier } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { useProfile } = useUserQueries();
  const {
    data: user,
    isLoading: isAuthLoading,
    isError: isAuthError,
  } = useProfile();

  const { useDetail } = useTicketQueries();
  const {
    data: ticket,
    isLoading: isTicketLoading,
    isError: isTicketError,
  } = useDetail({ id: identifier || "" });

  useEffect(() => {
    if (!isAuthLoading && (!user || isAuthError)) {
      navigate(`/login?redirect=/tickets/track/${identifier}`, {
        replace: true,
      });
    }
  }, [isAuthLoading, user, isAuthError, navigate, identifier]);

  if (
    isAuthLoading ||
    (!user && !isAuthError) ||
    (isTicketLoading && !ticket)
  ) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
        <p className="text-sm sm:text-base text-slate-500 font-medium tracking-wide">
          Loading ticket data...
        </p>
      </div>
    );
  }

  const isOwner = user?.id === ticket?.submitterId;
  const isAdmin = user?.role === UserRole.ADMIN;

  if (ticket && !isOwner && !isAdmin) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertTriangle className="size-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Access Denied
        </h2>
        <p className="text-slate-500 max-w-md mb-6">
          You do not have permission to view this ticket as it was created by
          another user.
        </p>
        <Link to="/">
          <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer">
            Back to Home
          </button>
        </Link>
      </div>
    );
  }

  if (!ticket || isTicketError) {
    return (
      <NotFoundPage
        entityName="Ticket"
        id={identifier}
        backUrl="/"
        variant="minimal"
      />
    );
  }

  const isRejected = ticket.status === Status.REJECTED;
  const isFinished = ticket.status === Status.DONE;

  const steps = [
    {
      status: Status.SUBMITTED,
      label: "Submitted",
      icon: Clock,
    },
    {
      status: Status.ONGOING,
      label: "In Progress",
      icon: RefreshCcw,
    },
    {
      status: Status.DONE,
      label: "Resolved",
      icon: ShieldCheck,
    },
  ];

  const currentStepIndex = isRejected
    ? -1
    : steps.findIndex((s) => s.status === ticket.status);

  const getStatusContent = () => {
    switch (ticket.status) {
      case Status.SUBMITTED:
        return {
          title: "Ticket Submitted",
          desc: "Your report has been entered into the system and is awaiting technician assignment.",
          color: "from-blue-500 to-primary",
        };
      case Status.ONGOING:
        return {
          title: "In Progress",
          desc: "Our technicians are currently checking and working on your issue.",
          color: "from-indigo-500 to-blue-600",
        };
      case Status.DONE:
        return {
          title: "Issue Resolved",
          desc: "The repair has been completed. Thank you for your report.",
          color: "from-emerald-400 to-emerald-600",
        };
      case Status.REJECTED:
        return {
          title: "Ticket Rejected",
          desc: "The report was canceled or rejected. Please contact the administrator for more details.",
          color: "from-red-500 to-red-700",
        };
      default:
        return {
          title: ticket.status,
          desc: "",
          color: "from-primary to-blue-600",
        };
    }
  };

  const statusInfo = getStatusContent();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans selection:bg-primary/20">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-4 py-3 sm:px-8 sm:py-4 flex justify-between items-center shadow-sm"
      >
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <span className="font-black tracking-tighter text-lg sm:text-2xl text-slate-800">
            Helpdesk
          </span>
        </Link>
        <div className="flex flex-col items-end">
          <span className="text-xs sm:text-sm font-mono font-bold text-slate-700 ">
            {ticket.id}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(ticket.createdAt), "dd MMM yyyy")}
          </span>
        </div>
      </motion.div>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl bg-linear-to-br ${statusInfo.color}`}
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] backdrop-blur-sm">
                  Current Status
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-md">
                {statusInfo.title}
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium max-w-md leading-relaxed">
                {statusInfo.desc}
              </p>
            </div>

            <div className="hidden sm:flex items-center justify-center w-32 h-32 bg-white/10 rounded-full backdrop-blur-md">
              {isFinished ? (
                <ShieldCheck className="w-16 h-16 text-white" />
              ) : isRejected ? (
                <AlertCircle className="w-16 h-16 text-white" />
              ) : (
                <RefreshCcw className="w-16 h-16 text-white animate-spin-slow" />
              )}
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 top-10 w-32 h-32 bg-black/5 rounded-full blur-2xl pointer-events-none" />
        </motion.div>

        {/* 2. Timeline Status */}
        {!isRejected && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
          >
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400 mb-8 sm:mb-10 text-center sm:text-left">
              Resolution Progress
            </h3>

            <div className="relative">
              <div className="absolute top-5 sm:top-6 -translate-y-1/2 left-8 right-8 sm:left-12 sm:right-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute top-0 left-0 h-full bg-primary rounded-full origin-left"
                />
              </div>

              <div className="relative flex justify-between">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={idx}
                      className="relative z-10 flex flex-col items-center gap-3 w-16 sm:w-24"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-500 shadow-sm ${
                          isCompleted
                            ? "bg-primary text-white"
                            : "bg-white border-2 border-slate-100 text-slate-300"
                        } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}
                      >
                        <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.div>
                      <span
                        className={`text-[9px] sm:text-xs font-bold uppercase tracking-wider text-center transition-colors duration-300 ${
                          isCompleted ? "text-slate-800" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. Detail Tiket */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TicketIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold uppercase text-xs tracking-widest text-slate-800">
              Ticket Details
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">
                Issue Title
              </p>
              <h4 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                {ticket.title}
              </h4>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-600 border-slate-200"
              >
                <Tag className="size-3 mr-1.5" /> {ticket.category}
              </Badge>
              <Badge
                variant="outline"
                className="bg-red-50 text-red-600 border-red-200 uppercase tracking-wider text-[10px]"
              >
                Priority: {ticket.priority}
              </Badge>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                Full Description
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}

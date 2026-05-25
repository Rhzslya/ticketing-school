import { useParams, Link } from "react-router-dom";
import { useTicketQueries } from "@/hooks/ticket-queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import UpdateTicketForm from "@/features/components/UpdateTicketForm";
import { useUserQueries } from "@/hooks/user-queries";

export const UpdateTicketPage = () => {
  const { id } = useParams<{ id: string }>();
  const { useDetail } = useTicketQueries();
  const {
    data: ticket,
    isLoading: isTicketLoading,
    isError,
  } = useDetail({ id: id! });

  const { useProfile } = useUserQueries();
  const { data: user, isLoading: isUserLoading } = useProfile();

  if (isTicketLoading || isUserLoading || !user) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading data...</p>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md">
          <AlertCircle className="size-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Ticket Not Found
          </h3>
          <Link to="/tickets/my-tickets">
            <Button variant="outline">Back to Ticket List</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-20 relative">
      <section className="bg-primary text-white pt-16 pb-28 px-4 text-center relative">
        <div className="absolute top-6 left-4 md:left-8">
          <Link to={`/tickets/${ticket.id}`}>
            <Button
              variant="default"
              size="sm"
              className="text-white hover:text-background cursor-pointer font-medium duration-300"
            >
              <ArrowLeft className="mr-2 size-4" /> Cancel Edit
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-light mb-3 tracking-wide mt-2 uppercase">
          UPDATE TICKET
        </h1>
        <p className="text-blue-100 text-lg max-w-xl mx-auto">
          Make adjustments to your issue report{" "}
          <span className="font-mono font-semibold">{ticket.id}</span> below.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <Card className="bg-white rounded-xl shadow-lg border-slate-100">
          <CardContent className="p-6 md:p-10">
            <UpdateTicketForm ticket={ticket} currentUser={user} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default UpdateTicketPage;

import { Card, CardContent } from "@/components/ui/card";
import { CreateTicketForm } from "@/features/components/CreateTicketForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const CreateTicketPage = () => {
  const location = useLocation();

  const prefillData = location.state?.prefillData;
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-20 relative">
      <section className="bg-primary text-white pt-16 pb-28 px-4 text-center relative">
        <div className="absolute top-6 left-4 md:left-8">
          <Link to="/">
            <Button
              variant="default"
              size="sm"
              className="text-white hover:text-background cursor-pointer font-medium duration-300"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-light mb-3 tracking-wide mt-2">
          CREATE NEW TICKET
        </h1>
        <p className="text-blue-100 text-lg max-w-xl mx-auto">
          Please fill in the details of the issue below so our technical team
          can provide a solution as quickly as possible.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <Card className="bg-white rounded-xl shadow-lg border-slate-100">
          <CardContent className="p-6 md:p-10">
            <CreateTicketForm prefillData={prefillData} />{" "}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default CreateTicketPage;

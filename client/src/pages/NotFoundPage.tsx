import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MoveLeft,
  Home,
  LayoutDashboard,
  SearchX,
  Map,
  CloudOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NotFoundPageProps {
  id?: string | number;
  entityName?: string;
  backUrl?: string;
  isDashboard?: boolean;
  variant?: "glass" | "split" | "minimal";
  onGoBack?: () => void;
}

const NotFoundPage = ({
  id,
  entityName = "Data",
  backUrl,
  isDashboard = false,
  variant = "glass",
  onGoBack,
}: NotFoundPageProps) => {
  const navigate = useNavigate();

  const targetUrl = backUrl || (isDashboard ? "/dashboard" : "/");
  const buttonLabel = isDashboard ? "Dashboard" : "Home";
  const ButtonIcon = isDashboard ? LayoutDashboard : Home;

  const heightClass = isDashboard ? "h-full py-12" : "min-h-screen";

  // Varian GLASS
  if (variant === "glass") {
    return (
      <div
        className={cn(
          "relative flex w-full flex-col items-center justify-center overflow-hidden bg-foreground text-center text-background",
          heightClass,
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 opacity-30">
          <div className="absolute h-75 w-75 rounded-full border border-muted-foreground/20" />
          <div className="absolute h-112.5 w-112.5 rounded-full border border-muted-foreground/20" />
          <div className="absolute h-150 w-150 rounded-full border border-muted-foreground/20" />
          <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] bg-size-[20px_20px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
        </div>

        <div className="relative z-10 w-full max-w-md px-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-card p-2 shadow-lg shadow-black/5 ring-1 ring-border">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
              <SearchX className="h-10 w-10" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="mb-3 text-2xl font-bold tracking-tight text-background sm:text-3xl">
            We couldn't find that {entityName}
          </h1>

          <p className="mb-8 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {id
              ? `The ${entityName} with ID ${id} is missing from our records. It may have been deleted or the ID is incorrect.`
              : `The ${entityName} is missing from our records. It may have been deleted or the link is incorrect.`}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => (onGoBack ? onGoBack() : navigate(-1))}
              className="min-w-30 border-border text-backgroundhover:bg-muted cursor-pointer duration-300"
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(targetUrl)}
              className="min-w-30 text-backgroundcursor-pointer duration-300"
            >
              <ButtonIcon className="mr-2 h-4 w-4" />
              {buttonLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Varian SPLIT
  if (variant === "split") {
    return (
      <div
        className={cn(
          "flex w-full overflow-hidden border bg-foreground text-background",
          isDashboard ? "h-full rounded-lg border-border" : "min-h-screen",
        )}
      >
        <div className="flex w-full flex-col justify-center p-8 lg:w-1/2 lg:p-12">
          <div className="max-w-md mx-auto lg:mx-0">
            <div className="mb-6 inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-500">
              <CloudOff className="mr-1.5 h-3.5 w-3.5" />
              404 Error
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
              Missing Data
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Sorry, we couldn't locate the {entityName}. It might have been
              moved, deleted, or you may have mistyped the ID.
            </p>

            {id && (
              <div className="mb-8 rounded-lg border border-dashed border-border bg-muted/30 p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Searched ID
                </p>
                <p className="font-mono text-lg font-medium text-background">
                  {id}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate(targetUrl)}
                className="rounded-full px-8 text-backgroundcursor-pointer duration-300"
              >
                Back to {buttonLabel}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => (onGoBack ? onGoBack() : navigate(-1))}
                className="rounded-full text-muted-foreground hover:text-backgroundcursor-pointer duration-300"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden w-1/2 bg-muted lg:block relative overflow-hidden border-l border-border">
          <div
            className="absolute inset-0 opacity-[0.15] text-background"
            style={{
              backgroundImage:
                "radial-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Map className="h-64 w-64 text-background" />
          </div>
        </div>
      </div>
    );
  }

  // Varian MINIMAL (Default)
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center bg-foreground p-4 text-center",
        heightClass,
      )}
    >
      <h1 className="select-none text-[10rem] font-black leading-none text-background/40 sm:text-[12rem] md:text-[14rem]">
        404
      </h1>
      <div className="relative -mt-12 sm:-mt-16 md:-mt-20 space-y-4">
        <h2 className="text-3xl font-bold tracking-tighter text-background sm:text-4xl">
          {entityName} not found
        </h2>
        <p className="mx-auto max-w-125 text-muted-foreground md:text-lg">
          We can't seem to find the page or data you're looking for.
          {id && <span> (ID: {id})</span>}
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => (onGoBack ? onGoBack() : navigate(-1))}
            variant="link"
            className="text-background underline-offset-4 cursor-pointer duration-300"
          >
            Go Back
          </Button>
          <span className="text-border">|</span>
          <Button
            onClick={() => navigate(targetUrl)}
            className="rounded-full px-8 font-semibold text-background cursor-pointer duration-300"
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

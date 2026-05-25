import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserIcon,
  Mail,
  AtSign,
  Shield,
  LogOut,
  ArrowLeft,
  KeyRound,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserQueries } from "@/hooks/user-queries";
import { UserService } from "@/service/user-service";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { useProfile } = useUserQueries();
  const { data: user, isLoading } = useProfile();

  const handleManualLogout = async () => {
    try {
      await UserService.logout();
    } catch {
      /* Ignore Error */
    }
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-primary size-10" />
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center text-slate-600">
        <p className="mb-4">User data not found. Please log in again.</p>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans pb-20">
      <section className="bg-primary text-white pt-24 pb-32 px-4 text-center relative">
        <div className="max-w-3xl mx-auto flex justify-start mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-blue-100 hover:text-white hover:bg-white/10 cursor-pointer -ml-4"
          >
            <ArrowLeft className="size-4 mr-2" /> Back
          </Button>
        </div>

        <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">
          USER PROFILE
        </h1>
        <p className="text-blue-100 mb-10 text-lg">
          Manage your account details and system preferences.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 -mt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded shadow-sm border border-slate-100 pt-16 px-6 pb-8 text-center relative flex flex-col items-center"
        >
          <div className="absolute -top-12 w-24 h-24 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-primary text-3xl font-bold shadow-sm">
            {getInitials(user.fullName)}
          </div>

          <h2 className="text-2xl font-bold mb-1 text-slate-800">
            {user.fullName}
          </h2>
          <span className="text-sm text-slate-500 font-medium mb-8">
            @{user.username}
          </span>

          <div className="grid md:grid-cols-2 gap-4 w-full text-left border-t border-slate-100 pt-8 mb-8">
            <div className="flex items-start gap-4 p-4 bg-[#f8f9fa] rounded border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                <Mail className="size-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-slate-800 font-medium truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#f8f9fa] rounded border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-yellow-500 shadow-sm shrink-0">
                <Shield className="size-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Access Level
                </p>
                <p className="text-slate-800 font-medium capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#f8f9fa] rounded border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                <KeyRound className="size-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  User ID
                </p>
                <p className="text-slate-800 font-mono font-medium">
                  {user.id}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#f8f9fa] rounded border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                <AtSign className="size-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Account Status
                </p>
                <p className="text-slate-800 font-medium capitalize">Active</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              className="bg-[#5191d1] hover:bg-[#3d7bbc] text-white flex-1 cursor-pointer h-11"
              onClick={() => alert("Edit Profile Feature Coming Soon")}
              disabled
            >
              <UserIcon className="size-4 mr-2" /> Edit Profile
            </Button>
            <Button
              className="bg-[#e74c3c] hover:bg-[#c0392b] text-white flex-1 cursor-pointer h-11"
              onClick={handleManualLogout}
            >
              <LogOut className="size-4 mr-2" /> Logout
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ProfilePage;

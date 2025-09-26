import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const PersonalBlueprint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {/* top-right auth button / email */}
      <div className="absolute top-4 right-4 z-10 text-[12px]">
        {user ? (
          <span className="rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm">
            {user.email}
          </span>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="rounded-md border border-border bg-white/70 px-4 py-0 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white h-[24px] min-h-0 leading-none"
          >
            Log in
          </button>
        )}
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/personal-blueprint')}
            className="rounded-md border border-border px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white"
            style={{ backgroundColor: '#F2DABA' }}
          >
            My Blueprint
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-foreground/90 mb-2">Personal Blueprint</h1>
        <p className="text-foreground/70 text-sm">
          Content removed.
        </p>
      </div>
    </div>
  );
};

export default PersonalBlueprint;
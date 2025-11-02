import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { selectUser, logout } from "@/store";
import { SaveStatusIndicator } from "@/components/SaveStatusIndicator";
import { ToolbarButton, ToolbarIconButton } from "@/components/Toolbar";
import { RiMenuLine, RiHomeLine, RiLogoutBoxLine } from "@remixicon/react";

interface DashboardHeaderProps {
  onMobileMenuOpen: () => void;
}

export function DashboardHeader({ onMobileMenuOpen }: DashboardHeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = async () => {
    await dispatch(logout());
    // Use replace: true to prevent back button navigation to dashboard
    navigate("/", { replace: true });
  };

  return (
    <header className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 py-2 shadow-sm sm:px-4 sm:py-3">
      <div className="flex items-center gap-1 sm:gap-4">
        <ToolbarIconButton
          onClick={onMobileMenuOpen}
          icon={<RiMenuLine size={20} />}
          title="Open menu"
          hideOnDesktop
        />

        <Link
          to="/"
          className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
          title="Go to home"
        >
          <RiHomeLine size={20} />
        </Link>

        <h1 className="text-base font-bold text-gray-900 sm:text-xl">
          Dashboard
        </h1>

        <div className="hidden sm:block">
          <SaveStatusIndicator />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {user && (
          <>
            <div className="hidden items-center gap-2 px-2 sm:flex">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-7 w-7 rounded-full"
                />
              )}
              <span className="hidden text-sm font-medium text-gray-700 lg:inline">
                {user.name}
              </span>
            </div>

            <ToolbarButton
              onClick={handleLogout}
              icon={<RiLogoutBoxLine size={18} />}
              label="Logout"
              title="Sign out"
              className="sm:px-3"
            />
          </>
        )}
      </div>
    </header>
  );
}

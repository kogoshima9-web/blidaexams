"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Loader2,
  Eye,
  Building2,
  Sparkles,
  Bell,
  AlertTriangle,
  Inbox,
  Moon,
  Sun,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/universities", label: "Universités", icon: Building2 },
  { href: "/admin/school-years", label: "Années Scolaires", icon: GraduationCap },
  { href: "/admin/subjects", label: "Matières", icon: BookOpen },
  { href: "/admin/exams", label: "Examens", icon: FileText },
  { href: "/admin/exam-submissions", label: "Examens Envoyés", icon: Inbox },
  { href: "/admin/quiz", label: "PDF to Quiz", icon: Sparkles },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(false);
      return;
    }
    
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/verify");
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [isLoginPage]);

  useEffect(() => {
    if (isAuthenticated === false && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router, isLoginPage]);

  useEffect(() => {
    if (isAuthenticated === true) {
      fetch("/api/reports-all?status=pending")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setNotifications(data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingNotifications(false));
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAuthenticated === null || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#1C1917]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B2635] dark:text-[#DC2626]" />
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      incorrect_answer: "Réponse incorrecte",
      typo: "Erreur de frappe",
      unclear: "Question peu claire",
      wrong_explanation: "Explication erronée",
      other: "Autre",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1C1917] transition-colors duration-500">
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#292524] rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6 text-[#2C1810] dark:text-[#E7E5E4]" />
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-[#292524] shadow-xl z-50 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#E8E0D5] dark:border-[#3D3835]">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div>
                  <h1 className="font-playfair text-xl font-bold text-[#2C1810] dark:text-[#FAF7F2]">
                    Blida Exams
                  </h1>
                  <p className="text-sm text-[#8B7D6B] dark:text-[#78716C]">
                    Administration
                  </p>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-2 hover:bg-[#E8E0D5] dark:hover:bg-[#3D3835] rounded-lg transition-colors"
              >
                <ChevronLeft
                  className={`w-5 h-5 text-[#5C5347] dark:text-[#A8A29E] transition-transform ${
                    !sidebarOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-2 hover:bg-[#E8E0D5] dark:hover:bg-[#3D3835] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#5C5347] dark:text-[#A8A29E]" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#8B2635]/10 dark:bg-[#DC2626]/10 text-[#8B2635] dark:text-[#DC2626]"
                      : "text-[#5C5347] dark:text-[#A8A29E] hover:bg-[#E8E0D5] dark:hover:bg-[#3D3835]"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#E8E0D5] dark:border-[#3D3835]">
            {sidebarOpen && (
              <div className="mb-4 p-3 bg-[#FAF7F2] dark:bg-[#1C1917] rounded-lg">
                <p className="text-xs font-medium text-[#8B7D6B] dark:text-[#78716C] mb-3 flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  Aperçu des designs
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <a
                      key={num}
                      href={`/${num}`}
                      target="_blank"
                      className="aspect-square rounded flex items-center justify-center text-xs font-bold bg-[#E8E0D5] dark:bg-[#3D3835] hover:bg-[#8B2635] hover:text-white dark:hover:bg-[#DC2626] dark:hover:text-white transition-colors"
                    >
                      {num}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-[#DC2626] dark:text-[#F87171] hover:bg-[#DC2626]/10 dark:hover:bg-[#DC2626]/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Déconnexion</span>}
            </button>
          </div>
        </div>
      </aside>

      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="min-h-screen pt-16 lg:pt-0">
          <header className="fixed top-0 right-0 left-0 lg:left-auto z-30 bg-white/90 dark:bg-[#292524]/90 backdrop-blur-sm border-b border-[#E8E0D5] dark:border-[#3D3835] px-4 py-3 flex items-center justify-end gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 rounded-full bg-[#E8E0D5] dark:bg-[#1C1917] flex items-center justify-center text-[#5C5347] dark:text-[#A8A29E] hover:bg-[#D4C5B3] dark:hover:bg-[#3D3835] transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[#5C5347] dark:text-[#A8A29E] hover:bg-[#E8E0D5] dark:hover:bg-[#3D3835] rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DC2626] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#292524] rounded-xl shadow-xl border border-[#E8E0D5] dark:border-[#3D3835] z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-[#E8E0D5] dark:border-[#3D3835]">
                      <h3 className="font-semibold text-[#2C1810] dark:text-[#FAF7F2] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                        Signalements en attente
                      </h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-4 text-center text-[#8B7D6B] dark:text-[#78716C]">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-[#8B7D6B] dark:text-[#78716C]">
                          Aucun signalement en attente
                        </div>
                      ) : (
                        notifications.map((report) => (
                          <Link
                            key={report.id}
                            href={`/admin/exams/${report.exam_id}?report=${report.id}&question=${report.question_id}`}
                            onClick={() => setShowNotifications(false)}
                            className="block p-4 hover:bg-[#FAF7F2] dark:hover:bg-[#1C1917] border-b border-[#E8E0D5] dark:border-[#3D3835] last:border-0 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-4 h-4 text-[#DC2626] mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#2C1810] dark:text-[#FAF7F2]">
                                  {report.exam?.university || "—"} • {report.exam?.year || "—"}
                                </p>
                                <p className="text-xs text-[#8B7D6B] dark:text-[#78716C] truncate">
                                  {report.exam?.subject_name || "—"} • Question #{report.question_order || "?"}
                                </p>
                                <p className="text-xs text-[#78716C] dark:text-[#57534E] mt-1">
                                  {getReportTypeLabel(report.report_type)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}

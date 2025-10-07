import { useState, useRef, useEffect } from "react";
import { FaChevronUp } from "react-icons/fa";

function MobileDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Optional: close when tapping background
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Drawer background overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-10" />
      )}

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 w-full bg-slate-600/80 backdrop-blur-lg text-white shadow-lg transition-transform duration-500 z-20 ${
          open ? "translate-y-0" : "translate-y-[70%]"
        }`}
      >
        {/* Drag handle */}
        <div
          onClick={() => setOpen(!open)}
          className={`flex justify-center items-center cursor-pointer py-4 ${open && "rotate-180"}`}
        ><div className="bg-slate-500/50 backdrop-blur-sm py-2 px-4 rounded-sm"><FaChevronUp className="text-2xl"/></div></div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">
          {children}
        </div>
      </div>
    </>
  );
}

export default MobileDrawer;

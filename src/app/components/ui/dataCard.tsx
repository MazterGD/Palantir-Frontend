export default function DataCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-3 sm:p-4 border border-slate-600/30 hover:border-slate-500/40 transition-all duration-200 shadow-lg">
      <h3 className="text-slate-300 font-bold mb-2 sm:mb-3 text-[10px] sm:text-xs uppercase tracking-wider border-b border-slate-700/40 pb-1.5 sm:pb-2">
        {title}
      </h3>
      <div className="space-y-1.5 sm:space-y-2.5">{children}</div>
    </div>
  );
}

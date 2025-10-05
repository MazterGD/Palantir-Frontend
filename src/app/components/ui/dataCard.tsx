export default function DataCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-2xl p-4 border border-slate-500/20">
      <h3 className="text-slate-300 font-semibold mb-3 text-sm uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

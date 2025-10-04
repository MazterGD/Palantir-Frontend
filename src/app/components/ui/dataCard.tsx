export default function DataCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-4 border border-purple-500/20">
      <h3 className="text-cyan-300 font-semibold mb-3 text-sm uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

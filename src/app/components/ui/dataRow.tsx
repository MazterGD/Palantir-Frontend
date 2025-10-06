export default function DataRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | React.ReactNode;
  unit?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-lg hover:bg-slate-800/30 transition-all duration-150">
      <span className="text-slate-400 text-[10px] sm:text-xs font-medium">{label}</span>
      <span className="text-white font-semibold text-xs sm:text-sm">
        {value}{" "}
        {unit && <span className="text-slate-400 text-[10px] sm:text-xs ml-1 font-normal">{unit}</span>}
      </span>
    </div>
  );
}

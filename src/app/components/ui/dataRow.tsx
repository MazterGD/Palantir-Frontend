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
    <div className="flex justify-between items-center py-1">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white font-medium">
        {value}{" "}
        {unit && <span className="text-slate-300 text-xs ml-1">{unit}</span>}
      </span>
    </div>
  );
}

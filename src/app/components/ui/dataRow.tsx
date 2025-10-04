export default function DataRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-purple-300 text-sm">{label}</span>
      <span className="text-white font-medium">
        {value}{" "}
        {unit && <span className="text-cyan-400 text-xs ml-1">{unit}</span>}
      </span>
    </div>
  );
}

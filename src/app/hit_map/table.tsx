"use client";

import { AsteroidImpactResult } from "./types";

const ImpactTable = ({ data }: { data: AsteroidImpactResult }) => {
  const rows = [
    { label: "Mass", value: `${data.mass.toLocaleString()} kg` },
    { label: "Kinetic Energy", value: `${data.kineticEnergy.toExponential(2)} J` },
    { label: "Energy (Megatons TNT)", value: `${data.energyMegatons.toFixed(2)} Mt TNT` },
    { label: "Impact Energy", value: `${data.impactEnergy.toExponential(2)} J` },
    { label: "Impact (Megatons TNT)", value: `${data.impactMegatons.toFixed(2)} Mt TNT` },
    { label: "Linear Momentum", value: `${data.linearMomentum.toExponential(2)} kg·m/s` },
    { label: "Angular Momentum", value: `${data.angularMomentum.toExponential(2)} kg·m²/s` },
    { label: "Seafloor Velocity", value: `${data.seafloorVelocity.toFixed(2)} km/s` },
    { label: "Seafloor Energy", value: `${data.seafloorEnergy.toExponential(2)} J` },
    { label: "Collision Frequency", value: `~1 per ${data.imFreq.toLocaleString()} years` },
  ];

  return (
    <div className="overflow-x-auto">
         <h1 className="text-2xl font-bold pb-4">Impact Results</h1>
      <table className="min-w-full border-gray-300 rounded-lg shadow-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="px-4 py-2 font-semibold text-gray-100">{row.label}</td>
              <td className="px-4 py-2 text-gray-200">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImpactTable;

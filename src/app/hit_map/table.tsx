"use client";

import { AsteroidImpactResult } from "./types";

const ImpactTable = ({ data }: { data: AsteroidImpactResult }) => {
  function formatNumber(value:number, type:string) {
    if (value === 0) return { value: "0", unit: getBaseUnit(type) };

    if (type === "imFreq") {
      if (value < 1) {
        const reciprocal = 1 / value;
        return {
          value: `~1 per ${reciprocal >= 1000 ? reciprocal.toLocaleString() : reciprocal.toFixed(0)}`,
          unit: "years",
        };
      }
      const unit = value >= 1000 ? "kyr" : "years";
      const scaledValue = value >= 1000 ? value / 1000 : value;
      return {
        value: `~1 per ${scaledValue >= 100 ? scaledValue.toLocaleString() : scaledValue.toFixed(0)}`,
        unit,
      };
    }

    let scaledValue = value;
    let unit = getBaseUnit(type);
    const scaleFactor = 1;

    switch (type) {
      case "mass":
        if (Math.abs(value) * Math.pow(10, 2) < 1) {
          scaledValue = value * Math.pow(10, 6);
          unit = "g";
        } else if (Math.abs(value) < 1) {
          scaledValue = value * Math.pow(10, 3);
          unit = "kg";
        } else if (Math.abs(value) >= Math.pow(10, 3)) {
          scaledValue = value / Math.pow(10, 3);
          unit = "t";
        }
        break;
      case "energy":
        if (Math.abs(value) < Math.pow(10, 2)) {
          unit = "J";
        } else if (Math.abs(value) < Math.pow(10, 6)) {
          scaledValue = value / Math.pow(10, 3);
          unit = "kJ";
        } else if (Math.abs(value) < Math.pow(10, 9)) {
          scaledValue = value / Math.pow(10, 6);
          unit = "MJ";
        } else {
          scaledValue = value / Math.pow(10, 9);
          unit = "GJ";
        }
        break;
      case "energyMegatons":
        if (Math.abs(value) * Math.pow(10, 5) < 1) {
          scaledValue = value * Math.pow(10, 9);
          unit = "kg TNT";
        } else if (Math.abs(value) * Math.pow(10, 2) < 1) {
          scaledValue = value * Math.pow(10, 6);
          unit = "t TNT";
        } else if (Math.abs(value) < 1) {
          scaledValue = value * Math.pow(10, 3);
          unit = "kt TNT";
        }
        break;
      case "linearMomentum":
        if (Math.abs(value) >= Math.pow(10, 3)) {
          scaledValue = value / Math.pow(10, 3);
          unit = "t·m/s";
        }
        break;
      case "angularMomentum":
        if (Math.abs(value) >= Math.pow(10, 3)) {
          scaledValue = value / 1000;
          unit = "t·m²/s";
        }
        break;
      case "seafloorVelocity":
        if (Math.abs(value) * Math.pow(10, 2) < 1) {
          scaledValue = value * Math.pow(10, 3);
          unit = "m/s";
        }
        break;
    }

    const absScaledValue = Math.abs(scaledValue);
    let formattedValue;
    if (absScaledValue < 0.01 || absScaledValue >= 1e5) {
      const exponent = Math.floor(Math.log10(absScaledValue));
      const coefficient = scaledValue / Math.pow(10, exponent);
      formattedValue = `${coefficient.toFixed(2)} × 10 <sup> ${exponent < 0 ? exponent : `+${exponent}`} </sup> `;
    } else if (absScaledValue < 100) {
      formattedValue = scaledValue.toFixed(2);
    } else {
      formattedValue = scaledValue.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
    }

    return { value: formattedValue, unit };
  }

  function getBaseUnit(type:string) {
    switch (type) {
      case "mass":
        return "kg";
      case "energy":
        return "J";
      case "energyMegatons":
        return "Mt TNT";
      case "linearMomentum":
        return "kg·m/s";
      case "angularMomentum":
        return "kg·m²/s";
      case "seafloorVelocity":
        return "km/s";
      case "imFreq":
        return "years";
      default:
        return "";
    }
  }

  const rows = [
    {
      label: "Mass",
      value: formatNumber(data.mass, "mass").value,
      unit: formatNumber(data.mass, "mass").unit,
    },
    {
      label: "Kinetic Energy",
      value: formatNumber(data.kineticEnergy, "energy").value,
      unit: formatNumber(data.kineticEnergy, "energy").unit,
    },
    {
      label: "Energy (TNT)",
      value: formatNumber(data.energyMegatons, "energyMegatons").value,
      unit: formatNumber(data.energyMegatons, "energyMegatons").unit,
    },
    {
      label: "Impact Energy",
      value: formatNumber(data.impactEnergy, "energy").value,
      unit: formatNumber(data.impactEnergy, "energy").unit,
    },
    {
      label: "Impact (TNT)",
      value: formatNumber(data.impactMegatons, "energyMegatons").value,
      unit: formatNumber(data.impactMegatons, "energyMegatons").unit,
    },
    {
      label: "Linear Momentum",
      value: formatNumber(data.linearMomentum, "linearMomentum").value,
      unit: formatNumber(data.linearMomentum, "linearMomentum").unit,
    },
    {
      label: "Angular Momentum",
      value: formatNumber(data.angularMomentum, "angularMomentum").value,
      unit: formatNumber(data.angularMomentum, "angularMomentum").unit,
    },
    {
      label: "Seafloor Velocity",
      value: formatNumber(data.seafloorVelocity, "seafloorVelocity").value,
      unit: formatNumber(data.seafloorVelocity, "seafloorVelocity").unit,
    },
    {
      label: "Seafloor Energy",
      value: formatNumber(data.seafloorEnergy, "energy").value,
      unit: formatNumber(data.seafloorEnergy, "energy").unit,
    },
    {
      label: "Collision Frequency",
      value: formatNumber(data.imFreq, "imFreq").value,
      unit: formatNumber(data.imFreq, "imFreq").unit,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold pb-4">Impact Results</h1>
      <table className="min-w-full border-gray-300 rounded-lg shadow-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="px-4 py-2 font-semibold text-gray-100">
                {row.label}
              </td>
              <td
                className="px-4 py-2 text-gray-200"
                dangerouslySetInnerHTML={{ __html: row.value }}
              />
              <td className="px-4 py-2 text-gray-200">{row.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImpactTable;

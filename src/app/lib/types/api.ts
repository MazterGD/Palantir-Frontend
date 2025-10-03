export interface AsteroidAPIResponse {
  asteroid: {
    id: string;
    name: string;
    semi_major_axis: number;
    eccentricity: number;
    inclination: number;
    ascending_node_longitude: number;
    perihelion_argument: number;
    mean_anomaly: number;
    orbital_period: number;
    epoch_osculation: number;
    estimated_diameter_max: number;
    estimated_diameter_min: number;
    absolute_magnitude_h: number;
    is_potentially_hazardous_asteroid: boolean;
    orbit_determination_date: string;
  };
}

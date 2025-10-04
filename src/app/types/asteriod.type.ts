export type AsteroidType = {
  absolute_magnitude_h: number;
  close_approach_data: Array<{
    close_approach_date: string;
    close_approach_date_full: string;
    miss_distance: {
      astronomical: number;
      kilometers: number;
      miles: number;
    };
    orbiting_body: string;
    relative_velocity: {
      kilometers_per_second: number;
      miles_per_hour: number;
    };
  }>;
  designation: string;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_max: number;
      estimated_diameter_min: number;
    };
    meters: {
      estimated_diameter_max: number;
      estimated_diameter_min: number;
    };
  };
  name: string;
  name_limited: string;
  is_potentially_hazardous_asteroid: boolean;
  orbital_data: {
    aphelion_distance: number;
    eccentricity: number;
    inclination: number;
    orbital_period: number;
    perihelion_distance: number;
    semi_major_axis: number;
    orbit_class: {
      orbit_class_type: string;
      orbit_class_description: string;
    };
  };
};

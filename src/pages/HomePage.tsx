import React, { useState } from "react";
import Header from "../components/HomePageHeader";
import ServieGrid from "../components/ServieGrid";

interface Filters {
 type: string;
 sortBy: string;
 sortDir: "asc" | "desc";
 tickedGenres: string[];
 crossedGenres: string[];
 tickedGenres2: string[];
 crossedGenres2: string[];
 languages: string[];
 statuses: string[];
 startYear: string;
 endYear: string;
 watched: string;
}

const HomePage: React.FC = () => {
 const [filters, setFilters] = useState<Filters>({
  type: "",
  sortBy: "title",
  sortDir: "asc",
  tickedGenres: [],
  crossedGenres: [],
  tickedGenres2: [],
  crossedGenres2: [],
  languages: [],
  statuses: [],
  startYear: "",
  endYear: "",
  watched: "",
 });

 const handleFilterChange = (newFilters: Filters) => {
  // Use the filters to fetch movies from an API or filter locally
  setFilters(newFilters);
  console.log("Filters changed:", newFilters);
 };

 return (
  <div>
   <Header handleFilterChange={handleFilterChange} />

   {/* Movie Grid */}
   {/* <ServieGrid movies={movies} toggleWatch={() => {}} removeMovie={() => {}} /> */}
   <ServieGrid data={filters} />
  </div>
 );
};

export default HomePage;

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Data for TV Shows and Movies
const langTVShows = [
    { name: "cn", value: 0 },
    { name: "da", value: 0 },
    { name: "de", value: 1 },
    { name: "en", value: 52 },
    { name: "es", value: 1 },
    { name: "fr", value: 0 },
    { name: "hi", value: 20 },
    { name: "is", value: 0 },
    { name: "it", value: 0 },
    { name: "ja", value: 60 },
    { name: "kn", value: 0 },
    { name: "ko", value: 7 },
    { name: "mr", value: 0 },
    { name: "ta", value: 0 },
    { name: "te", value: 0 },
    { name: "th", value: 0 },
    { name: "zh", value: 2 },
];

const langMovies = [
    { name: "cn", value: 9 },
    { name: "da", value: 1 },
    { name: "de", value: 0 },
    { name: "en", value: 985 },
    { name: "es", value: 7 },
    { name: "fr", value: 2 },
    { name: "hi", value: 430 },
    { name: "is", value: 1 },
    { name: "it", value: 1 },
    { name: "ja", value: 65 },
    { name: "kn", value: 1 },
    { name: "ko", value: 21 },
    { name: "mr", value: 7 },
    { name: "ta", value: 7 },
    { name: "te", value: 8 },
    { name: "th", value: 4 },
    { name: "zh", value: 4 },
];

// Merging both data sets for easy rendering
// Merging both data sets for easy rendering
const mergedData = langTVShows
    .map(tv => {
        // Find the corresponding movie entry
        const movie = langMovies.find(movie => movie.name === tv.name);

        // Only return data if both TV and Movie values are greater than 0
        if (tv.value > 0 || (movie && movie.value > 0)) {
            return {
                name: tv.name,
                TVShows: tv.value > 0 ? tv.value : undefined, // Only include TV shows if greater than 0
                Movies: movie && movie.value > 0 ? movie.value : undefined, // Only include Movies if greater than 0
            };
        }
        return null; // Skip if both are 0
    })
    .filter(item => item !== null); // Filter out null values

console.log(mergedData);

const BarCharts: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-6">
            <h1 className="text-2xl font-bold mb-6">Movies and TV Shows by Language</h1>
            <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-4xl">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={mergedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                            scale="log"
                            domain={[0.5, 'auto']} // Adjust starting point for better visibility of 1
                            tickFormatter={(tick) => tick === 0.5 ? "0" : tick} // Formatting ticks for better clarity
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="TVShows" fill="#8884d8" name="TV Shows" />
                        <Bar dataKey="Movies" fill="#82ca9d" name="Movies" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BarCharts;

import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const dataMovies = [
    { name: "Action", value: 58 },
    { name: "Adventure", value: 58 },
    { name: "Animation", value: 75 },
    { name: "Comedy", value: 46 },
    { name: "Crime", value: 18 },
    { name: "Documentary", value: 0 },
    { name: "Drama", value: 78 },
    { name: "Family", value: 2 },
];

const dataTVShows = [
    { name: "Action", value: 608 },
    { name: "Adventure", value: 374 },
    { name: "Animation", value: 178 },
    { name: "Comedy", value: 550 },
    { name: "Crime", value: 193 },
    { name: "Documentary", value: 2 },
    { name: "Drama", value: 672 },
    { name: "Family", value: 181 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#d0ed57", "#a4de6c", "#ffbb28"];

const PieCharts: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-6">
            <h1 className="text-2xl font-bold mb-6">Movies and TV Shows by Genre</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Movies Pie Chart */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-center mb-4">Movies</h2>
                    <PieChart width={400} height={400}>
                        <Pie
                            data={dataMovies}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#8884d8"
                            label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                            {dataMovies.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                {/* TV Shows Pie Chart */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-center mb-4">TV Shows</h2>
                    <PieChart width={400} height={400}>
                        <Pie
                            data={dataTVShows}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#82ca9d"
                            label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                            {dataTVShows.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>
            </div>
        </div>
    );
};

export default PieCharts;

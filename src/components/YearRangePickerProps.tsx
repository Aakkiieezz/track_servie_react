import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface YearRangePickerProps {
    startYear2: Date | undefined;
    endYear2: Date | undefined;
    setStartYear2: (date: Date | undefined) => void;
    setEndYear2: (date: Date | undefined) => void;
}

const YearRangePicker: React.FC<YearRangePickerProps> = ({
    startYear2,
    endYear2,
    setStartYear2,
    setEndYear2,
}) => {
    const [range, setRange] = useState<[Date | undefined, Date | undefined]>([
        startYear2,
        endYear2,
    ]);

    const currentYear = new Date();
    const minYear = new Date("1950-01-01"); // Set the minimum year as 1950

    const handleChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setRange([start ?? undefined, end ?? undefined]);
        setStartYear2(start ?? undefined);
        setEndYear2(end ?? undefined);
    };

    return (
        <DatePicker
            selectsRange
            selected={range[0]}
            startDate={range[0]}
            endDate={range[1]}
            onChange={handleChange}
            showYearPicker
            dateFormat="yyyy"
            placeholderText="Select year range"
            minDate={minYear}
            maxDate={currentYear}
        />
    );
};

export default YearRangePicker;

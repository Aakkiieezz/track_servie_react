import React from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@radix-ui/react-dropdown-menu";

interface KeyValuePair {
    id: string;
    label: string;
}

interface DropdownMenuProps {
    label: string;
    options: KeyValuePair[] | string[];
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

const DropdownMenuComponent: React.FC<DropdownMenuProps> = ({
    label,
    options,
    selected,
    setSelected,
}) => {
    const handleCheckboxChange = (id: string) => {
        setSelected((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id)
                : [...prevSelected, id]
        );
    };

    const isOptionObject = (option: KeyValuePair | string): option is KeyValuePair => {
        return typeof option !== "string";
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* Dropdown toggle button */}
                <button
                    className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    aria-haspopup="true"
                >
                    {label}
                    <svg
                        className="-mr-1 ml-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </DropdownMenuTrigger>

            {/* Dropdown menu */}
            <DropdownMenuContent className="w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <ul className="max-h-60 rounded-md py-1 overflow-auto">
                    {options.map((option) => {
                        const id = isOptionObject(option) ? option.id : option;
                        const displayLabel = isOptionObject(option) ? option.label : option;

                        return (
                            <DropdownMenuCheckboxItem
                                key={id}
                                checked={selected.includes(id)}
                                onCheckedChange={() => handleCheckboxChange(id)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                {displayLabel}
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                </ul>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default DropdownMenuComponent;

import React from "react";
import { createPortal } from "react-dom";
import styles from "./SearchFilter.module.css";

interface PortalDropdownProps {
    show: boolean;
    position: { top: number; left: number; width: number };
    maxHeight: number;
    children: React.ReactNode;
    //   dropdownRef: React.RefObject<HTMLDivElement | null>;
    dropdownRef: React.RefObject<HTMLDivElement>
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({
    show,
    position,
    maxHeight,
    children,
    dropdownRef,
}) => {
    if (!show) return null;

    return createPortal(
        <div
            ref={dropdownRef}
            className={styles.dropdownContainer}
            style={{
                position: "fixed",
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
                maxHeight: `${maxHeight}px`,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={styles.dropdownContent}>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default PortalDropdown;
import React, { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../components/Alert.css"

interface AlertProps {
    type: string;
    message: string;
    timeout?: number;
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, timeout = 3000, onClose }) => {
    useEffect(() => {
        if (timeout) {
            const timer = setTimeout(() => {
                onClose();
            }, timeout);

            return () => clearTimeout(timer);
        }
    }, [timeout, onClose]);

    return (
        <div className={`alert alert-${type} alert-dismissible fade show alert-top`} role="alert">
            {message}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={onClose}></button>
        </div>
    );
};

export default Alert;

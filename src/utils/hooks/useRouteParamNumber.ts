import { useParams } from 'react-router-dom';

export function useRouteParamNumber(
    paramName: string,
    defaultValue?: number
): number {
    const params = useParams();
    const value = params[paramName];
    if (value === undefined) {
        if (defaultValue !== undefined)
            return defaultValue;
        throw new Error(`Missing route parameter: ${paramName}`);
    }
    const number = Number(value);
    if (Number.isNaN(number))
        throw new Error(`Invalid route parameter: ${paramName}`);
    return number;
}
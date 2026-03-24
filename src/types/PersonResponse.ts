import type { Servie } from "./servie";

export interface PersonResponse {
    name: string;
    knownForDepartment: string;
    gender: number;
    adult: boolean;
    popularity: number;
    birthday: string;
    biography: string;
    birthPlace: string;
    homepage: string;
    lastModified: string;
    profilePath: string;
    servies: Servie[];
}
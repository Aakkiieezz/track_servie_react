export interface PersonResponse {
    id: number;
    imdbId: string | null;
    name: string;
    knownForDepartment: string;
    gender: number;
    adult: boolean;
    popularity: number;
    profilePath: string;
    birthday: string | null;
    deathday: string | null;
    biography: string;
    birthPlace: string;
    homepage: string | null;
    lastModified: string;

    acting: CastServie[];
    appearances: CastServie[];
    crew: CrewServie[];
    crewIndex: Record<string, CrewDepartmentIndex>;
}

export interface ServieKey {
    tmdbId: number;
    childtype: "movie" | "tv";
}

export interface CrewDepartmentIndex {
    all: ServieKey[];
    movies: ServieKey[];
    tv: ServieKey[];
}

export interface PersonServie {
    tmdbId: number;
    childtype: "movie" | "tv";
    title: string;
    posterPath: string | null;
    popularity: number;

    releaseDate: string | null;
    totalEpisodes: number | null;
    firstAirDate: string | null;

    episodesWatched: number | null;
    completed: boolean;
}

export interface CastServie extends PersonServie {
    character: string;
    lastAirDate: string | null;
}

export interface CrewServie extends PersonServie {
    departments: CrewDepartment[];
}

export interface CrewDepartment {
    department: string;
    jobs: string[];
}
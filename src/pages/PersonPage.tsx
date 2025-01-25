import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Alert from '../components/Alert';
import "../components/thymeleafCss.css";

interface PersonResponse {
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

interface Servie {
    childtype: string;
    tmdbId: number;
    posterPath: string;
    title: string;
    releaseDate: string;
    firstAirDate: string;
    lastAirDate: string;
    episodesWatched: number;
    totalEpisodes: number;
    completed: boolean;
}

const PersonPage: React.FC = () => {

    const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
    const { personId } = useParams<{ personId: string }>();
    const [personData, setPersonData] = useState<PersonResponse | null>(null);
    const [servieWatchState, setServieWatchState] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [blurCompleted, setBlurCompleted] = useState<boolean>(false);

    console.log("PersonPage -> personId: ${personId}");

    useEffect(() => {
        if (personId) {
            axiosInstance.get(`react/person/${personId}`)
                .then((response) => {
                    console.log(response.data.servies[0].posterPath)
                    console.log(response)
                    setPersonData(response.data);
                    setLoading(false);
                    console.log("PersonPage -> useEffect(personId) -> Updated PersonData when api is called");
                })
                .catch((error) => {
                    console.error('Error fetching person data:', error);
                    setLoading(false);
                });
        }
    }, [personId]);

    useEffect(() => {
        if (personData && personData.servies) {
            const watchState = personData.servies.reduce((acc, servie) => {
                acc[`${servie.childtype}-${servie.tmdbId}`] = servie.completed;
                return acc;
            }, {} as { [key: string]: boolean });
            setServieWatchState(watchState);
            console.log("PersonPage -> useEffect(personData) -> Updated servieWatchStates when personData is fetched");
        }
    }, [personData]);

    const toggleWatch = async (tmdbId: number, childtype: string) => {

        const key = `${childtype}-${tmdbId}`;
        const currentCompletedState = servieWatchState[key];
        const newCompletedState = !currentCompletedState;

        setServieWatchState({
            ...servieWatchState,
            [key]: newCompletedState,
        });

        try {
            const response = await axiosInstance.put(`servies/${childtype}/${tmdbId}/toggle`);
            const message = newCompletedState ?
                `Marked ${childtype} as watched successfully !!` :
                `Marked ${childtype} as un-watched successfully !!`
            if (response.status === 200)
                setAlert({ type: "success", message: message });

        } catch (error) {

            setServieWatchState({
                ...servieWatchState,
                [key]: currentCompletedState,
            });
            console.error("PersonPage -> toggleWatch -> Failed to update watch status", error);
            setAlert({ type: "danger", message: "Failed to update watch status !!" });
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!personData) return <div>Person data not found</div>;

    const handleBlurToggle = () => {
        setBlurCompleted(!blurCompleted);
    };

    return (
        <div className="container">

            <div className="row">

                {/* Person's image */}
                <div className="col-4">
                    <img
                        src={`https://www.themoviedb.org/t/p/original/${personData.profilePath}`}
                        alt={personData.name}
                        className="img-fluid d-block rounded"
                    />
                </div>

                {/* Person's details */}
                <div className="col-8">
                    <h1>{personData.name}</h1>
                    <p><strong>Known For:</strong> {personData.knownForDepartment}</p>
                    <p><strong>Gender:</strong> {personData.gender === 1 ? 'Female' : 'Male'}</p>
                    <p><strong>Adult:</strong> {personData.adult ? 'Yes' : 'No'}</p>
                    <p><strong>Popularity:</strong> {personData.popularity}</p>
                    <p><strong>Birthday:</strong> {personData.birthday}</p>
                    <p><strong>Biography:</strong> {personData.biography}</p>
                    <p><strong>Place of Birth:</strong> {personData.birthPlace}</p>
                    <p><strong>Homepage:</strong> <a href={personData.homepage} target="_blank" rel="noopener noreferrer">Visit Homepage</a></p>
                    <p><strong>Last Modified:</strong> {personData.lastModified}</p>
                </div>
            </div>

            {/* Toggle for blurring completed servies */}
            <div className="row my-3">
                <div className="col-12">
                    <label>
                        <input
                            type="checkbox"
                            checked={blurCompleted}
                            onChange={handleBlurToggle}
                        />
                        {' '}Blur watched servies
                    </label>
                </div>
            </div>

            {/* Servies section */}
            <div className="row center">
                {personData.servies.map(servie => {

                    const key = `${servie.childtype}-${servie.tmdbId}`;
                    const isCompleted = servieWatchState[key];

                    return (
                        <div key={key} className="col-xxl-1 custom-col-10 col-sm-2 col-3 image-container poster">

                            {/* Alert Component */}
                            {alert && (
                                <Alert
                                    type={alert.type}
                                    message={alert.message}
                                    onClose={() => setAlert(null)}
                                />
                            )}

                            <div>
                                <img
                                    className={`rounded image-border ${blurCompleted && isCompleted ? 'blurred' : ''}`}
                                    src={`https://www.themoviedb.org/t/p/original${servie.posterPath}`}
                                    alt={servie.title}
                                    onError={(e) => {
                                        e.currentTarget.src = '/src/assets/defaultPoster.png';
                                    }}
                                />
                                <div className="buttons-container rounded">

                                    <Link to='/servie' state={{ childType: "movie", tmdbId: servie.tmdbId }}>
                                        <strong>{servie.title}</strong>
                                    </Link>
                                    <br />
                                    {servie.childtype === 'movie' ? (
                                        <span>{new Date(servie.releaseDate).getFullYear()}</span>
                                    ) : (
                                        <span>{new Date(servie.firstAirDate).getFullYear()} - {servie.lastAirDate ? new Date(servie.lastAirDate).getFullYear() : 'Present'}</span>
                                    )}

                                    <br />

                                    {/* {toggle completed} */}
                                    <a
                                        href="#"
                                        onClick={() => toggleWatch(servie.tmdbId, servie.childtype)}
                                    >
                                        {isCompleted ? (
                                            <i className="bi bi-eye-slash-fill"></i>
                                        ) : (
                                            <i className="bi bi-eye-fill"></i>
                                        )}
                                    </a>
                                    <br />
                                    {servie.childtype === 'tv' && <span>{servie.episodesWatched}/{servie.totalEpisodes}</span>}
                                </div>
                            </div>
                        </div>);
                })}
            </div>
        </div>
    );
};

export default PersonPage;

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./DiscoverySearchPage.module.css";

import axiosInstance from "@/utils/axiosInstance";
import BackdropCard from "@/components/common/BackdropCard/BackdropCard";
import PaginationBar from "@/components/common/PaginationBar/PaginationBar";

import { certifications } from "@/data/certifications";
import { countries } from "@/data/countryList";
import AppHeader from "@/components/common/AppHeader/AppHeader";

interface GenreOption { id: string; label: string; }
interface LanguageOption { id: string; label: string; }
interface Keyword { id: number; name: string; }

interface DiscoveryResult {
	childtype: "movie" | "tv";
	tmdbId: number;
	title: string;
	posterPath: string | null;
	backdropPath: string | null;
	releaseDate: string | null;
	originalLanguage: string | null;
	popularity: number;
	voteAverage: number;
	voteCount: number;
}

interface DiscoveryResponse {
	page: number;
	totalPages: number;
	totalResults: number;
	results: DiscoveryResult[];
}

interface Person {
	childtype: "person";
	tmdbId: number;
	title: string;
	posterPath: string | null;
}

const genreOptions: GenreOption[] = [
	{ id: "28", label: "Action" }, { id: "12", label: "Adventure" },
	{ id: "16", label: "Animation" }, { id: "35", label: "Comedy" },
	{ id: "80", label: "Crime" }, { id: "99", label: "Documentary" },
	{ id: "18", label: "Drama" }, { id: "10751", label: "Family" },
	{ id: "14", label: "Fantasy" }, { id: "36", label: "History" },
	{ id: "27", label: "Horror" }, { id: "10402", label: "Music" },
	{ id: "9648", label: "Mystery" }, { id: "10749", label: "Romance" },
	{ id: "878", label: "Science Fiction" }, { id: "53", label: "Thriller" },
	{ id: "10752", label: "War" }, { id: "37", label: "Western" },
	{ id: "10759", label: "Action & Adventure" }, { id: "10762", label: "Kids" },
	{ id: "10763", label: "News" }, { id: "10764", label: "Reality" },
	{ id: "10765", label: "Sci-Fi & Fantasy" }, { id: "10766", label: "Soap" },
	{ id: "10767", label: "Talk" }, { id: "10770", label: "TV Movie" },
	{ id: "10768", label: "War & Politics" },
];

const disabledGenresForMovie = ["Kids", "News", "Politics", "Reality", "Soap", "Talk"];
const disabledGenresForSeries = ["History", "Horror", "Music", "Romance", "TV Movie", "Thriller"];

const languageOptions: LanguageOption[] = [
	{ id: "en", label: "English" }, { id: "ja", label: "Japanese" },
	{ id: "ko", label: "Korean" }, { id: "fr", label: "French" },
	{ id: "de", label: "German" }, { id: "es", label: "Spanish" },
	{ id: "hi", label: "Hindi" }, { id: "it", label: "Italian" },
	{ id: "zh", label: "Chinese (Mandarin)" }, { id: "ta", label: "Tamil" },
	{ id: "te", label: "Telugu" }, { id: "ml", label: "Malayalam" },
	{ id: "mr", label: "Marathi" }, { id: "kn", label: "Kannada" },
	{ id: "ru", label: "Russian" }, { id: "th", label: "Thai" },
];

const DiscoverySearchPage: React.FC = () => {
	const [type, setType] = useState<"movie" | "tv">("movie");

	const [includedGenres, setIncludedGenres] = useState<string[]>([]);
	const [excludedGenres, setExcludedGenres] = useState<string[]>([]);

	const [includedKeywords, setIncludedKeywords] = useState<number[]>([]);
	const [excludedKeywords, setExcludedKeywords] = useState<number[]>([]);
	const [keywordQuery, setKeywordQuery] = useState("");
	const [keywordResults, setKeywordResults] = useState<Keyword[]>([]);
	const [selectedKeywordNames, setSelectedKeywordNames] = useState<Map<number, string>>(new Map());

	const [language, setLanguage] = useState("");
	const [languageQuery, setLanguageQuery] = useState("");

	const [yearFrom, setYearFrom] = useState("");
	const [yearTo, setYearTo] = useState("");
	const [voteAverageFrom, setVoteAverageFrom] = useState("");
	const [voteAverageTo, setVoteAverageTo] = useState("");
	const [voteCountFrom, setVoteCountFrom] = useState("");
	const [voteCountTo, setVoteCountTo] = useState("");
	const [runtimeFrom, setRuntimeFrom] = useState("");
	const [runtimeTo, setRuntimeTo] = useState("");

	const [certificationCountry, setCertificationCountry] = useState("");

	const [certificationGte, setCertificationGte] = useState("");
	const [certificationLte, setCertificationLte] = useState("");
	const [certification, setCertification] = useState("");

	const [certificationSelectionStart, setCertificationSelectionStart] = useState<number | null>(null);
	const [region, setRegion] = useState("");

	const [sortBy, setSortBy] = useState("popularity");
	const [sortDir, setSortDir] = useState("desc");

	const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResponse | null>(null);
	const [discovering, setDiscovering] = useState(false);
	const resultsRef = useRef<HTMLDivElement>(null);

	const [selectedCast, setSelectedCast] = useState<Person[]>([]);
	const [selectedCrew, setSelectedCrew] = useState<Person[]>([]);

	const [castMatch, setCastMatch] = useState<"AND" | "OR">("OR");
	const [crewMatch, setCrewMatch] = useState<"AND" | "OR">("OR");

	const [castQuery, setCastQuery] = useState("");
	const [crewQuery, setCrewQuery] = useState("");

	const [castResults, setCastResults] = useState<Person[]>([]);
	const [crewResults, setCrewResults] = useState<Person[]>([]);

	const [castLoading, setCastLoading] = useState(false);
	const [crewLoading, setCrewLoading] = useState(false);

	const lastCastApiCallTime = useRef(0);
	const lastCrewApiCallTime = useRef(0);

	const certificationOptions = useMemo(() => {
		if (!certificationCountry) return [];

		return [...(certifications[certificationCountry] ?? [])]
			.sort((a, b) => {
				if (a.order === 0) return -1;
				if (b.order === 0) return 1;
				return a.order - b.order;
			});
	}, [certificationCountry]);

	const handleCertificationCountryChange = (
		country: string
	) => {
		setCertificationCountry(country);

		setCertification("");
		setCertificationGte("");
		setCertificationLte("");
		setCertificationSelectionStart(null);
	};

	const handleCertificationPointClick = (order: number) => {
		const selected = certificationOptions.find((item) => item.order === order);

		if (!selected) return;

		// First click → exact certification
		if (!certificationSelectionStart) {
			setCertificationSelectionStart(order);
			setCertification(selected.certification);
			setCertificationGte("");
			setCertificationLte("");
			return;
		}

		// Clicking the same point → keep exact certification
		if (certificationSelectionStart === order) {
			setCertification(selected.certification);
			setCertificationGte("");
			setCertificationLte("");
			return;
		}

		// Second click → range
		const start = Math.min(certificationSelectionStart, order);
		const end = Math.max(certificationSelectionStart, order);

		const minCertification = certificationOptions.find((item) => item.order === start);
		const maxCertification = certificationOptions.find((item) => item.order === end);

		if (!minCertification || !maxCertification) return;

		setCertification("");
		setCertificationGte(minCertification.certification);
		setCertificationLte(maxCertification.certification);
		setCertificationSelectionStart(null);
	};

	const cooldownPeriod = 3000;

	const availableGenres = useMemo(
		() => genreOptions.filter((genre) => type === "movie"
			? !disabledGenresForMovie.includes(genre.label)
			: !disabledGenresForSeries.includes(genre.label)
		),
		[type]
	);

	const filteredLanguages = useMemo(() => {
		const query = languageQuery.trim().toLowerCase();
		return query ? languageOptions.filter((item) => item.label.toLowerCase().includes(query)) : languageOptions;
	}, [languageQuery]);

	useEffect(() => {
		const query = keywordQuery.trim();
		if (!query) { setKeywordResults([]); return; }
		const timeout = setTimeout(async () => {
			try {
				const response = await axiosInstance.get<Keyword[]>("search/keyword-debound", {
					params: { partialSearchQuery: query },
				});
				setKeywordResults(response.data);
			} catch { setKeywordResults([]); }
		}, 300);
		return () => clearTimeout(timeout);
	}, [keywordQuery]);

	useEffect(() => {
		const delay = setTimeout(() => {
			const trimmedQuery = castQuery.trim();
			const now = Date.now();
			const timeSinceLastCall = now - lastCastApiCallTime.current;

			if (trimmedQuery.length >= 3 && timeSinceLastCall >= cooldownPeriod) {
				setCastLoading(true);
				lastCastApiCallTime.current = now;

				axiosInstance.get<Person[]>(`search/servie-debound?type=person&partialSearchQuery=${encodeURIComponent(trimmedQuery)}`)
					.then((res) => setCastResults(res.data))
					.catch((err) => {
						console.error("Error searching cast:", err);
						setCastResults([]);
					})
					.finally(() => setCastLoading(false));
			} else if (trimmedQuery.length < 3)
				setCastResults([]);
		}, 500);

		return () => clearTimeout(delay);
	}, [castQuery]);

	useEffect(() => {
		const delay = setTimeout(() => {
			const trimmedQuery = crewQuery.trim();
			const now = Date.now();
			const timeSinceLastCall = now - lastCrewApiCallTime.current;

			if (trimmedQuery.length >= 3 && timeSinceLastCall >= cooldownPeriod) {
				setCrewLoading(true);
				lastCrewApiCallTime.current = now;

				axiosInstance.get<Person[]>(`search/servie-debound?type=person&partialSearchQuery=${encodeURIComponent(trimmedQuery)}`)
					.then((res) => setCrewResults(res.data))
					.catch((err) => {
						console.error("Error searching crew:", err);
						setCrewResults([]);
					})
					.finally(() => setCrewLoading(false));
			} else if (trimmedQuery.length < 3)
				setCrewResults([]);
		}, 500);

		return () => clearTimeout(delay);
	}, [crewQuery]);

	const getGenreState = (id: string): "included" | "excluded" | "none" => includedGenres.includes(id)
		? "included"
		: excludedGenres.includes(id)
			? "excluded"
			: "none";

	const cycleGenre = (id: string) => {
		const state = getGenreState(id);
		if (state === "none")
			setIncludedGenres((prev) => [...prev, id]);
		else if (state === "included") {
			setIncludedGenres((prev) => prev.filter((item) => item !== id));
			setExcludedGenres((prev) => [...prev, id]);
		} else
			setExcludedGenres((prev) => prev.filter((item) => item !== id));
	};

	const toggleKeyword = (keyword: Keyword) => {
		const { id, name } = keyword;
		if (includedKeywords.includes(id)) {
			setIncludedKeywords((prev) => prev.filter((item) => item !== id));
			setExcludedKeywords((prev) => [...prev, id]);
		} else if (excludedKeywords.includes(id))
			setExcludedKeywords((prev) => prev.filter((item) => item !== id));
		else
			setIncludedKeywords((prev) => [...prev, id]);

		setSelectedKeywordNames((prev) => {
			const next = new Map(prev);
			if (excludedKeywords.includes(id)) next.delete(id); else next.set(id, name);
			return next;
		});
	};

	const handleTypeChange = (newType: "movie" | "tv") => {
		setType(newType);
		setIncludedGenres([]);
		setExcludedGenres([]);
		setCertificationCountry("");
		setCertification("");
		setCertificationGte("");
		setCertificationLte("");
	};

	const toggleCast = (person: Person) => {
		setSelectedCast((prev) => {
			const exists = prev.some((item) => item.tmdbId === person.tmdbId);

			if (exists)
				return prev.filter((item) => item.tmdbId !== person.tmdbId);

			return [...prev, person];
		});

		// Clear search/dropdown after selection
		setCastQuery("");
		setCastResults([]);
	};

	const toggleCrew = (person: Person) => {
		setSelectedCrew((prev) => {
			const exists = prev.some((item) => item.tmdbId === person.tmdbId);

			if (exists)
				return prev.filter((item) => item.tmdbId !== person.tmdbId);

			return [...prev, person];
		});

		// Clear search/dropdown after selection
		setCrewQuery("");
		setCrewResults([]);
	};

	const handleDiscover = async (page = 1) => {
		const request = {
			type,
			selectedGenres: includedGenres.map(Number),
			rejectedGenres: excludedGenres.map(Number),
			selectedKeywords: includedKeywords,
			rejectedKeywords: excludedKeywords,
			language: language || null,
			selectedCast: selectedCast.map((person) => person.tmdbId),
			selectedCrew: selectedCrew.map((person) => person.tmdbId),
			castMatchIsOr: castMatch === "OR",
			crewMatchIsOr: crewMatch === "OR",
			yearFrom: yearFrom ? Number(yearFrom) : null,
			yearTo: yearTo ? Number(yearTo) : null,
			voteAverageFrom: voteAverageFrom ? Number(voteAverageFrom) : null,
			voteAverageTo: voteAverageTo ? Number(voteAverageTo) : null,
			voteCountFrom: voteCountFrom ? Number(voteCountFrom) : null,
			voteCountTo: voteCountTo ? Number(voteCountTo) : null,
			runtimeFrom: runtimeFrom ? Number(runtimeFrom) : null,
			runtimeTo: runtimeTo ? Number(runtimeTo) : null,
			certificationCountry: certificationCountry || null,
			certification: certification || null,
			certificationFrom: certificationGte || null,
			certificationTo: certificationLte || null,
			region: region || null,
			sortBy,
			sortDir,
			page,
		};

		try {
			setDiscovering(true);
			const response = await axiosInstance.post<DiscoveryResponse>("/discover", request);
			setDiscoveryResults(response.data);
			requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
		} catch (error) {
			console.error("Discovery request failed:", error);
		} finally { setDiscovering(false); }
	};

	const reset = () => {
		setType("movie");

		setIncludedGenres([]);
		setExcludedGenres([]);

		setIncludedKeywords([]);
		setExcludedKeywords([]);
		setKeywordQuery("");
		setSelectedKeywordNames(new Map());

		setLanguage("");
		setLanguageQuery("");

		setYearFrom("");
		setYearTo("");

		setVoteAverageFrom("");
		setVoteAverageTo("");

		setVoteCountFrom("");
		setVoteCountTo("");

		setRuntimeFrom("");
		setRuntimeTo("");

		setSelectedCast([]);
		setSelectedCrew([]);
		setCastQuery("");
		setCrewQuery("");
		setCastResults([]);
		setCrewResults([]);

		setCertificationCountry("");
		setCertification("");
		setCertificationGte("");
		setCertificationLte("");
		setRegion("");

		setSortBy("popularity");
		setSortDir("desc");

		setCastMatch("OR");
		setCrewMatch("OR");

		setDiscoveryResults(null);
	};

	const activeFilters = [
		...includedGenres.map((id) => ({ label: genreOptions.find((g) => g.id === id)?.label ?? id, kind: "include" })),
		...excludedGenres.map((id) => ({ label: `Not ${genreOptions.find((g) => g.id === id)?.label ?? id}`, kind: "exclude" })),
		...includedKeywords.map((id) => ({ label: selectedKeywordNames.get(id) ?? `Keyword #${id}`, kind: "include" })),
		...excludedKeywords.map((id) => ({ label: `Not ${selectedKeywordNames.get(id) ?? `Keyword #${id}`}`, kind: "exclude" })),
		...(language ? [{ label: languageOptions.find((l) => l.id === language)?.label ?? language, kind: "include" }] : []),
		...(yearFrom || yearTo ? [{ label: `Year ${yearFrom || "…"}–${yearTo || "…"}`, kind: "neutral" }] : []),
		...(voteAverageFrom || voteAverageTo ? [{ label: `Rating ${voteAverageFrom || "…"}–${voteAverageTo || "…"}`, kind: "neutral" }] : []),
		...(voteCountFrom || voteCountTo ? [{ label: `Votes ${voteCountFrom || "…"}–${voteCountTo || "…"}`, kind: "neutral" }] : []),
		...(runtimeFrom || runtimeTo ? [{ label: `Runtime ${runtimeFrom || "…"}–${runtimeTo || "…"}m`, kind: "neutral" }] : []),
		...(selectedCast.length > 0
			? [{
				label: `Cast: ${selectedCast.map((p) => p.title).join(", ")}`,
				kind: "neutral"
			}]
			: []),

		...(selectedCrew.length > 0
			? [{
				label: `Crew: ${selectedCrew.map((p) => p.title).join(", ")}`,
				kind: "neutral"
			}]
			: []),
		...(certificationCountry
			? [{
				label: `Certification country: ${certificationCountry}`,
				kind: "neutral",
			}]
			: []),
		...(certification
			? [{
				label: `Certification: ${certification}`,
				kind: "neutral",
			}]
			: certificationGte || certificationLte
				? [{
					label: `Certification: ${certificationGte || "…"}–${certificationLte || "…"}`,
					kind: "neutral",
				}]
				: []),
		...(region ? [{ label: `Region: ${region}`, kind: "neutral" }] : []),
	];

	return (
		<>
			<AppHeader />
			<div className={styles.page}>
				<div className={styles.container}>
					<header className={styles.header}>
						<div className={styles.headerMain}>
							<div className={styles.headerIcon}><i className="bi bi-stars" /></div>
							<div><h1>Discover</h1><p>Find something interesting to watch.</p></div>
						</div>
					</header>

					{/* =========================
						MOVIE-SERIES TOGGLE & ACTIVE FILTERS
					========================= */}
					<div className={styles.topBar}>
						<div className={styles.typeOptions}>
							<button className={`${styles.typeButton} ${type === "movie" ? styles.active : ""}`} onClick={() => handleTypeChange("movie")}>
								<i className="bi bi-film" /> Movies
							</button>
							<button className={`${styles.typeButton} ${type === "tv" ? styles.active : ""}`} onClick={() => handleTypeChange("tv")}>
								<i className="bi bi-tv" /> Series
							</button>
						</div>
						<div className={styles.activeFilters}>
							{activeFilters.length === 0
								? <span className={styles.noFilters}>No filters selected</span>
								: activeFilters.map((filter, index) =>
									<span key={`${filter.label}-${index}`} className={`${styles.activePill} ${styles[filter.kind]}`}>
										{filter.kind === "include" && <i className="bi bi-check" />}
										{filter.kind === "exclude" && <i className="bi bi-x" />}
										{filter.label}
									</span>
								)}
						</div>
					</div>

					<section className={styles.coreFilters}>

						{/* =========================
							GENRES
						========================= */}
						<div className={styles.filterPanel}>
							<div className={styles.panelHeader}>
								<h2><i className="bi bi-tags" /> Genres</h2>
								<span className={styles.selectionCount}>
									{includedGenres.length + excludedGenres.length}
								</span>
							</div>
							<div className={styles.panelSummary}>
								{includedGenres.length + excludedGenres.length ? `${includedGenres.length} included · ${excludedGenres.length} excluded` : "Any genre"}
							</div>
							<div className={styles.panelContent}>
								<div className={styles.genreGrid}>
									{availableGenres.map((genre) => {
										const state = getGenreState(genre.id);
										return <button
											key={genre.id}
											className={`${styles.genrePill} ${state === "included" ? styles.included : state === "excluded" ? styles.excluded : ""}`}
											onClick={() => cycleGenre(genre.id)}>
											{state === "included" && <i className="bi bi-check" />}
											{state === "excluded" && <i className="bi bi-x" />}
											{genre.label}
										</button>;
									})}
								</div>
							</div>
						</div>

						{/* =========================
							KEYWORDS
						========================= */}
						<div className={styles.filterPanel}>
							<div className={styles.panelHeader}>
								<h2><i className="bi bi-hash" /> Keywords</h2>
								<span className={styles.selectionCount}>{includedKeywords.length + excludedKeywords.length}</span>
							</div>
							<div className={styles.panelSummary}>
								{includedKeywords.length + excludedKeywords.length ? `${includedKeywords.length} included · ${excludedKeywords.length} excluded` : "Any keyword"}
							</div>
							<div className={styles.panelContent}>
								<div className={styles.searchBox}>
									<i className="bi bi-search" />
									<input value={keywordQuery} onChange={(e) => setKeywordQuery(e.target.value)} placeholder="Search keywords..." />
								</div>
								<div className={styles.keywordResults}>
									{keywordResults.map((keyword) => {
										const included = includedKeywords.includes(keyword.id);
										const excluded = excludedKeywords.includes(keyword.id);
										return <button key={keyword.id}
											className={`${styles.keywordResult} ${included ? styles.included : excluded ? styles.excluded : ""}`}
											onClick={() => toggleKeyword(keyword)}>
											{included && <i className="bi bi-check" />}
											{excluded && <i className="bi bi-x" />}
											{keyword.name}
										</button>;
									})}
								</div>
								<div className={styles.selectedPills}>
									{includedKeywords.map((id) => <span key={`i-${id}`} className={`${styles.filterPill} ${styles.included}`}>{selectedKeywordNames.get(id) ?? `Keyword #${id}`}
										<button onClick={() => {
											setIncludedKeywords((p) => p.filter((x) => x !== id));
											setSelectedKeywordNames((p) => { const n = new Map(p); n.delete(id); return n; });
										}}>
											<i className="bi bi-x" />
										</button>
									</span>)}
									{excludedKeywords.map((id) => <span key={`e-${id}`} className={`${styles.filterPill} ${styles.excluded}`}>{selectedKeywordNames.get(id) ?? `Keyword #${id}`}
										<button onClick={() => {
											setExcludedKeywords((p) => p.filter((x) => x !== id));
											setSelectedKeywordNames((p) => { const n = new Map(p); n.delete(id); return n; });
										}}>
											<i className="bi bi-x" />
										</button>
									</span>)}
								</div>
							</div>
						</div>

						{/* =========================
							LANGUAGE
						========================= */}
						<div className={styles.filterPanel}>
							<div className={styles.panelHeader}>
								<h2><i className="bi bi-translate" /> Language</h2>
								<span className={styles.selectionCount}>{language ? 1 : 0}</span>
							</div>
							<div className={styles.panelSummary}>
								{language ? languageOptions.find((l) => l.id === language)?.label : "Any language"}
							</div>
							<div className={styles.panelContent}>
								<div className={styles.searchBox}>
									<i className="bi bi-search" />
									<input value={languageQuery} onChange={(e) => setLanguageQuery(e.target.value)} placeholder="Search languages..." />
								</div>
								<div className={styles.languageGrid}>
									{filteredLanguages.map((item) =>
										<button
											key={item.id}
											className={`${styles.languagePill} ${language === item.id ? styles.selected : ""}`}
											onClick={() => setLanguage(language === item.id ? "" : item.id)}>
											{language === item.id && <i className="bi bi-check" />}
											{item.label}
										</button>)}
								</div>
							</div>
						</div>

					</section>

					<section className={styles.refinementGrid}>

						{/* =========================
							RELEASE YEAR
						========================= */}
						<div className={styles.refinementPanel}>
							<div className={styles.panelHeader}>
								<h2><i className="bi bi-calendar3" />
									{type === "movie" ? "Release Year" : "First Air Year"}
								</h2>
							</div>
							<div className={styles.panelSummary}>
								{yearFrom || yearTo ? `${yearFrom || "…"} – ${yearTo || "…"}` : "Any year"}
							</div>
							<div className={styles.panelContent}>
								<div className={styles.rangeInputs}>
									<input type="number" placeholder="From" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} />
									<span>to</span>
									<input type="number" placeholder="To" value={yearTo} onChange={(e) => setYearTo(e.target.value)} />
								</div>
							</div>
						</div>

						{/* =========================
							RATING
						========================= */}
						<div className={styles.refinementPanel}>
							<div className={styles.panelHeader}>
								<h2><i className="bi bi-star" /> Rating</h2>
							</div>
							<div className={styles.panelSummary}>
								{voteAverageFrom || voteAverageTo ? `${voteAverageFrom || "0"} – ${voteAverageTo || "10"}` : "Any rating"}
							</div>
							<div className={styles.panelContent}>
								<div className={styles.rangeInputs}>
									<input type="number" min="0" max="10" step="0.1" placeholder="Min" value={voteAverageFrom} onChange={(e) => setVoteAverageFrom(e.target.value)} />
									<span>to</span>
									<input type="number" min="0" max="10" step="0.1" placeholder="Max" value={voteAverageTo} onChange={(e) => setVoteAverageTo(e.target.value)} />
								</div>
							</div>
						</div>

						{/* =========================
							VOTE COUNT
						========================= */}
						<div className={styles.refinementPanel}>
							<div className={styles.panelHeader}>
								<h2><i className="bi bi-bar-chart" /> Vote Count</h2>
							</div>
							<div className={styles.panelSummary}>{voteCountFrom || voteCountTo ? `${voteCountFrom || "0"} – ${voteCountTo || "∞"}` : "Any vote count"}
							</div>
							<div className={styles.panelContent}>
								<div className={styles.rangeInputs}>
									<input type="number" min="0" placeholder="Min" value={voteCountFrom} onChange={(e) => setVoteCountFrom(e.target.value)} />
									<span>to</span>
									<input type="number" min="0" placeholder="Max" value={voteCountTo} onChange={(e) => setVoteCountTo(e.target.value)} />
								</div>
							</div>
						</div>

						{/* =========================
							(MOVIE) RUNTIME
						========================= */}
						{type === "movie" && <div className={styles.refinementPanel}>
							<div className={styles.panelHeader}>
								<h2><i className="bi bi-clock" /> Runtime</h2>
							</div>
							<div className={styles.panelSummary}>{runtimeFrom || runtimeTo ? `${runtimeFrom || "0"} – ${runtimeTo || "∞"} min` : "Any runtime"}
							</div>
							<div className={styles.panelContent}>
								<div className={styles.rangeInputs}>
									<input type="number" min="0" placeholder="Min" value={runtimeFrom} onChange={(e) => setRuntimeFrom(e.target.value)} />
									<span>to</span>
									<input type="number" min="0" placeholder="Max" value={runtimeTo} onChange={(e) => setRuntimeTo(e.target.value)} />
								</div>
							</div>
						</div>}

						{/* =========================
							PEOPLE
						========================= */}
						<div className={styles.refinementPanel}>
							<div className={styles.panelHeader}>
								<h2><i className="bi bi-people" />People</h2>
							</div>

							{/* Collapsed summary */}
							<div className={styles.panelSummary}>

								{selectedCast.length === 0 && selectedCrew.length === 0 ? (
									<span>Any cast / crew</span>
								) : (
									<div className={styles.peopleSummary}>

										{selectedCast.length > 0 && (
											<div className={styles.peopleSummaryGroup}>
												<span className={styles.peopleSummaryLabel}>
													Cast · {castMatch}
												</span>

												<span className={styles.peopleSummaryNames}>
													{selectedCast.slice(0, 3).map((person) => (
														<span key={person.tmdbId}>
															{person.title}
														</span>
													))}

													{selectedCast.length > 3 && (
														<span>
															+{selectedCast.length - 3}
														</span>
													)}
												</span>
											</div>
										)}

										{selectedCrew.length > 0 && (
											<div className={styles.peopleSummaryGroup}>
												<span className={styles.peopleSummaryLabel}>
													Crew · {crewMatch}
												</span>

												<span className={styles.peopleSummaryNames}>
													{selectedCrew.slice(0, 3).map((person) => (
														<span key={person.tmdbId}>
															{person.title}
														</span>
													))}

													{selectedCrew.length > 3 && (
														<span>
															+{selectedCrew.length - 3}
														</span>
													)}
												</span>
											</div>
										)}
									</div>
								)}
							</div>

							<div className={styles.panelContent}>

								{/* =========================
								CAST
							========================= */}

								<div className={styles.peopleGroup}>
									<div className={styles.peopleGroupHeader}>
										<h3>Cast</h3>
										<div className={styles.matchToggle}>
											<button
												type="button"
												className={castMatch === "OR" ? styles.active : ""}
												onClick={() => setCastMatch("OR")}
											>
												OR
											</button>

											<button
												type="button"
												className={castMatch === "AND" ? styles.active : ""}
												onClick={() => setCastMatch("AND")}
											>
												AND
											</button>
										</div>
									</div>

									<div className={styles.searchResultsWrapper}>
										<div className={styles.searchBox}>
											<i className="bi bi-search" />
											<input
												type="text"
												value={castQuery}
												onChange={(e) => setCastQuery(e.target.value)}
												placeholder="Search cast..."
											/>
										</div>

										{castLoading && castQuery.trim().length >= 3 && (
											<div className={styles.peopleStatus}>
												<i className="bi bi-arrow-repeat" />
												Searching...
											</div>
										)}

										{!castLoading &&
											castQuery.trim().length >= 3 &&
											castResults.length === 0 && (
												<div className={styles.peopleStatus}>
													No people found.
												</div>
											)}

										{castResults.length > 0 && (
											<div className={styles.peopleResults}>
												{castResults.map((person) => {
													const selected = selectedCast.some((item) => item.tmdbId === person.tmdbId);
													return (
														<button
															key={person.tmdbId}
															type="button"
															className={`${styles.personResult} ${selected ? styles.selected : ""}`}
															onClick={() => toggleCast(person)}
														>
															<div className={styles.personResultPoster}>
																{person.posterPath ? (
																	<img src={`https://image.tmdb.org/t/p/w92${person.posterPath}`} />
																) : (
																	<i className="bi bi-person" />
																)}
															</div>

															<span>{person.title}</span>

															{selected && (<i className="bi bi-check-circle-fill" />)}
														</button>
													);
												})}
											</div>
										)}
									</div>

									{selectedCast.length > 0 && (
										<div className={styles.peoplePills}>

											{selectedCast.map((person) => (
												<span
													key={person.tmdbId}
													className={`${styles.filterPill} ${styles.included}`}
												>
													{person.title}

													<button
														type="button"
														onClick={() => toggleCast(person)}
													>
														<i className="bi bi-x" />
													</button>
												</span>
											))}
										</div>
									)}
								</div>


								{/* =========================
								CREW
							========================= */}

								<div className={styles.peopleGroup}>
									<div className={styles.peopleGroupHeader}>
										<h3>Crew</h3>
										<div className={styles.matchToggle}>
											<button
												type="button"
												className={crewMatch === "OR" ? styles.active : ""}
												onClick={() => setCrewMatch("OR")}
											>
												OR
											</button>

											<button
												type="button"
												className={crewMatch === "AND" ? styles.active : ""}
												onClick={() => setCrewMatch("AND")}
											>
												AND
											</button>
										</div>
									</div>

									<div className={styles.searchResultsWrapper}>

										<div className={styles.searchBox}>
											<i className="bi bi-search" />
											<input
												type="text"
												value={crewQuery}
												onChange={(e) => setCrewQuery(e.target.value)}
												placeholder="Search crew..."
											/>
										</div>

										{crewLoading && crewQuery.trim().length >= 3 && (
											<div className={styles.peopleStatus}>
												<i className="bi bi-arrow-repeat" />
												Searching...
											</div>
										)}

										{!crewLoading &&
											crewQuery.trim().length >= 3 &&
											crewResults.length === 0 && (
												<div className={styles.peopleStatus}>
													No people found.
												</div>
											)}

										{crewResults.length > 0 && (
											<div className={styles.peopleResults}>

												{crewResults.map((person) => {
													const selected = selectedCrew.some(
														(item) => item.tmdbId === person.tmdbId
													);

													return (
														<button
															key={person.tmdbId}
															type="button"
															className={`${styles.personResult} ${selected ? styles.selected : ""
																}`}
															onClick={() => toggleCrew(person)}
														>

															<div className={styles.personResultPoster}>
																{person.posterPath ? (
																	<img
																		src={`https://image.tmdb.org/t/p/w92${person.posterPath}`}
																		alt=""
																	/>
																) : (
																	<i className="bi bi-person" />
																)}
															</div>

															<span>{person.title}</span>

															{selected && (
																<i className="bi bi-check-circle-fill" />
															)}

														</button>
													);
												})}

											</div>
										)}

									</div>


									{selectedCrew.length > 0 && (
										<div className={styles.peoplePills}>

											{selectedCrew.map((person) => (
												<span
													key={person.tmdbId}
													className={`${styles.filterPill} ${styles.included}`}
												>
													{person.title}

													<button
														type="button"
														onClick={() => toggleCrew(person)}
													>
														<i className="bi bi-x" />
													</button>
												</span>
											))}

										</div>
									)}

								</div>

							</div>
						</div>

						{/* =========================
							CERTIFICATION
						========================= */}
						<div className={`${styles.refinementPanel} ${styles.certificationPanel}`}>

							<div className={styles.panelHeader}>
								<h2>
									<i className="bi bi-patch-check" />
									Certification
								</h2>
							</div>

							<div className={styles.panelSummary}>
								{certificationCountry
									? countries.find((country) => country.code === certificationCountry)?.name ?? certificationCountry
									: "Any country"}
							</div>

							<div className={styles.panelContent}>

								{/* =========================
								COUNTRY
							========================= */}

								<select
									value={certificationCountry}
									onChange={(e) => handleCertificationCountryChange(e.target.value)}
								>
									<option value="">Country</option>
									{countries.map((country) => (
										<option
											key={country.code}
											value={country.code}
										>
											{country.name} ({country.code})
										</option>
									))}
								</select>

								{certificationCountry &&
									certificationOptions.length > 0 && (
										<div className={styles.certificationSlider}>
											<div className={styles.certificationRail}>

												{/* Selected range */}
												{certificationGte &&
													certificationLte && (
														<div
															className={styles.certificationRange}
															style={{
																left: `${(certificationOptions.findIndex((item) => item.certification === certificationGte) / (certificationOptions.length - 1)) * 100}%`,
																right: `${100 - (certificationOptions.findIndex((item) => item.certification === certificationLte) / (certificationOptions.length - 1)) * 100}%`,
															}}
														/>
													)}

												{/* Exact certification */}
												{certification && (
													<div
														className={styles.certificationRange}
														style={{
															left: `${(certificationOptions.findIndex((item) => item.certification === certification) / (certificationOptions.length - 1)) * 100}%`,
															right: `${100 - (certificationOptions.findIndex((item) => item.certification === certification) / (certificationOptions.length - 1)) * 100}%`,
														}}
													/>
												)}

												{/* First selection */}
												{certificationSelectionStart !== null && (
													<div
														className={styles.certificationRange}
														style={{
															left: `${(certificationOptions.findIndex((item) => item.order === certificationSelectionStart) / (certificationOptions.length - 1)) * 100}%`,
															width: "0",
														}}
													/>
												)}

												{/* Clickable certification points */}
												<div className={styles.certificationPoints}>
													{certificationOptions.map((item) => {
														const selectedExact = certification === item.certification;
														const selectedGte = certificationGte === item.certification;
														const selectedLte = certificationLte === item.certification;
														const isStart = certificationSelectionStart === item.order;
														const minOrder = certificationOptions.find((cert) => cert.certification === certificationGte)?.order ?? 0;
														const maxOrder = certificationOptions.find((cert) => cert.certification === certificationLte)?.order ?? 0;
														const isInRange =
															!!certificationGte &&
															!!certificationLte &&
															item.order >= minOrder &&
															item.order <= maxOrder;

														return (
															<button
																type="button"
																key={item.certification}
																className={`${styles.certificationPoint} ${selectedExact || selectedGte || selectedLte || isStart
																	? styles.selected
																	: ""
																	} ${isInRange ? styles.inRange : ""}`}
																onClick={() => handleCertificationPointClick(item.order)}
															>
																<span className={styles.certificationDot} />

																<span className={styles.certificationTooltip}>
																	<strong>{item.certification}</strong>
																	<span>{item.meaning}</span>
																</span>
															</button>
														);
													})}
												</div>

											</div>


											{/* Certification labels */}

											<div
												className={styles.certificationLabels}
												style={{
													"--cert-count":
														certificationOptions.length,
												} as React.CSSProperties}
											>
												{certificationOptions.map((item) => {

													const active =
														certification ===
														item.certification ||
														certificationGte ===
														item.certification ||
														certificationLte ===
														item.certification ||
														certificationSelectionStart ===
														item.order;

													return (
														<span
															key={item.certification}
															className={active ? styles.active : ""}
														>
															{item.certification}
														</span>
													);
												})}
											</div>

										</div>
									)}
							</div>

						</div>

						{/* =========================
							REGION
						========================= */}
						<div className={styles.refinementPanel}>

							<div className={styles.panelHeader}>
								<h2>
									<i className="bi bi-globe2" />
									Region
								</h2>
							</div>

							<div className={styles.panelSummary}>
								{region
									? countries.find((country) => country.code === region)?.name ?? region
									: "Any region"}
							</div>

							<div className={styles.panelContent}>

								<select
									value={region}
									onChange={(e) => setRegion(e.target.value)}
								>
									<option value="">
										Any region
									</option>

									{countries.map((country) => (
										<option
											key={country.code}
											value={country.code}
										>
											{country.name} ({country.code})
										</option>
									))}
								</select>

							</div>

						</div>

						{/* =========================
							SORTING
						========================= */}
						<div className={styles.refinementPanel}>
							<div className={styles.panelHeader}>
								<h2><i className="bi bi-sort-down" /> Sort</h2>
							</div>
							<div className={styles.panelSummary}>{sortBy} · {sortDir === "desc" ? "High → Low" : "Low → High"}
							</div>
							<div className={styles.panelContent}>
								<select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
									<option value="popularity">Popularity</option>
									<option value="voteAverage">Rating</option>
									<option value="voteCount">Vote Count</option>
									<option value="primaryReleaseDate">Release Date</option>
									{type === "movie" && <option value="revenue">Revenue</option>}
									{type === "tv" && <option value="name">Name</option>}
								</select>
								<button className={styles.sortDirection} onClick={() => setSortDir((p) => p === "asc" ? "desc" : "asc")}>
									<i className={`bi ${sortDir === "asc" ? "bi-sort-up" : "bi-sort-down"}`} />{sortDir === "asc" ? "Ascending" : "Descending"}
								</button>
							</div>
						</div>

					</section>

					{/* =========================
						FORM ACTION BUTTONS
					========================= */}
					<div className={styles.actions}>
						<button className={styles.resetButton} onClick={reset}>
							<i className="bi bi-arrow-counterclockwise" /> Reset
						</button>
						<button className={styles.discoverButton} onClick={() => handleDiscover()} disabled={discovering}>
							<i className="bi bi-stars" /> {discovering ? "Discovering…" : "Discover"}
						</button>
					</div>

					{/* =========================
						RESULTS
					========================= */}
					{discoveryResults &&
						<div ref={resultsRef} className={styles.resultsSection}>
							<div className={styles.resultsHeader}>
								<div>
									<h2>Results</h2>
									<span>{discoveryResults.totalResults.toLocaleString()} matches</span>
								</div>
								<span>Page {discoveryResults.page} of {discoveryResults.totalPages}</span>
							</div>
							{discoveryResults.results.length ?
								<div className={styles.grid}>
									{discoveryResults.results.map((item) =>
										<BackdropCard
											key={`${item.childtype}-${item.tmdbId}`}
											{...item}
											genres={[]}
											genreIds={[]}
											watched={false}
											liked={false}
											rated={null}
											review={null}
											totalEpisodes={null}
										/>)}
								</div> :
								<div className={styles.noResults}>No results found.</div>
							}

							{/* =========================
							PAGINATION
						========================= */}
							{discoveryResults.totalPages > 1 &&
								<PaginationBar
									pageNumber={discoveryResults.page - 1}
									totalPages={discoveryResults.totalPages}
									onPageChange={(page) => handleDiscover(page + 1)}
								/>
							}
						</div>
					}
				</div>
			</div>
		</>
	);
};

export default DiscoverySearchPage;

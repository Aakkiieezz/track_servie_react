import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './NavBar.module.css';

interface Props {
	label: "SEASON" | "EPISODE";
	tmdbId: number;
	current: number;
	total: number;
	hasSpecials?: boolean;
	seasonNo?: number;
}

const NavBar: React.FC<Props> = ({ label, tmdbId, current: currentSeasonNo, total: totalSeasons, hasSpecials, seasonNo }) => {
	const navigate = useNavigate();
	useParams<{ seasonNo: string; }>();

	const navigateTo = (number: number) => {
		if (label === "SEASON")
			navigate(`/servies/${tmdbId}/Season/${number}`);
		else
			navigate(`/servies/${tmdbId}/Season/${seasonNo}/Episode/${number}`);

	};

	return (
		<nav className={styles.nav}>
			<span className={styles.label}>{label}</span>
			{hasSpecials && (
				<span
					role="button"
					tabIndex={0}
					className={currentSeasonNo === 0 ? styles.active : styles.inactive}
					onClick={() => navigateTo(0)}
					onKeyDown={(e) => e.key === "Enter" && navigateTo(0)}
				>
					Specials
				</span>
			)}

			{Array.from({ length: totalSeasons }, (_, index) => index + 1).map((number) => (
				<span
					key={number}
					role="button"
					tabIndex={0}
					className={number === currentSeasonNo ? styles.active : styles.inactive}
					onClick={() => navigateTo(number)}
					onKeyDown={(e) => e.key === "Enter" && navigateTo(number)}
				>
					{number}
				</span>
			))}
		</nav>
	);
};

export default NavBar;
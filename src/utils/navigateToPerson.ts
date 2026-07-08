import type { NavigateFunction } from 'react-router-dom';
import type { PartialPersonData } from '@/pages/PersonPage'; // adjust path

export function navigateToPerson(
    navigate: NavigateFunction,
    person: PartialPersonData
) {
    navigate(`/person/${person.id}`, {
        state: { personData: person },
    });
}
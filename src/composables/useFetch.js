import { base_url } from '../utils';
export function useFetch(start_date) {
    return fetch(`${base_url}receive_week?start_date=${start_date}`)
        .then((response) => response.json())
        .then((data) => data)
        .catch((err) => console.log(err));
}

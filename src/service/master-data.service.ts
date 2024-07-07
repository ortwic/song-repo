import { map } from 'rxjs';
import FirestoreService from './firestore.service';

export type WithId = { id: string };

const createStore = (path: string, groupBy?: string[], project?: <T>(data: T[]) => T[]) => {
    const store = new FirestoreService(path, 'id');
    return {
        store,
        groupBy,
        docs: <T>() => {
            const result = store.getDocumentStream<T>();
            return project ? result.pipe(map((data) => project(data))) : result;
        },
        update: <T extends WithId>(data: T[]) => {
            return store.setDocuments(data, { merge: true });
        }
    };
};

const toIdKeyValue = <T>(entry: T) => Object.keys(entry).filter(key => key !== 'id').map(key => ({ 
    key, 
    value: entry[key],
    id: entry['id'], 
} as T));

export default {
    Genres: createStore('genres'),
    Events: createStore('events'),
    Feedback: createStore('feedback'),
    Settings: createStore('settings', ['id'], (data) => (data.flatMap(toIdKeyValue))),
};
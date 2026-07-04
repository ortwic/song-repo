import { act, fireEvent, render, waitFor, within } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Artist, Song, UserSong } from '../../model/song.model';
import EditSongDialog from './EditSongDialog.svelte';

const { mockHasUser, mockLogAction, mockFindArtists, mockFindTitles, mockFindGenres, mockFindStyles } =
    vi.hoisted(() => ({
        mockHasUser: vi.fn(() => true),
        mockLogAction: vi.fn(),
        mockFindArtists: vi.fn(() => Promise.resolve([])),
        mockFindTitles: vi.fn(() => Promise.resolve([])),
        mockFindGenres: vi.fn(() => Promise.resolve([])),
        mockFindStyles: vi.fn(() => Promise.resolve([]))
    }));

vi.mock('../../store/notification.store', () => ({
    logAction: mockLogAction
}));

vi.mock('../../service/base/app-cache.setup', () => ({
    refData: {
        genres: [],
    },
}));

vi.mock('../../service/user/user-song.service', () => ({
    default: vi.fn().mockImplementation(function (this: { hasUser: typeof mockHasUser }) {
        this.hasUser = mockHasUser;
    })
}));

vi.mock('../../service/catalog/search.service', () => ({
    createSearchService: vi.fn(() => ({
        findArtists: mockFindArtists,
        findTitles: mockFindTitles,
        findGenres: mockFindGenres,
        findStyles: mockFindStyles
    }))
}));

function findListItemByText(text: string): HTMLElement {
    const items = document.querySelectorAll('.autocomplete-list-item');
    const match = Array.from(items).find((el) => el.textContent?.includes(text));
    if (!match) {
        throw new Error(`No .autocomplete-list-item found containing "${text}"`);
    }
    return match as HTMLElement;
}

describe('EditSongDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockHasUser.mockReturnValue(true);
    });

    it('renders the confirm button once the dialog is opened', async () => {
        const { component, getByRole } = render(EditSongDialog);

        await act(() => {
            // don't await dialog result
            component.showDialog();
        });

        expect(getByRole('button', { name: 'dialog.confirm' })).toBeInTheDocument();
    });

    it('displays props of an existing song', async () => {
        const existingSong: Partial<UserSong> = {
            id: 'song-1',
            artist: 'Dave Brubeck',
            title: 'Take Five',
            genre: 'Jazz',
            style: 'Cool Jazz',
            difficulty: 8,
            bpm: 156,
            key: 'Eb',
            time: '5/4',
            features: [],
            tags: ['Live', 'Favorite'],
            notes: 'Focus on the guitar solo'
        };
        const { component, container, getByPlaceholderText, getByText } = render(EditSongDialog);

        await act(() => {
            // don't await dialog result
            component.showDialog(existingSong);
        });

        const generalExpand = getByText('songs.sections.song-general');
        expect(generalExpand).not.toBeNull();
        fireEvent.click(generalExpand);

        const artistInput = getByPlaceholderText('songs.columns.artist') as HTMLInputElement;
        expect(artistInput).not.toBeNull();
        expect(artistInput.value).toBe(existingSong.artist);

        const titleInput = getByPlaceholderText('songs.columns.title') as HTMLInputElement;
        expect(titleInput).not.toBeNull();
        expect(titleInput.value).toBe(existingSong.title);

        const genreInput = getByPlaceholderText('songs.columns.genre') as HTMLInputElement;
        expect(genreInput).not.toBeNull();
        expect(genreInput.value).toBe(existingSong.genre);

        const styleInput = getByPlaceholderText('songs.columns.style') as HTMLInputElement;
        expect(styleInput).not.toBeNull();
        expect(styleInput.value).toBe(existingSong.style);

        const detailsExpand = getByText('songs.sections.song-general');
        expect(detailsExpand).not.toBeNull();
        fireEvent.click(detailsExpand);

        const keyInput = container.querySelector('#edit-key') as HTMLInputElement;
        expect(keyInput).not.toBeNull();
        expect(keyInput.value).toBe(existingSong.key);

        const bpmInput = container.querySelector('#edit-bpm') as HTMLInputElement;
        expect(bpmInput).not.toBeNull();
        expect(bpmInput.value).toBe(existingSong.bpm.toString());
        
        const timeInput = container.querySelector('#edit-time') as HTMLInputElement;
        expect(timeInput).not.toBeNull();
        expect(timeInput.value).toBe(existingSong.time);
        
        const difficultyInput = container.querySelector('#edit-difficulty') as HTMLInputElement;
        expect(difficultyInput).not.toBeNull();
        expect(difficultyInput.valueAsNumber).toBe(existingSong.difficulty);

        const tagsGroup = getByText('songs.columns.tags').closest('.group');
        expect(tagsGroup).not.toBeNull();
        const tagValues = within(tagsGroup as HTMLElement)
            .getAllByRole('textbox')
            .map((el) => el.textContent?.trim());
        expect(tagValues).toEqual(['Live', 'Favorite']);

        const notesGroup = getByText('songs.columns.notes').closest('.group');
        expect(notesGroup).not.toBeNull();
        const notesField = within(notesGroup as HTMLElement).getByRole('textbox') as HTMLTextAreaElement;
        expect(notesField.value).toBe('Focus on the guitar solo');
    });

    it('adopts artist and title from a catalog search result', async () => {
        const catalogArtist = {
            artistMbid: 'artist-1',
            names: ['Queen'],
            genre: 'Rock',
            style: 'Arena Rock',
            country: 'UK'
        } as Artist;
        const catalogSong = {
            title: 'Bohemian Rhapsody',
            artist: 'Queen',
            artistMbid: 'artist-1',
            genre: 'Rock',
            style: 'Arena Rock',
            bpm: 120,
            key: 'G',
            time: '4/4',
            difficulty: 9,
            features: []
        } as Song;
        mockFindArtists.mockResolvedValue([catalogArtist]);
        mockFindTitles.mockResolvedValue([catalogSong]);

        const { component, getByPlaceholderText, findByPlaceholderText, getByRole } = render(EditSongDialog);
        let resultPromise: ReturnType<typeof component.showDialog>;
        await act(() => {
            resultPromise = component.showDialog();
        });

        const artistInput = getByPlaceholderText('songs.columns.artist') as HTMLInputElement;
        await fireEvent.input(artistInput, { target: { value: 'Queen' } });
        await waitFor(() => findListItemByText('Queen'), { timeout: 2000 });
        await fireEvent.click(findListItemByText('Queen'));

        const titleInput = await findByPlaceholderText('songs.columns.title');
        await fireEvent.input(titleInput, { target: { value: 'Bohemian' } });

        await waitFor(() => findListItemByText('Bohemian Rhapsody'), { timeout: 2000 });
        await fireEvent.click(findListItemByText('Bohemian Rhapsody'));

        await fireEvent.click(getByRole('button', { name: 'dialog.confirm' }));
        const resolvedSong = await resultPromise;

        expect(mockFindArtists.mock.calls.length, 'findArtists should be called').toBe(1);
        expect(resolvedSong?.artist).toBe('Queen');
        expect(mockFindTitles.mock.calls.length, 'findTitles should be called').toBe(1);
        expect(resolvedSong?.title).toBe('Bohemian Rhapsody');
        expect(resolvedSong?.genre).toBe('Rock');
        expect(resolvedSong?.style).toBe('Arena Rock');
        expect(resolvedSong?.bpm).toBe(120);
        expect(resolvedSong?.key).toBe('G');
        expect(resolvedSong?.time).toBe('4/4');
        expect(resolvedSong?.difficulty).toBe(9);
    });

    it('saves a freely typed song that was not selected from the catalog', async () => {
        const { component, container, getByPlaceholderText, getByRole } = render(EditSongDialog);
        let resultPromise: ReturnType<typeof component.showDialog>;
        await act(() => {
            resultPromise = component.showDialog();
        });

        const artistInput = getByPlaceholderText('songs.columns.artist') as HTMLInputElement;
        await fireEvent.input(artistInput, { target: { value: 'Custom Artist' } });
        
        const titleInput = getByPlaceholderText('songs.columns.title') as HTMLInputElement;
        await fireEvent.input(titleInput, { target: { value: 'Custom Title' } });
        
        const genreInput = getByPlaceholderText('songs.columns.genre') as HTMLInputElement;
        await fireEvent.input(genreInput, { target: { value: 'Custom Genre' } });
        
        const styleInput = getByPlaceholderText('songs.columns.style') as HTMLInputElement;
        await fireEvent.input(styleInput, { target: { value: 'Custom Style' } });
        
        const form = container.querySelector('form') as HTMLFormElement;
        const invalidFields = Array.from(form.elements)
            .filter((el): el is HTMLInputElement => 'validity' in el && !(el as HTMLInputElement).validity.valid)
            .map((el) => ({
                name: el.name || el.id || el.getAttribute('placeholder'),
                validationMessage: (el as HTMLInputElement).validationMessage,
                value: (el as HTMLInputElement).value
            }));
        expect(form.checkValidity(), invalidFields.join(', ')).toBe(true);

        const confirmButton = getByRole('button', { name: 'dialog.confirm' });
        await fireEvent.click(confirmButton);
        
        const resolvedSong = await resultPromise;
        expect(resolvedSong?.artist).toBe('Custom Artist');
        expect(resolvedSong?.title).toBe('Custom Title');
        expect(resolvedSong?.genre).toBe('Custom Genre');
        expect(resolvedSong?.style).toBe('Custom Style');
    });
});
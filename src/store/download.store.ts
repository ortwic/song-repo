import type { DownloadOptions, DownloadType } from 'tabulator-tables';
import { ArrayStore } from './array.class';

export type DowloadItem = {
    type: DownloadType,
    params?: DownloadOptions
};

export const downloadQueue = new ArrayStore<DowloadItem>();

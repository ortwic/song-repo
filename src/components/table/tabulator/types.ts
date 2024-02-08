import type { ColumnDefinition as TabulatorColumnDefinition } from 'tabulator-tables';

export interface ColumnDefinition extends TabulatorColumnDefinition {
    groupByFunc?(data: unknown): string;
}
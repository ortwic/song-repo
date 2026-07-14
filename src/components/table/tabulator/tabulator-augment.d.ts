import 'tabulator-tables';

declare module 'tabulator-tables' {
    interface Module {
        langBind(key: string, callback: (text: string) => void): void;
        layoutMode(): string;
    }
}
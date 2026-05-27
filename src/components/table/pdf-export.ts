import type { Tabulator } from 'tabulator-tables';
import { t } from 'svelte-i18n';
import { get } from 'svelte/store';
import { getCssVariable } from '../../styles/style.helper';

const PDF_COLUMNS = [
    { header: 'Artist',     field: 'artist',     width: 40 },
    { header: 'Title',      field: 'title',       width: 50 },
    { header: 'Genre',      field: 'genre',       width: 28 },
    { header: 'Style',      field: 'style',       width: 28 },
    { header: 'Key',        field: 'key',         width: 18 },
    { header: 'Time',       field: 'time',        width: 16 },
    { header: 'BPM',        field: 'bpm',         width: 16 },
    { header: 'Features',   field: 'features',    width: 40 },
    { header: 'Tags',        field: 'tags',         width: 50 },
] as const;

export async function exportTableToPdf(table: Tabulator, title: string): Promise<void> {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
    ]);

    const translate = get(t);
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const rows = table.getData('active'); // respects current filters/sorting

    const head = [PDF_COLUMNS.map(col => col.header)];
    const body = rows.map(row =>
        PDF_COLUMNS.map(col => row[col.field] ?? '')
    );

    // Title
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 12);

    autoTable(doc, {
        head,
        body,
        startY: 18,
        margin: { left: 14, right: 14 },
        tableWidth: 'auto',
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'ellipsize',
            valign: 'middle',
        },
        headStyles: {
            fillColor: getCssVariable('--accent'),
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [245, 245, 250],
        },
        columnStyles: Object.fromEntries(
            PDF_COLUMNS.map((col, index) => [index, { cellWidth: col.width }])
        )
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `${translate('common.page')}  ${i} / ${totalPages}`,
            doc.internal.pageSize.getWidth() - 14,
            doc.internal.pageSize.getHeight() - 6,
            { align: 'right' }
        );
    }

    doc.save(`${title}.pdf`);
}
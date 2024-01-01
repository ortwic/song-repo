import type { CellComponent, Tabulator } from 'tabulator-tables';
import Module from 'tabulator-tables/src/js/core/Module';

type Formatter = (data: CollapsedCellData[]) => HTMLElement;

export interface CollapsedCellData { 
    field: string;
    title: string; 
    value: string | HTMLElement;
}

export default class ResponsiveLayout extends Module{
    static moduleName = 'responsiveLayout';

    private columns = [];
    private hiddenColumns = [];
    private mode: boolean | 'hide' | 'collapse';
    private index = 0;
    private collapseFormatter: Formatter = () => (undefined);
    private collapseStartOpen = true;
    private collapseHandleColumn: { show: () => void; hide: () => void; };

    constructor(private table: Tabulator){
        super(table);

        super.registerTableOption('responsiveLayout', false); //responsive layout flags
        super.registerTableOption('responsiveLayoutCollapseStartOpen', true); //start showing collapsed data
        super.registerTableOption('responsiveLayoutCollapseUseFormatters', true); //responsive layout collapse formatter
        super.registerTableOption('responsiveLayoutCollapseFormatter', false); //responsive layout collapse formatter

        super.registerColumnOption('responsive');
    }

    //generate responsive columns list
    initialize(){
        if(this.table.options.responsiveLayout){
            super.subscribe('column-layout', this.initializeColumn.bind(this));
            super.subscribe('column-show', this.updateColumnVisibility.bind(this));
            super.subscribe('column-hide', this.updateColumnVisibility.bind(this));
            super.subscribe('columns-loaded', this.initializeResponsivity.bind(this));
            super.subscribe('column-moved', this.initializeResponsivity.bind(this));
            super.subscribe('column-add', this.initializeResponsivity.bind(this));
            super.subscribe('column-delete', this.initializeResponsivity.bind(this));

            super.subscribe('table-redrawing', this.tableRedraw.bind(this));

            if(this.table.options.responsiveLayout === 'collapse'){
                super.subscribe('row-data-changed', this.generateCollapsedRowContent.bind(this));
                super.subscribe('row-init', this.initializeRow.bind(this));
                super.subscribe('row-layout', this.layoutRow.bind(this));
            }
        }
    }

    tableRedraw = (force) => {
        if(['fitColumns', 'fitDataStretch'].indexOf(super.layoutMode()) === -1){
            if(!force){
                this.update();
            }
        }
    };

    initializeResponsivity(){
        this.mode = this.table.options.responsiveLayout;
        this.collapseFormatter = this.table.options.responsiveLayoutCollapseFormatter || this.defaultFormatter;
        this.collapseStartOpen = this.table.options.responsiveLayoutCollapseStartOpen;
        this.hiddenColumns = [];

        //determine level of responsivity for each column
        const columns = this.table.columnManager.columnsByIndex
            .filter(c => c.modules.responsive?.order && c.modules.responsive.visible)
            .map((column, i) => {
                column.modules.responsive.index = i;
                return column;
            });

        if (this.mode === 'collapse') {
            this.hiddenColumns = columns.filter(c => !c?.visible);
        }

        this.columns = this.sortListByResponsivity(columns);

        if(this.mode === 'collapse'){
            this.generateCollapsedContent();
        }

        //assign collapse column
        this.collapseHandleColumn = this.table.columnManager.columns.find(c => c.definition.formatter == 'responsiveCollapse');
        if(this.collapseHandleColumn){
            if(this.hiddenColumns.length){
                this.collapseHandleColumn.show();
            }else{
                this.collapseHandleColumn.hide();
            }
        }
    }

    sortListByResponsivity = (columns) => {
        return columns.reverse().sort((a, b) => {
            const diff = b.modules.responsive.order - a.modules.responsive.order;
            return diff || (b.modules.responsive.index - a.modules.responsive.index);
        });
    };

    //define layout information
    initializeColumn(column){
        const def = column.getDefinition();

        column.modules.responsive = {
            order: typeof def.responsive === 'undefined' ? 1 : def.responsive, 
            visible: def.visible === false ? false : true
        };
    }

    initializeRow(row){
        if(row.type !== 'calc'){
            const collapseEl = document.createElement('div');
            collapseEl.classList.add('tabulator-responsive-collapse');

            row.modules.responsiveLayout = {
                element: collapseEl,
                open: this.collapseStartOpen,
            };

            if(this.collapseStartOpen){
                collapseEl.classList.add('open');
            }
        }
    }

    layoutRow(row){
        const rowEl = row.getElement();

        if(row.modules.responsiveLayout){
            rowEl.appendChild(row.modules.responsiveLayout.element);
            this.generateCollapsedRowContent(row);
        }
    }

    //update column visibility
    updateColumnVisibility(column, responsiveToggle){
        if(!responsiveToggle && column.modules.responsive){
            column.modules.responsive.visible = column.visible;
            this.initializeResponsivity();
        }
    }

    hideColumn(column){
        const colCount = this.hiddenColumns.length;

        column.hide(false, true);

        if(this.mode === 'collapse'){
            this.hiddenColumns.unshift(column);
            this.generateCollapsedContent();

            if(this.collapseHandleColumn && !colCount){
                this.collapseHandleColumn.show();
            }
        }
    }

    showColumn(column){
        column.show(false, true);
        //set column width to prevent calculation loops on uninitialized columns
        column.setWidth(column.getWidth());

        if(this.mode === 'collapse'){
            const index = this.hiddenColumns.indexOf(column);

            if(index > -1){
                this.hiddenColumns.splice(index, 1);
            }

            this.generateCollapsedContent();

            if(this.collapseHandleColumn && !this.hiddenColumns.length){
                this.collapseHandleColumn.hide();
            }
        }
    }

    //redraw columns to fit space
    update = () => {
        let working = true;

        while(working){

            const width = this.table.modules.layout.getMode() == 'fitColumns' ? this.table.columnManager.getFlexBaseWidth() : this.table.columnManager.getWidth();

            const diff = (this.table.options.headerVisible ? this.table.columnManager.element.clientWidth : this.table.element.clientWidth) - width;

            if(diff < 0){
                //table is too wide
                const column = this.columns[this.index];

                if(column){
                    this.hideColumn(column);
                    this.index ++;
                }else{
                    working = false;
                }

            }else{

                //table has spare space
                const column = this.columns[this.index -1];

                if(column){
                    if(diff > 0){
                        if(diff >= column.getWidth()){
                            this.showColumn(column);
                            this.index --;
                        }else{
                            working = false;
                        }
                    }else{
                        working = false;
                    }
                }else{
                    working = false;
                }
            }

            if(!this.table.rowManager.activeRowsCount){
                this.table.rowManager.renderEmptyScroll();
            }
        }
    };

    generateCollapsedContent = () => {
        this.table.rowManager.getDisplayRows()
            .forEach((row) => this.generateCollapsedRowContent(row));
    };

    generateCollapsedRowContent = (row) => {
        if(row.modules.responsiveLayout && this.mode === 'collapse'){
            const collapseEl = row.modules.responsiveLayout.element;

            // always clear content before redraw
            while(collapseEl.firstChild){
                collapseEl.removeChild(collapseEl.firstChild);
            }
            
            if (!collapseEl.firstChild) {
                const data = this.generateCollapsedRowData(row);

                // redraw contents
                const contents = this.collapseFormatter(data);
                if(contents){
                    collapseEl.appendChild(contents);
                }
            }
        }
    };

    generateCollapsedRowData = (row): CollapsedCellData[] => {
        const data = row.getData();
        const output = [];

        this.hiddenColumns.forEach((column) => {
            const field = column.field;
            const value = column.getFieldValue(data);
            if(column.definition.title && field){
                const format = column.modules.format;
                const title = !column.modules.format.params?.hideTitle ? column.definition.title : '';
                if(format && this.table.options.responsiveLayoutCollapseUseFormatters){
                    const cell = <CellComponent>row.getCell(field);
                    const element = cell.getElement();
                    // TODO cloneNode() to fix show/hide column https://github.com/ortwic/song-repo/issues/31
                    // element = element.cloneNode(true);
                    element.title = column.definition.title;
                    element.style.display = 'block';
                    output.push({
                        field,
                        title,
                        value: element
                    });
                }else{
                    output.push({
                        field,
                        title,
                        value: value
                    });
                }
            }
        });

        return output;
    };

    defaultFormatter(data: CollapsedCellData[]): HTMLElement{
        const list = document.createElement('div');
        list.classList.add('flex');

        data.forEach(({ field, title, value }) => {
            const row = document.createElement('div');
            if (title) {
                const label = document.createElement('label');
                row.appendChild(label);
                        
                super.langBind('columns|' + field, (text) => {
                    label.innerHTML = text || title;
                });
            }

            if(value instanceof Node){
                row.appendChild(value);
            }else if(value !== undefined){
                const p = document.createElement('p');
                p.innerHTML = value;
                row.appendChild(p);
            }

            list.appendChild(row);
        }, this);

        return Object.keys(data).length ? list : undefined;
    }
}
export default function(cell){
    const config = cell.getRow()._row.modules.responsiveLayout;
    if (!config) {
        return;
    }

    const div = document.createElement('div');
    div.classList.add('tabulator-responsive-collapse-toggle');
	
    div.innerHTML = `<svg class='tabulator-responsive-collapse-toggle-open' viewbox="0 0 24 24">
  <line x1="7" y1="12" x2="17" y2="12" fill="none" stroke-width="3" stroke-linecap="round" />
  <line y1="7" x1="12" y2="17" x2="12" fill="none" stroke-width="3" stroke-linecap="round" />
</svg>

<svg class='tabulator-responsive-collapse-toggle-close' viewbox="0 0 24 24">
  <line x1="7" y1="12" x2="17" y2="12"  fill="none" stroke-width="3" stroke-linecap="round" />
</svg>`;

    cell.getElement().classList.add('tabulator-row-handle');

    function toggleList(el, isOpen){
        const collapseEl = config.element;

        config.open = isOpen;

        if(collapseEl){
            if(config.open){
                el.classList.add('open');
                collapseEl.classList.add('open');
            }else{
                el.classList.remove('open');
                collapseEl.classList.remove('open');
            }
        }
    }

    div.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        toggleList(e.target, !config.open);
        cell.getTable().rowManager.adjustTableSize();
    });

    toggleList(div, config.open);

    return div;
}
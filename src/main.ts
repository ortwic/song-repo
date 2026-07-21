import 'boxicons/css/boxicons.min.css';
import './styles/app.scss';
import './styles/icons.scss';
import './styles/utils.scss';
import { mount } from "svelte";
import { setHashRoutingEnabled } from '@keenmate/svelte-spa-router';
import { initRefData } from './service/base/app-cache.setup';
import { setupI18n } from './service/base/i18n.setup';

const app = (async () => {
    const target = document.getElementById('app');

    setHashRoutingEnabled(false);
    
    await initRefData();
    await setupI18n().catch(console.error);

    if (window.location.pathname.startsWith('/@')) {
        const { default: UserPage } = await import('./UserPage.svelte');
        return mount(UserPage, { 
            target, 
            props: {
                routeParams: {
                    alias: window.location.pathname.slice(2)
                }
            }
        });
    } 
    
    const { default: App } = await import('./App.svelte');
    return mount(App, { target });
})();

export default app;
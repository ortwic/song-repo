import 'boxicons/css/boxicons.min.css';
import './styles/app.scss';
import './styles/icons.scss';
import './styles/utils.scss';
import { mount } from "svelte";
import { initRefData } from './service/base/app-cache.setup';
import { setupI18n } from './service/base/i18n.setup';

const app = (async () => {
    await initRefData();
    await setupI18n().catch(console.error);

    if (window.location.pathname.startsWith('/@')) {
        const { default: UserPage } = await import('./routes/UserPage.svelte');
        return mount(UserPage, { 
            target: document.getElementById('app'),
            props: {
                params: {
                    alias: window.location.pathname.slice(2)
                }
            }
        });
    } 
    
    const { default: App } = await import('./App.svelte');
    return mount(App, { 
        target: document.getElementById('app')
    });
})();

export default app;
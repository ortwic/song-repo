import 'boxicons/css/boxicons.min.css';
import './styles/app.scss';
import './styles/icons.scss';
import './styles/utils.scss';
import App from './App.svelte';
import { mount } from "svelte";
import { initRefData } from './service/base/app-cache.setup';

const app = (async () => {
    await initRefData();
    return mount(App, { 
        target: document.getElementById('app')
    });
})();

export default app;
import 'boxicons/css/boxicons.min.css';
import './styles/app.scss';
import './styles/utils.scss';
import App from './App.svelte';
import { mount } from "svelte";
import { preloadRefData } from './service/common/app.service';

const app = (async () => {
    await preloadRefData();
    return mount(App, { 
        target: document.getElementById('app')
    });
})();

export default app;
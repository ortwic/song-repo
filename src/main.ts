import './styles/app.scss';
import App from './App.svelte';
import { setupI18n } from './service/i18n';

setupI18n();

const app = new App({
    target: document.getElementById('app'),
});

export default app;

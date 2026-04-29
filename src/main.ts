import 'boxicons/css/boxicons.min.css';
import './styles/app.scss';
import './styles/utils.scss';
import App from './App.svelte';

const app = new App({
    target: document.getElementById('app'),
});

export default app;

import { defineRoutes } from '@keenmate/svelte-spa-router';

import Dashboard from './routes/Dashboard.svelte';
import Blog from './routes/Blog.svelte';
import Document from './routes/Document.svelte';
import EventMap from './routes/EventMap.svelte';
import Settings from './routes/Settings.svelte';
import SnippetTable from './routes/SnippetTable.svelte';
import SongTable from './routes/SongTable.svelte';
import EventCalendar from './routes/EventCalendar.svelte';
import Feedback from './routes/Feedback.svelte';
import NotFound from './routes/NotFound.svelte';

import RecentMenu from './components/menus/RecentMenu.svelte';
import ShareMenu from './components/menus/ShareMenu.svelte';
import BlogMenu from './components/menus/BlogMenu.svelte';
import EventListMenu from './components/menus/EventListMenu.svelte';
import TableMenu from './components/menus/TableMenu.svelte';
import ColumnMenu from './components/menus/ColumnMenu.svelte';

const tableMenu = [TableMenu, ColumnMenu];

const { routes, nav, paths } = defineRoutes({
    root: {
        path: '/',
        component: Dashboard,
        routeContext: { userMenus: [RecentMenu, ShareMenu] },
    },

    blog: {
        path: '/blog',
        component: Blog,
        routeContext: { menus: [BlogMenu], hideLogin: true },
    },
    
    blogPost: {
        path: '/blog/:slug',
        component: Blog,
        routeContext: { menus: [BlogMenu], hideLogin: true },
    },

    document: {
        path: '/docs/:id',
        component: Document,
        routeContext: { userMenus: [ShareMenu] },
    },

    events: {
        path: '/events',
        component: EventMap,
        routeContext: { menus: [EventListMenu], hideLogin: true },
    },
    eventDetail: {
        path: '/events/:id',
        component: EventMap,
        routeContext: { menus: [EventListMenu], hideLogin: true },
    },

    settings: {
        path: '/settings',
        component: Settings,
        routeContext: { userMenus: [ShareMenu] },
    },

    snippets: {
        path: '/snippets',
        component: SnippetTable,
        routeContext: { menus: tableMenu },
    },
    snippetDetail: {
        path: '/snippets/:id',
        component: SnippetTable,
        routeContext: { menus: tableMenu },
    },

    songs: {
        path: '/songs',
        component: SongTable,
        routeContext: { menus: tableMenu },
    },
    songDetail: {
        path: '/songs/:uid',
        component: SongTable,
        routeContext: { menus: tableMenu },
    },

    // hidden / unused routes
    calendar: {
        path: '/calendar',
        component: EventCalendar,
        routeContext: { userMenus: [ShareMenu] },
    },
    feedback: {
        path: '/feedback',
        component: Feedback,
        routeContext: { menus: [] },
    },

    notFound: {
        path: '*',
        component: NotFound,
        routeContext: { menus: [] },
    },
});

export { routes, nav, paths };

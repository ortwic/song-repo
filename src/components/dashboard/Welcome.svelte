<script>
    import { t } from 'svelte-i18n';
    import { link } from 'svelte-spa-router';
    import { currentMenu } from '../../store/app.store';

    function signup() {
        currentMenu.set('signup');
    }
</script>

{$t('start.intro')}
<ul class="bx-ul">
    <li class="bxs-user-plus">
        <div>{$t('start.features.signup')}</div>
        <div>
            <a use:link role="button" class="primary" href="/" onclick={signup}>
                <i class="bx bxs-edit"></i>
                {$t('menu.login.signup')}
            </a>
        </div>
    </li>
    <li class="bxs-playlist">
        <div>{$t('start.features.list')}</div>
        <div>
            <a use:link role="button" href="/songs">
                <i class="bx bxs-playlist"></i>
                {$t('menu.repo')}
            </a>
        </div>
    </li>
    <li class="bx-test-tube">
        <div>{$t('start.samples')}</div>
        <div>
            <a use:link role="button" href="/samples">
                <i class="bx bx-test-tube"></i>
                Demo
            </a>
        </div>
    </li>
    <li class="bx-bar-chart">{$t('start.features.track')}</li>
    <li class="bx-share-alt">
        {$t('start.features.share')}
        <div class="smaller">Link, CSV, JSON, XLSX, PDF</div>
    </li>
    <li class="bx-search-alt-2">
        <div>
            {$t('start.features.search')}
        </div>
        <div>
            <a target="_blank" href="https://getsongbpm.com/api">GetSongbpm</a>
            <a target="_blank" href="https://docs.audius.org/api">Audius</a>
        </div>
    </li>
    <li class="bx-calendar">
        <div>
            {$t('start.features.events')}
            <a target="_blank" href="https://openpianoforrefugees.com/standorte/#termine">Open Piano</a>,
            <a target="_blank" href="http://www.streetpianos.com/">Play Me I'm Yours</a>
        </div>
        <div>
            <a use:link role="button" href="/events">
                <i class="bx bx-calendar"></i>
                {$t('menu.events')}
            </a>
        </div>
    </li>
    <li class="bx-music">
        <div>{$t('start.features.blog')}</div>
        <div>
            <a use:link role="button" href="/blog">
                <i class="bx bx-music"></i>
                {$t('menu.howto')}
            </a>
        </div>
    </li>
</ul>

<style lang="scss">
    ul.bx-ul {
        list-style-type: neutral;
        margin-left: 0.8em;
        margin-bottom: 2em;

        li {
            position: relative;
            padding-left: 2em;
            margin-bottom: 1.6em;

            @media screen and (orientation: landscape) {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            &::marker {
                content: '';
            }

            &:before {
                position: absolute;
                top: 0;
                left: 0;
                display: inline-block;
                font-family: 'boxicons';
                font-size: larger;
                color: gray;
            }

            i.bx {
                position: inherit;
            }

            @media screen and (orientation: portrait) {
                & > div {
                    width: 100%;

                    &:last-child {
                        padding-top: 1em;
                        text-align: right;
                    }
                }
            }
        }
    }

    a[role='button'] {
        margin-left: 1.5em;
        white-space: nowrap;
    }
</style>

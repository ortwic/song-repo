<script>
    import { t } from 'svelte-i18n';
    import Titlebar from '../components/ui/elements/Titlebar.svelte';
    import { currentUser } from '../service/auth.service';
    
    const options = { mangle: false, headerIds: false };
</script>

<main class="content">
    <Titlebar closable={false}>
        <i class="bx bx-world"></i>&nbsp; { $t('start.hello')}
    </Titlebar>
    <div>
        { $t('start.intro') }
        <ul class="bx-ul">
            {#if !$currentUser}
            <li class="bxs-user-plus">
                <span>{ $t('start.features.signup') }</span>
                <span>
                    <a role="button" class="primary" href="#/signup">
                        <i class="bx bxs-edit"></i>
                        { $t('menu.login.signup') }
                    </a>
                </span>
            </li>
            {/if}
            <li class="bxs-playlist">
                <span>{ $t('start.features.list') }</span>
                <span>
                    <a role="button" class={$currentUser ? 'primary' : ''} href="#/songs">
                        <i class="bx bxs-playlist"></i>
                        { $t('menu.songs') }
                    </a>
                </span>
            </li>
            <li class="bx-test-tube">
                <span>{ $t('start.samples') }</span>
                <span>
                    <a role="button" href="#/samples">
                        <i class="bx bx-test-tube"></i>
                        Demo
                    </a>
                </span>
            </li>
            <li class="bx-bar-chart">{ $t('start.features.track') }</li>
            <li class="bx-share-alt">
                { $t('start.features.share') } 
                <span class="smaller">
                    Link, CSV, JSON, XLSX, PDF
                </span>
            </li>
            <li class="bx-search-alt-2">
                <span>
                    { $t('start.features.search') } 
                </span>
                <a target="_blank" href="https://getsongbpm.com">getsongbpm.com</a>
            </li>
            <li class="bx-calendar">
                <span>
                    { $t('start.features.events') } 
                    <a target="_blank" href="https://openpianoforrefugees.com/standorte/#termine">Open Piano</a>, 
                    <a target="_blank" href="http://www.streetpianos.com/">Play Me I'm Yours</a>
                </span>
                <a role="button" href="#/events">
                    <i class="bx bx-calendar"></i>
                    { $t('menu.events') }
                </a>
            </li>
            <li class="bx-bulb">
                <span>{ $t('start.features.blog') }</span>
                <a role="button" href="#/blog">
                    <i class="bx bx-bulb"></i>
                    { $t('menu.howto') }
                </a>
            </li>
            <li class="bxl-github">
                <span>{ $t('start.features.github') }</span>
                <a role="button" target="_blank" href="https://github.com/users/ortwic/projects/2/views/1">Roadmap</a>
            </li>
            <li class="bx-mail-send">
                <span>{ $t('start.features.feedback') }</span>
                <span>
                    <a role="button" class="primary" href="#/feedback">Feedback</a>
                </span>
            </li>
        </ul>
    </div>
</main>

<style lang="scss">
main {
    & > div {
        padding: 1em 5%;
        max-width: 40em;

        ul.bx-ul {
            list-style-type: neutral;
            margin-left: .8em;
            margin-bottom: 2em;

            li {
                position: relative;
                padding-left: 2em;
                margin-bottom: 1.6em;
                display: flex;
                justify-content: space-between;
                align-items: center;
                
                &:before {
                    position: absolute;
                    top: 0;
                    left: 0;
                    display: inline-block;
                    font-family: "boxicons";
                    font-size: larger;
                    color: gray;
                }

                i.bx {
                    position: inherit;
                }
            }
        }

        a[role="button"] {
            margin-left: 1.5em;
            white-space: nowrap;
        }
        
        .smaller {
            font-size: smaller;
        }
    }
}
</style>
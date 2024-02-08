<script>
    import { t } from 'svelte-i18n';
    import { link } from 'svelte-spa-router';
    import { currentUser } from '../service/auth.service';
    
    const options = { mangle: false, headerIds: false };
</script>

<main class="content">
    <div class="titlebar">
        <i class="bx bx-world"></i>&nbsp; { $t('start.hello')}
    </div>
    <section>
        { $t('start.intro') }
        <ul class="bx-ul">
            {#if !$currentUser}
            <li class="bxs-user-plus">
                <div>{ $t('start.features.signup') }</div>
                <div>
                    <a role="button" class="primary" href="#/signup">
                        <i class="bx bxs-edit"></i>
                        { $t('menu.login.signup') }
                    </a>
                </div>
            </li>
            {/if}
            <li class="bxs-playlist">
                <div>{ $t('start.features.list') }</div>
                <div>
                    <a role="button" class={$currentUser ? 'primary' : ''} href="#/songs">
                        <i class="bx bxs-playlist"></i>
                        { $t('menu.songs') }
                    </a>
                </div>
            </li>
            <li class="bx-test-tube">
                <div>{ $t('start.samples') }</div>
                <div>
                    <a role="button" href="#/samples">
                        <i class="bx bx-test-tube"></i>
                        Demo
                    </a>
                </div>
            </li>
            <li class="bx-bar-chart">{ $t('start.features.track') }</li>
            <li class="bx-share-alt">
                { $t('start.features.share') } 
                <div class="smaller">
                    Link, CSV, JSON, XLSX, PDF
                </div>
            </li>
            <li class="bx-search-alt-2">
                <div>
                    { $t('start.features.search') } 
                </div>
                <div>
                    <a target="_blank" href="https://getsongbpm.com">getsongbpm.com</a>
                </div>
            </li>
            <li class="bx-calendar">
                <div>
                    { $t('start.features.events') } 
                    <a target="_blank" href="https://openpianoforrefugees.com/standorte/#termine">Open Piano</a>, 
                    <a target="_blank" href="http://www.streetpianos.com/">Play Me I'm Yours</a>
                </div>
                <div>
                    <a role="button" href="#/events">
                        <i class="bx bx-calendar"></i>
                        { $t('menu.events') }
                    </a>
                </div>
            </li>
            <li class="bx-bulb">
                <div>{ $t('start.features.blog') }</div>
                <div>
                    <a role="button" href="#/blog">
                        <i class="bx bx-bulb"></i>
                        { $t('menu.howto') }
                    </a>
                </div>
            </li>
            <li class="bxl-github">
                <div>{ $t('start.features.github') }</div>
                <div>
                    <a role="button" target="_blank" href="https://github.com/users/ortwic/projects/2/views/1">Roadmap</a>
                </div>
            </li>
            <!-- <li class="bx-mail-send">
                <div>{ $t('start.features.feedback') }</div>
                <div>
                    <a role="button" class="primary" href="#/feedback">Feedback</a>
                </div>
            </li> -->
        </ul>
    </section>
    <footer>
        <a use:link href="/docs/imprint">{ $t('start.imprint') }</a> |
        <a use:link href="/docs/privacypolicy">{ $t('start.privacypolicy') }</a> |
        <a use:link href="/docs/termsofuse">{ $t('start.termsofuse') }</a> |
        <a use:link href="/settings">{ $t('settings.title') }</a>
    </footer>
</main>

<style lang="scss">
main {
    & > section {
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
                    font-family: "boxicons";
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

        a[role="button"] {
            margin-left: 1.5em;
            white-space: nowrap;
        }
        
        .smaller {
            font-size: smaller;
        }
    }

    footer {
        text-align: center;
    }
}
</style>
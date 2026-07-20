<script lang="ts">
    import { t } from 'svelte-i18n';
    import { link } from '@keenmate/svelte-spa-router';
    import { menuContext } from '../../store/menu-context.svelte';

    function signup() {
        menuContext.showSignup();
    }
</script>

<section class="landing">
    <div class="hero">
        <p class="eyebrow">{$t('start.eyebrow')}</p>
        <h1 class="headline">
            {$t('start.headline')}
            <em>{$t('start.headline_em')}</em>
        </h1>
        <p class="sub">{$t('start.sub')}</p>
        <a use:link role="button" class="primary cta" href="/" onclick={signup}>
            <i class="bx bxs-edit" aria-hidden="true"></i>
            {$t('menu.login.signup')}
        </a>
    </div>

    <hr class="divider" />

    <div class="grid-auto-fit">
        <div class="card">
            <span class="center">
                <i class="bx bxs-playlist card-icon" aria-hidden="true"></i>
            </span>
            <p class="card-title center">{$t('start.tiles.overview.title')}</p>
            <p class="card-desc">{$t('start.tiles.overview.desc')}</p>
        </div>
        <div class="card">
            <span class="center">
                <i class="bx bx-mobile-alt card-icon" aria-hidden="true"></i>
            </span>
            <p class="card-title center">{$t('start.tiles.mobile.title')}</p>
            <p class="card-desc">{$t('start.tiles.mobile.desc')}</p>
        </div>
        <div class="card">
            <span class="center">
                <i class="bx bx-share-alt card-icon" aria-hidden="true"></i>
            </span>
            <p class="card-title center">{$t('start.tiles.share.title')}</p>
            <p class="card-desc">{$t('start.tiles.share.desc')}</p>
        </div>
    </div>
</section>

<style lang="scss">
    .landing {
        padding: 1.5rem 1rem 2rem;
        max-width: 680px;
        margin: 0 auto;
    }

    .hero {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;

        .eyebrow {
            font-size: 0.75rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--text-muted);
            margin: 0;
        }

        .headline {
            font-size: 1.8rem;
            font-weight: 500;
            line-height: 1.25;
            letter-spacing: -0.2pt;
            color: var(--text);
            margin: 0;

            em {
                display: block;
                font-style: normal;
                color: var(--accent);
            }
        }

        .sub {
            font-size: 0.95rem;
            color: var(--text-muted);
            line-height: 1.6;
            margin: 0.25rem 0 0.75rem;
            max-width: 480px;
        }

        .cta {
            align-self: flex-start;
        }
    }
</style>

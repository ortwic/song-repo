<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { push } from 'svelte-spa-router';
    import { map } from 'rxjs';
    import UserIcon from '../ui/Avatar.svelte';
    import { currentProfile } from '../../service/user.service';

    interface Props {
        displayName: string;
        photoURL: string;
        email: string;
    }

    let { displayName, photoURL, email }: Props = $props();

    const name = currentProfile.pipe(
        map((profile) => {
            if (profile.name) {
                return profile.name;
            }
            if (displayName) {
                return displayName;
            }
            return email.split('@').at(0);
        })
    );
</script>

<section class="menu">
    <div class="row">
        <button class="profil" data-close title="{ $t('settings.title') }" onclick={() => push('/settings')}>
            <UserIcon photoURL={$currentProfile.photoURL ?? photoURL} size="50px" />
            <span class="name">{$name}</span>
        </button>
    </div>
</section>

<style lang="scss">
    .profil {
        display: flex;
        justify-content: center;
        align-content: center;
        align-items: center;
        padding: .4em 0;

        span.name {
            padding: 0 .4em;
            max-width: 8em;
            word-wrap: break-word;
            word-break: break-all;
            overflow: hidden;
        }
    }
</style>
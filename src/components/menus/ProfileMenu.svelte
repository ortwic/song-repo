<script lang='ts'>
    import { combineLatest } from 'rxjs';
    import { t } from 'svelte-i18n';
    import { push } from '@keenmate/svelte-spa-router';
    import UserIcon from '../ui/Avatar.svelte';
    import { currentProfile } from '../../store/profile.store';
    import { currentUser } from '../../service/user/auth.service';

    let name = $state('');
    let photoURL = $state('');

    $effect(() => {
        const sub = combineLatest([currentUser, currentProfile]).subscribe(
            ([user, profile]) => {
                name = profile.name ?? user.displayName ?? user.email.split('@').at(0);
                photoURL = profile?.photoURL ?? user.photoURL ?? '';
            }
        );

        return () => !sub.closed && sub?.unsubscribe();
    });
</script>

<section class="menu">
    <div class="row">
        <button class="profil" data-close title="{ $t('start.hello') } {name ?? $t('start.anonymous')}" onclick={() => push('/')}>
            <UserIcon photoURL={photoURL} size="50px" />
            <span class="name">{name}</span>
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
<script lang='ts'>
    import { combineLatest } from 'rxjs';
    import { t } from 'svelte-i18n';
    import { push } from '@keenmate/svelte-spa-router';
    import UserIcon from '../ui/Avatar.svelte';
    import MenuButton from '../ui/elements/MenuButton.svelte';
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
        <MenuButton title="{ $t('start.hello') } {name ?? $t('start.anonymous')}" onclick={() => push('/')}>
            <div class="profil">
                <UserIcon {photoURL} size="50px" />
                <span class="name">{name}</span>
            </div>
        </MenuButton>
    </div>
</section>

<style lang="scss">
    .profil {
        display: flex;
        justify-content: center;
        align-content: center;
        align-items: center;
        padding: .2em;
        gap: .4em;

        span.name {
            padding: 0 .4em;
            max-width: 8em;
            word-wrap: break-word;
            word-break: break-all;
            overflow: hidden;
        }
    }
</style>
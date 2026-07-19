<script lang="ts">
    import { t } from 'svelte-i18n';
    import DialogBase from './DialogBase.svelte';
    import type { DialogAction } from '../dialog-context.svelte';
    import { registerDialog } from '../dialog-context.svelte';
    import type { UserSong } from '../../model/song.model';
    import type { UserLink } from '../../model/user.model';
    import { createDeferred, type DeferredResult } from '../../utils/promise.helper';
    import { UserLinkService } from '../../service/user/user-link.service';
    import { Subscription } from 'rxjs';
    import UserService from '../../service/user/user.service';

    let props = $state<UserSong | undefined>();
    let name = $state('');
    let donationLinks = $state<UserLink[]>([]);
    let disableDone = $state(true);
    let subscriptions: Subscription[] = [];
    let result: DeferredResult<DialogAction> | undefined;

    registerDialog<UserSong, DialogAction>('DonationHintDialog', showDialog);

    export async function showDialog(args: UserSong) {
        props = args;
        disableDone = true;
        subscriptions = [
            new UserService().getProfile(args.uid).subscribe(profile => name = profile.name ?? profile.alias),
            new UserLinkService(args.uid).userlinks$.subscribe(setDonationLinks)
        ];

        result = createDeferred<DialogAction>();
        return result.promise;
    }

    function setDonationLinks(links: UserLink[]) {
        donationLinks = links.filter(({ placement }) => placement.contains('donation'));
    }

    function donateLinkClicked() {
        setTimeout(() => disableDone = false, 500);
    }

    function handleClose(action?: DialogAction) {
        props = undefined;
        subscriptions.forEach(s => s.unsubscribe());
        subscriptions = [];

        result.resolve(action);
    }
</script>

<DialogBase 
    visible={props !== undefined} 
    title={$t('songs.request-dialog.title')}
    size='auto'
    type='view'
    onClose={({ action }) => handleClose(action)}
>
    <div class="body">
        <div class="message">
            <i class="bx bx-heart bx-tada bx-lg primary"></i>
            {$t('songs.request-dialog.text', { values: { name } })}
        </div>

        <div class="linktree">
            {#each donationLinks as link}
                <a class="link" role="button" href={link.url} target="_blank" onclick={donateLinkClicked}>
                    <i class="icon-badge bx {link.icon}"></i>
                    {link.title}
                </a>
            {/each}
        </div>
    </div>
    {#snippet footer()}
        <div class="row">
            <button disabled={disableDone} onclick={() => handleClose('confirm')}>
                <i class="icon bx bx-check"></i>
                { $t('songs.request-dialog.done') }
            </button>
            <button onclick={(e) => handleClose()}>
                <i class="icon bx bx-redo"></i>
                { $t('songs.request-dialog.later') }
            </button>
        </div>
    {/snippet}
</DialogBase>

<style lang="scss">
    .body {
        padding: 1em;

        .message {
            display: flex;
            align-items: center;
            gap: 1.5em;
            margin: 0.5em 2em;
            line-height: 1.5;
        }
    }
</style>
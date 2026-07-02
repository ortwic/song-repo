<script lang="ts">
    import { t } from 'svelte-i18n';
    import { push } from 'svelte-spa-router';
    import { onMount } from 'svelte';
    import { combineLatest } from 'rxjs';
    import { openDialog } from '../dialog-context.svelte';
    import type { UserSong } from '../../model/song.model';
    import SongService from '../../service/user/user-song.service';
    import { UserLinkService } from '../../service/user/user-link.service';
    import { currentProfile } from '../../service/user/user.service';
    import { settings, saveSettings } from '../../store/user-settings.svelte';
    import DialogBase from '../dialogs/DialogBase.svelte';
    import ShareMenu from '../menus/ShareMenu.svelte';

    type SetupStatus = Partial<typeof settings.dashboard.setupStatus>;

    const MIN_SONGS = 3;

    const songService = new SongService();
    const linkService = new UserLinkService();

    let shareDialogVisible = $state(false);

    async function addSong() {
        const newSong = await openDialog<UserSong, UserSong>('EditSongDialog');
        if (newSong !== null) {
            await songService.addSong(newSong);
        }
    }

    function updateSetupStatus(status: SetupStatus) {
        const current = settings.dashboard.setupStatus;
        const hasChanges = (Object.keys(status) as Array<keyof SetupStatus>)
            .some((key) => status[key] !== current[key]);
        if (hasChanges) {
            saveSettings('dashboard', {
                ...settings.dashboard,
                setupStatus: { ...current, ...status },
            });
        }
    }

    onMount(() => {
        const sub = combineLatest([
            songService.usersongs$,
            linkService.userlinks$,
            currentProfile,
        ]).subscribe(([songs, links, profile]) => {
            updateSetupStatus({
                hasSongs: songs.length >= MIN_SONGS,
                hasProfile: !!profile.about?.trim() && links.length >= 1,
            });
        });
        return () => sub.unsubscribe();
    });

    const setup = $derived(settings.dashboard.setupStatus);
    const isComplete = $derived(setup.hasSongs && setup.hasProfile && setup.hasShared);

    function handleShareClose(confirmed: boolean) {
        shareDialogVisible = false;
        updateSetupStatus({ hasShared: confirmed });
    }
</script>

{#if !isComplete}
    <section class="setup">
        <header class="header">
            <div class="title">
                <i class="bx bx-play-circle" aria-hidden="true"></i>
                {$t('start.setup.title')}
            </div>
        </header>
        <div class="grid-auto-fit">
            <button class="card" class:done={setup.hasSongs} onclick={addSong}>
                <span class="center">
                    <i class="bx {setup.hasSongs ? 'bxs-check-circle' : 'bxs-playlist'} card-icon"
                        aria-hidden="true"></i>
                </span>
                <p class="card-title center">{$t('start.setup.songs.title')}</p>
                <p class="card-desc">{$t('start.setup.songs.desc', { values: { count: MIN_SONGS } })}</p>
            </button>

            <button class="card" class:done={setup.hasProfile} onclick={() => push('/settings')}>
                <span class="center">
                    <i class="bx {setup.hasProfile ? 'bxs-check-circle' : 'bx-user-circle'} card-icon"
                        aria-hidden="true"></i>
                </span>
                <p class="card-title center">{$t('start.setup.profile.title')}</p>
                <p class="card-desc">{$t('start.setup.profile.desc')}</p>
            </button>

            <button class="card" class:done={setup.hasShared}
                onclick={() => (shareDialogVisible = true)}>
                <span class="center">
                    <i class="bx {setup.hasShared ? 'bxs-check-circle' : 'bx-share-alt'} card-icon"
                        aria-hidden="true"></i>
                </span>
                <p class="card-title center">{$t('start.setup.share.title')}</p>
                <p class="card-desc">{$t('start.setup.share.desc')}</p>
            </button>
        </div>
    </section>

    <DialogBase
        size="auto"
        title={$t('start.setup.share.dialog-title')}
        visible={shareDialogVisible}
        onClose={handleShareClose}
    >
        <ShareMenu showPreview={false} showQRDownload={true} />
        <p class="center smaller">{$t('start.setup.share.dialog-hint')}</p>
    </DialogBase>
{/if}

<style lang="scss">
    .setup {
        margin-bottom: 1.5rem;
    }

    button.card {
        width: 100%;
        text-align: left;
    }
</style>
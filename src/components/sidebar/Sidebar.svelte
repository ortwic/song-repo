<script lang='ts'>
    import { slide } from 'svelte/transition';
    import Profil from './Profil.svelte';
    import Snackbar from '../Snackbar.svelte';
	import AuthService, { currentUser } from '../../service/auth.service';
    import { usersongs } from "../../store/song.store";
    import { menuOpened } from '../../store/menu.store';
    import type { UserSong } from "../../model/song.model";
    import samples from '../../data/samples.json';

    export let version = '';
    const color = '#109392';
	const authService = new AuthService();
    let snackbar: Snackbar;
	let email = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let password = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let termsofuse = false;

	async function signIn() {
		try {
			await authService.signIn(email, password);
		} catch (error) {
			snackbar.error(error);
		}
	}

	async function signUp() {
		try {
			await authService.signUp(email, password);
		} catch (error) {
			snackbar.error(error);
		}
	}
    
	async function useGoogle() {
		try {
			await authService.loginWithGoogle();
		} catch (error) {
			snackbar.error(error);
		}
	}
    
    function showSamples(): void {
        usersongs.set(samples as unknown as UserSong[]);
    }

    function close() {
        menuOpened.set(false);
    }
</script>

<svelte:head>
    <link href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css" rel="stylesheet" />
</svelte:head>

{#if $menuOpened}
<form on:submit|preventDefault={close}>
    <aside 
        in:slide={{duration: 200, axis: 'x'}} 
        out:slide={{duration: 200, axis: 'x'}} >
        <header class="bar">
            <span>My song repertoire</span>
            <button class="close">✕</button>
        </header>
        <nav>
            {#if $currentUser}
            <div>
                <Profil {color} 
                    photoURL={$currentUser.photoURL} 
                    displayName={$currentUser.displayName} 
                    email={$currentUser.email}
                />
            </div>
            <div>
                <button title="Sign out '{$currentUser.email}'" on:click={authService.signOut}>
                    <span><i class='bx bx-log-out-circle'></i> Logout</span>
                </button>
            </div>
            {:else}
            <div>
                <label for="email">Email</label>
                <input id="email" autocomplete="email" type="text" placeholder="email" bind:value={email}>
                <label for="password">Password</label>
                <input id="password" autocomplete="password" type="password" placeholder="password" bind:value={password}>
                <p>
                    <input id="termsofuse" type="checkbox" bind:checked={termsofuse}> <a href="#/">Terms of use</a>
                </p>
            </div>
            <div>
                <button class="w50 highlight" title="Sign in" on:click={signIn}>
                    <i class='bx bx-log-in-circle'></i> Login
                </button><button class="w50" title="Sign up" on:click={signUp} disabled={!termsofuse}>
                    <i class='bx bxs-edit'></i> Sign up
                </button>
            </div>
            <div>
                <button title="Sign in with Google" on:click={useGoogle}>
                    <i class='bx bxl-google'></i> Login with Google
                </button>
            </div>
            {/if}
        </nav>
        <footer>
            <div>
                <a role="button" target="_blank" href="https://github.com/users/ortwic/projects/2/views/1">
                    <span><i class="bx bxl-github"></i> Feature list</span>
                </a>
            </div>
            <div>
                <a role="button" target="_blank" href="http://buymeacoffee.com/ortwic">
                    <span><i class='bx bxs-coffee'></i> Buy me a coffee</span>
                </a>
            </div>
            {#if !$currentUser}
            <div>
                <button title="Load demo sample data" on:click={showSamples}>
                    <i class='bx bx-test-tube'></i> Load demo samples
                </button>
            </div>
            {/if}
            <div class="info">
                Version {version}
            </div>
        </footer>
    </aside>
</form>
{/if}

<Snackbar bind:this={snackbar} />

<style lang="scss">
aside {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    height: 100%;
    z-index: 100;
    background-color: whitesmoke;
    box-shadow: 0 0 2em #00000080;

    header.bar {
        color: whitesmoke;
        background-color: var(--primary);
        text-align: right;
        white-space: nowrap;
        font-weight: 500;

        span {
            display: inline-block;
            font-style: italic;
            padding: .4em .8em;
        }
    
        button.close {
            color: inherit;
            background-color: transparent;
            box-shadow: unset;
            border: 0;
            outline: 0;
        }

        button.close:hover {
            background-color: #F0F0F040;
        }
    }

    nav {
        text-align: center;
        flex-grow: 1;
        
        label, 
        input[type=text], 
        input[type=password], 
        p {
            display: block;
            margin-left: 1rem;
            padding: .4rem;
            text-align: left;
        }

        p {
            padding: 0;
        }
    }

    nav div, footer div {
        width: 100%;
        border-top: 1px solid silver;
        white-space: nowrap;
        
        button, 
        a[role="button"] {
            width: 100%;
            border: 0;
            border-radius: 0;
            box-shadow: unset;
            min-height: 3em;
            text-align: center;

            span {
                display: inline-block;
                padding: 6px;
            }
        }

        button.w50 {
            width: 50%;
            border-left: 1px solid silver;
        }

        button.highlight {
            border: 1px solid var(--primary);
        }

        button:hover, 
        a[role="button"]:hover {
            background-color: white;
        }

        button:disabled, 
        a[role="button"]:disabled {
            background-color: transparent;
        }

        button i, 
        a[role="button"] i {
            border: 1px solid silver;
            border-radius: 1em;
            background-color: white;
            padding: 4px;
        }

        a[role="button"] {
            display: block;

            span {
                color: var(--primary);
                padding-top: .6em;
                vertical-align: middle;
            }
        }
    }

    div:last-child {        
        border-bottom: 1px solid silver;
    }

    div.info {
        color: whitesmoke;
        background-color: silver;
        padding-top: .6em;
        font-size: small;
        text-align: center;
        text-shadow: 1px 1px 0 gray;
        min-height: 3em;
    }
}

img {
    vertical-align: middle;
    border-radius: 2em;
}

.center {
    text-align: center;
}
</style>
  
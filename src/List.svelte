<script>
    import Item from './Item.svelte';
    import { app } from './firebase';
    import {
        getFirestore,
        collection,
        query,
        where,
        orderBy
    } from "firebase/firestore";
    import { collectionData } from 'rxfire/firestore';
    import { startWith } from 'rxjs/operators';

    // User ID passed from parent
    export let uid;

    // Form Text
    let title = 'some title';

    const db = getFirestore(app);
    const items = collection(db, 'songs');

    // Query requires an index, see screenshot below
    const q = query(items, where('uid', '==', uid), orderBy('createdAt'));

    const songs = collectionData(q, 'id').pipe(startWith([]));

    function addItem() {
        items.add({ uid, title, complete: false, created: Date.now() });
        title = '';
    }

    function updateStatus(event) {
        const { id, newStatus } = event.detail;
        items.doc(id).update({ complete: newStatus });
    }

    function removeItem(event) {
        const { id } = event.detail;
        items.doc(id).delete();
    }
</script>

<style>
    ul {
        list-style: none; 
    }
</style>

<ul>
	{#each $songs as item}

        <Item {...item} on:remove={removeItem} on:toggle={updateStatus} />
        
	{/each}
</ul>


<input bind:value={title}>

<button on:click={addItem}>Add song</button>

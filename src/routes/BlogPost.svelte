<script lang="ts">
    import LoadingBar from "../components/ui/elements/LoadingBar.svelte";
    import { createBlogService } from "../service/blog.service";
      
    export let params: { id: string };

    const blogPost = createBlogService(true)
        .then(service => service.getBlogPost(params.id));
</script>
  
<main class="content">
    {#await blogPost}
        <p><LoadingBar>loading...</LoadingBar></p>
    {:then post}
        <h2 title="{params.id}">{post.title}</h2>
        
        <p class="content">
            {@html post.content} 
        </p>
        <div class="author">
            <img src={post.author.image.url} alt="{post.author.displayName}"/>
            <a href="{post.author.url}" target="_blank">{post.author.displayName}</a>
        </div>
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</main>
  
<style>
main {
    padding: 1em 10%;
}
</style>
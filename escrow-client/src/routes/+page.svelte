<div class="dark dark:bg-black md:container md:mx-auto">
    <div>
        <ul class="flex">
            <li class="mr-6">
                <a class="text-blue-500 hover:text-blue-800" href="#">Active</a>
            </li>
            <li class="mr-6">
                <a class="text-blue-500 hover:text-blue-800" href="#">Link</a>
            </li>
            <li class="mr-6">
                <a class="text-blue-500 hover:text-blue-800" href="#">Link</a>
            </li>
            <li class="mr-6">
                <a class="text-gray-400 cursor-not-allowed" href="#">Disabled</a>
            </li>
        </ul>
    </div>
    <h1 class="text-3xl">
        Taquito Test
    </h1>
    <script>
        let count = 0;
        function handleBeacon() {
            count += 1;
        }
    </script>
</div>
  
<style lang="postcss">
    :global(html) {
        background-color: theme(colors.gray.100);
    }
</style>
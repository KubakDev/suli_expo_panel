<script lang="ts">
    export let text: string = 'Button';
    export let onClick: () => void;
  </script>
  
  <button on:click={onClick}>
    {text}
  </button>
  
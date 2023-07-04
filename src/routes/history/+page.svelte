<script lang="ts">
  import { AppBar, Card } from 'svelte-ux';

  export let data;

  console.log({ data });
</script>

<AppBar title="Activities" />

<main>
  <!-- <form class="flex gap-2 bg-white border-b p-4" on:submit|preventDefault={run}>
    <TextField
      label="Athlete"
      bind:value={athleteId}
      icon={mdiAccount}
      dense
      placeholder="Pick an athlete"
      shrinkLabel
      class="flex-1"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="blue">Run</Button>
  </form> -->

  <div class="relative min-h-[56px] p-4">
    <Card class="px-3 overflow-auto">
      <h1>TODO</h1>
    </Card>
  </div>
</main>

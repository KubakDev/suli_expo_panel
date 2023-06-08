<script>
	let avatars = [];
	let fileInput;

	const onFileSelected = (e) => {
		let files = Array.from(e.target.files);
		files.forEach((file) => {
			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = (e) => {
				avatars = [...avatars, e.target.result];
			};
		});
	};

	const removeAvatar = (index) => {
		avatars = avatars.filter((_, i) => i !== index);
	};
</script>

<div class="max-w-screen-2xl mx-auto bg-white">
	<div class="flex flex-col justify-center items-center rounded py-8 w-full">
		<div class="grid grid-cols-3 lg:grid-cols-6 gap-0">
			{#if avatars.length > 0}
				{#each avatars as avatar, index}
					<div class="image-container">
						<img class="avatar object-cover" src={avatar} alt="Avatar" />
						<button on:click={() => removeAvatar(index)}>Remove</button>
					</div>
				{/each}
			{/if}
		</div>

		<img
			class="upload"
			src="https://static.thenounproject.com/png/625182-200.png"
			alt="Upload Icon"
			on:click={() => fileInput.click()}
		/>
		<div class="" on:click={() => fileInput.click()}>Choose Images</div>

		<input
			style="display: none"
			type="file"
			accept=".jpg, .jpeg, .png .svg"
			multiple
			on:change={(e) => onFileSelected(e)}
			bind:this={fileInput}
		/>
	</div>
</div>

<style>
	.upload {
		display: flex;
		height: 60px;
		width: 60px;
		cursor: pointer;
	}

	.avatar {
		display: flex;
		height: 60px;
		width: 60px;
		border-radius: 10%;
	}

	.image-container {
		display: flex;
		flex-direction: column;
		align-items: start;
		margin-bottom: 8px; /* Decreased margin */
	}

	button {
		margin-top: 8px;
		border: none;
		color: #ff0000;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
	}
</style>

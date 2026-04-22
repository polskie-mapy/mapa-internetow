<template>
  <portal to="modal">
    <div
      class="absolute h-full w-full inset-0 flex flex-row z-modal bg-modal cursor-pointer"
      @click.self.prevent="closeModal"
    >
      <div
        class="self-center flex w-full justify-center cursor-pointer"
        @click.self.prevent="closeModal"
      >
        <div
          class="bg-white rounded p-3 shadow border-2 border-app cursor-auto w-prose dark:bg-gray-700"
        >
          <div class="flex gap-2">
            <p class="text-2xl font-bold flex-1 dark:text-white">
              Wsparcie / dotacja projektu
            </p>
            <button
              class="flex-0 hover:text-app dark:text-white dark:hover:text-app"
              @click="closeModal"
            >
              <fa-icon
                icon="fa-solid fa-times"
                fixed-width
              />
            </button>
          </div>
          <p class="my-4 dark:text-gray-300">
            Jeśli podoba Ci się nasza praca i chcesz wesprzeć nas w dalszym jej
            rozwoju, możesz zrobić to na kilka sposobów:
          </p>
          <ul
            v-if="false"
            class="space-y-2"
          >
            <li>
              <a
                href="https://www.ko-fi.com/ronaldinhothc"
                target="_blank"
                class="text-app hover:underline"
              >
                <fa-icon
                  icon="fa-solid fa-coffee"
                  fixed-width
                />
                kupić nam kawę albo piwo
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </portal>
</template>

<script>
export default {
    methods: {
        closeModal() {
            this.$router.back();
        },
    },
};
</script>

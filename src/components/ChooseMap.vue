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
          class="bg-white rounded p-3 shadow border-2 border-app cursor-auto"
        >
          <div class="flex gap-2">
            <p class="text-2xl font-bold flex-1">
              Projekt <code>mapainternetow.pl</code>
            </p>
            <button
              class="flex-0 hover:text-app"
              @click="closeModal"
            >
              <fa-icon
                icon="fa-solid fa-times"
                fixed-width
              />
            </button>
          </div>
          <p class="mb-4 text-sm text-gray-400">
            {{ version }}
          </p>
          <ul class="space-y-2">
            <li>
              <a
                href="https://www.instagram.com/ronaldinho_thc"
                target="_blank"
                class="text-app hover:underline"
              >
                <fa-icon
                  icon="fa-brands fa-instagram"
                  fixed-width
                />
                Dane & pomysł by <b>RonaldinhoTHC</b>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/cvgore"
                target="_blank"
                class="text-app hover:underline"
              >
                <fa-icon
                  icon="fa-solid fa-code"
                  fixed-width
                />
                Apka by <b>cvgore</b>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/polskie-mapy/polskie-mapy"
                target="_blank"
                class="text-app hover:underline"
              >
                <fa-icon
                  icon="fa-brands fa-github"
                  fixed-width
                />
                Repozytorium
              </a>
            </li>
            <li>
              <a
                href="https://github.com/polskie-mapy/data/issues"
                target="_blank"
                class="text-app hover:underline"
              >
                <fa-icon
                  icon="fa-solid fa-lightbulb"
                  fixed-width
                />
                Zaproponuj pinezkę / zgłoś pinezkę
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </portal>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    computed: {
        ...mapGetters(["version"]),
    },
    methods: {
        closeModal() {
            this.$router.back();
        },
    },
};
</script>

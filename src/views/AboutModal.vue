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
              Mapa internetów.pl
            </p>
            <button
              class="flex-0 hover:text-app dark:text-white dark:hover:text-app"
              @click="closeModal"
            >
              <fa-icon icon="fa-solid fa-times" fixed-width />
            </button>
          </div>
          <p class="mb-4 text-sm text-gray-400">
            <abbr :title="builtDate">{{ version }}</abbr>
          </p>
          <ul class="space-y-2">
            <li>
              <a
                href="mailto:ronaldinhothc@gmail.com"
                target="_blank"
                class="text-app hover:underline"
              >
                <fa-icon icon="fa-solid fa-envelope" fixed-width />
                Dane & pomysł by <b>RonaldinhoTHC</b>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/cvgore"
                target="_blank"
                class="text-app hover:underline"
              >
                <fa-icon icon="fa-solid fa-code" fixed-width />
                Apka by <b>cvgore</b>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/polskie-mapy/polskie-mapy"
                target="_blank"
                class="text-app hover:underline"
              >
                <fa-icon icon="fa-brands fa-github" fixed-width />
                Repozytorium
              </a>
            </li>
            <li>
              <a
                href="https://github.com/polskie-mapy/data/issues"
                target="_blank"
                class="text-app hover:underline"
              >
                <fa-icon icon="fa-solid fa-lightbulb" fixed-width />
                Zaproponuj pinezkę / poprawkę
              </a>
            </li>
            <li>
              <a
                :href="privacyPolicyUrl"
                target="_blank"
                class="text-app hover:underline"
              >
                <fa-icon icon="fa-solid fa-legal" fixed-width />
                Polityka prywatności + ciasteczka
              </a>
            </li>
            <li>
              <a
                :href="infrigementReportMailtoUrl"
                target="_blank"
                class="text-red-600 hover:underline"
              >
                <fa-icon icon="fa-solid fa-user-ninja" fixed-width />
                Zgłoś naruszenie
              </a>
            </li>
          </ul>
          <div class="flex gap-x-5 mt-5 justify-center text-app">
            <router-link
              v-if="false"
              :to="{ name: 'Funding' }"
              class="bg-white p-2 border-app border-2 shadow rounded hover:outline outline-2 outline-offset-1 dark:bg-gray-700"
            >
              <fa-icon icon="fa-solid fa-beer" fixed-width />
              Wsparcie
            </router-link>
            <a
              href="#"
              class="bg-white p-2 border-app border-2 shadow rounded hover:outline outline-2 outline-offset-1 dark:bg-gray-700"
              @click.prevent="toggleColorScheme"
            >
              <fa-icon :icon="colorSchemeIcon" fixed-width />
              Zmień schemat
            </a>
          </div>
        </div>
      </div>
    </div>
  </portal>
</template>

<script>
import { mapGetters, mapMutations, mapState } from "vuex";

export default {
  computed: {
    ...mapGetters(["version", "builtDate", "colorSchemeIcon"]),

    ...mapState(["colorScheme"]),

    infrigementReportMailtoUrl() {
      return (
        "mailto:ronaldinhothc@gmail.com" +
        "?subject=Zg%C5%82oszenie%20naruszenia%20punktu%20w%20aplikacji%20polskie%20mapy" +
        "&body=Link%20do%20punktu%3A%20%3Curl%3E%0D%0A%0D%0A" +
        "Prosimy%20ci%C4%99%20r%C3%B3wnie%C5%BC%20o%20opisanie%20problemu."
      );
    },

    privacyPolicyUrl() {
      return "https://github.com/polskie-mapy/polskie-mapy/blob/master/PRIVACY_POLICY.md";
    },
  },
  methods: {
    closeModal() {
      this.$router.back();
    },

    ...mapMutations(["toggleColorScheme"]),
  },
};
</script>

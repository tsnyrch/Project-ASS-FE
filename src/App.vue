<template>
  <v-app>
    <Sidebar v-if="!isLoginRoute" />
    <v-main class="mx-1 mx-sm-3 mx-md-5 mb-12">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import { Icon } from '@iconify/vue';
  import Sidebar from '@/components/Sidebar.vue';
  import { useUserStore } from './stores/UserStore';
  import { useRouter } from 'vue-router';
  import { computed } from 'vue';

  const router = useRouter();

  const isLoginRoute = computed(() => router.currentRoute.value.name === 'login');

  defineExpose({ Sidebar, Icon, isLoginRoute });

  const userStore = useUserStore();
  userStore.initializeToken();

  /*
const userStore = useUserStore();

const router = useRouter();

const login = () => {
	router.push({ name: 'login' });
};

const logout = () => {
	userStore.logout();
	router.push({ name: 'home' });
};

defineExpose({ login, logout });
*/
</script>

<style>
  nav {
    margin-bottom: 1em;
  }
  .v-main {
    padding-top: 1rem;
  }
</style>

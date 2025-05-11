<template>
  <v-card class="tw-shadow-lg tw-border-r tw-border-gray-100" elevation="0">
    <v-navigation-drawer :rail="isSmallScreen" permanent class="tw-bg-white">
      <v-list-item-media class="tw-flex tw-justify-center tw-py-4 tw-border-b tw-border-gray-100">
        <img v-if="!isSmallScreen" src="@/assets/logo.jpg" alt="Logo" class="logo-default" height="64px" />
        <img v-else src="@/assets/logo_mini.png" alt="Logo" class="logo-small" />
      </v-list-item-media>
      <v-list class="tw-py-4">
        <v-list-item
          v-for="(item, i) in navItems"
          :key="i"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :class="[
            'tw-mb-1 tw-transition-all tw-duration-200',
            isSmallScreen ? 'tw-px-2 sidebar-item-small' : 'hover:tw-bg-light-grey/50 tw-rounded-lg tw-mx-2'
          ]"
        ></v-list-item>
      </v-list>
      <template v-slot:append>
        <div class="tw-w-auto tw-border-t-2 tw-border-light-grey">
          <v-menu open-on-hover location="top">
            <template v-slot:activator="{ props }">
              <v-btn class="tw-w-full" variant="text" v-bind="props" :prepend-icon="isSmallScreen ? undefined : 'mdi-account-circle-outline'">
                <template v-if="isSmallScreen">
                  <v-icon>mdi-account-circle-outline</v-icon>
                </template>
                <template v-else>{{ first_name }} {{ last_name }}</template>
              </v-btn>
            </template>

            <v-list>
              <v-list-item>
                <v-btn variant="text" class="tw-w-full" @click="doLogout">
                  <v-icon>mdi-power</v-icon>
                  <span class="tw-ml-2">Odhlásit se</span>
                </v-btn>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-navigation-drawer>
  </v-card>
</template>

<script setup>
  import { ref } from 'vue';
  import { useUserStore } from '@/stores/UserStore.js';
  import router from '@/router/index.js';

  const isSmallScreen = ref(window.innerWidth < 960);
  const store = useUserStore();
  const first_name = sessionStorage.getItem('first_name');
  const last_name = sessionStorage.getItem('last_name');

  const navItems = [
    {
      title: 'Přehled',
      icon: 'mdi-view-dashboard-outline',
      to: { name: 'dashboard' }
    },
    {
      title: 'Historie měření',
      icon: 'mdi-history',
      to: { name: 'history' }
    },
    {
      title: 'Nastavení',
      icon: 'mdi-cog-outline',
      to: { name: 'settings' }
    },
    {
      title: 'Uživatelé',
      icon: 'mdi-account-multiple-outline',
      to: { name: 'users' }
    }
  ];

  window.addEventListener('resize', () => {
    isSmallScreen.value = window.innerWidth < 960;
  });

  async function doLogout() {
    await store.logout();
    await router.push({ name: 'login' });
  }
</script>

<style scoped></style>

<template>
  <v-container>
    <v-row>
      <v-col>
        <div class="tw-text-2xl">Uživatelé</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <div class="tw-text-xl mb-2">Seznam uživatelů</div>
      </v-col>
    </v-row>

    <v-row v-for="(user, index) in users" :key="index" class="ma-0">
      <v-col class="pa-0">
        <v-card class="mx-auto tw-bg-light-grey mt-2" variant="flat">
          <v-row>
            <v-col cols="12" sm="4">
              <v-card-title class="d-flex justify-start align-center text-center text-body-1">
                <v-icon class="pr-3">mdi-account-circle-outline</v-icon>
                {{ user.first_name }} {{ user.last_name }}
              </v-card-title>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <div class="tw-text-xl">Přidat nového uživatele</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-text-field
          v-model="firstName"
          label="Zadejte jméno"
          density="compact"
          variant="outlined"
          clearable
          :error-messages="errors.firstName ? [errors.firstName] : []"
          @blur="() => validateField('firstName', firstName, 'jméno')"
          @click:clear="
            () => {
              firstName = '';
              clearFieldError('firstName');
            }
          "
          @update:modelValue="() => clearFieldError('firstName')"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          v-model="lastName"
          label="Zadejte příjmení"
          density="compact"
          variant="outlined"
          clearable
          :error-messages="errors.lastName ? [errors.lastName] : []"
          @blur="() => validateField('lastName', lastName, 'příjmení')"
          @click:clear="
            () => {
              lastName = '';
              clearFieldError('lastName');
            }
          "
          @update:modelValue="() => clearFieldError('lastName')"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          v-model="userName"
          label="Zadejte uživatelské jméno"
          density="compact"
          variant="outlined"
          clearable
          :error-messages="errors.userName ? [errors.userName] : []"
          @blur="() => validateField('userName', userName, 'uživatelské jméno')"
          @click:clear="
            () => {
              userName = '';
              clearFieldError('userName');
            }
          "
          @update:modelValue="() => clearFieldError('userName')"
        ></v-text-field>
      </v-col>
      <v-col>
        <PrimaryButton @click="addUser" text="Přidat uživatele" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import PrimaryButton from '@/components/button/PrimaryButton.vue';
  import { useUserStore } from '@/stores/UserStore';
  import { ref, onMounted, computed } from 'vue';

  const store = useUserStore();

  onMounted(() => {
    store.fetchUsers();
  });

  const users = computed(() => store.users);

  const firstName = ref('');
  const lastName = ref('');
  const userName = ref('');

  const errors = ref({
    firstName: '',
    lastName: '',
    userName: ''
  });

  const validateField = (field, value, fieldName) => {
    if (String(value).trim() === '') {
      errors.value[field] = `Neplatné ${fieldName}`;
      return false;
    }
    errors.value[field] = '';
    return true;
  };

  const validateAllFields = () => {
    const isFirstNameValid = validateField('firstName', firstName.value, 'jméno');
    const isLastNameValid = validateField('lastName', lastName.value, 'příjmení');
    const isUserNameValid = validateField('userName', userName.value, 'uživatelské jméno');
    return isFirstNameValid && isLastNameValid && isUserNameValid;
  };

  const clearFieldError = (field) => {
    errors.value[field] = '';
  };

  async function addUser() {
    if (!validateAllFields()) {
      return;
    }

    const data = {
      first_name: firstName.value,
      last_name: lastName.value,
      user_name: userName.value,
      password: 'admin123',
      isAdmin: false
    };

    try {
      await store.addUser(data);

      firstName.value = '';
      lastName.value = '';
      userName.value = '';

      Object.keys(errors.value).forEach((key) => (errors.value[key] = ''));
    } catch (error) {
      store.error = error.message;

      console.error('Failed to add user:', error);
    }
  }
</script>

<style scoped></style>

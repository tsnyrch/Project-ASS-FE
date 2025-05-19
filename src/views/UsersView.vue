<template>
  <v-container style="max-width: 1280px;">
    <v-row>
      <v-col>
        <div class="tw-text-2xl tw-mt-4">Uživatelé</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <div class="tw-text-xl tw-font-medium">Přidat nového uživatele</div>
      </v-col>
    </v-row>

    <v-row align-content="center">
      <v-col cols="12" md="6" class="pb-0">
        <v-text-field
          v-model="firstName"
          label="Jméno"
          variant="outlined"
					density="comfortable"
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
      <v-col cols="12" md="6" class="pb-0">
        <v-text-field
          v-model="lastName"
          label="Příjmení"
          variant="outlined"
					density="comfortable"
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
      <v-col cols="12" md="6" class="pb-0">
        <v-text-field
          v-model="userName"
          label="Uživatelské jméno"
          variant="outlined"
					density="comfortable"
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
			<v-col cols="12" md="6" class="pb-0">
				<v-text-field
					v-model="password"
					label="Heslo"
					variant="outlined"
					density="comfortable"
					clearable
					:append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
					:type="visible ? 'text' : 'password'"
					@click:append-inner="visible = !visible"
					:error-messages="errors.password ? [errors.password] : []"
					@blur="() => validateField('password', password, 'heslo')"
					@click:clear="
            () => {
              password = '';
              clearFieldError('password');
            }
          "
					@update:modelValue="() => clearFieldError('password')"
				></v-text-field>
			</v-col>
			<v-col cols="12" sm="6" class="pb-0">
				<v-checkbox
					v-model="isAdmin"
					label="Uživatel je administrátor"
					color="#77BE13"
				></v-checkbox>
			</v-col>
      <v-col cols="12" sm="6" class="pb-0 d-flex justify-end">
				<v-spacer></v-spacer>
        <PrimaryButton class="min-width: max-content;" size="large" @click="addUser" text="Přidat uživatele" />
      </v-col>
    </v-row>

		<v-row>
			<v-col>
				<div class="tw-text-xl tw-font-medium tw-mb-4 tw-mt-6">Seznam uživatel</div>
			</v-col>
		</v-row>

		<v-row v-for="(user, index) in users" :key="index" class="ma-0">
			<v-col class="pa-0">
				<v-card
					class="mx-auto tw-bg-white tw-shadow-sm hover:tw-shadow-md tw-border tw-border-gray-100 tw-rounded-lg tw-transition-all tw-duration-200 tw-mb-2"
					elevation="0"
				>
					<v-row class="pa-1">
						<v-col cols="12" sm="8">
							<v-card-title class="d-flex justify-start align-center text-body-1">
								<v-icon class="pr-3 tw-text-mendelu-green" v-if="user.is_admin">mdi-account-cog</v-icon>
								<v-icon class="pr-3 tw-text-gray-400" v-else>mdi-account</v-icon>
								<span class="tw-font-medium">{{ user.first_name }} {{ user.last_name }}</span>
							</v-card-title>
						</v-col>
						<v-col cols="12" sm="4" class="tw-flex tw-items-center tw-justify-end">
							<v-chip size="small" class="tw-mr-2 tw-bg-light-grey">{{ user.user_name }}</v-chip>
							<v-icon size="small" class="tw-text-gray-500">mdi-dots-vertical</v-icon>
						</v-col>
					</v-row>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup>
  import PrimaryButton from '@/components/button/PrimaryButton.vue';
  import { useUserStore } from '@/stores/UserStore';
  import { ref, onMounted, computed } from 'vue';
	import router from '@/router/index.js';

  const store = useUserStore();

  onMounted(() => {
		const is_admin = sessionStorage.getItem('is_admin');

		if (!is_admin) {
			router.push("/dashboard");
		}

    store.fetchUsers();
  });

  const users = computed(() => store.users);

  const firstName = ref('');
  const lastName = ref('');
  const userName = ref('');
	const password = ref('');
	const visible = ref(false);
	const isAdmin = ref(false);

	const errors = ref({
    firstName: '',
    lastName: '',
    userName: '',
		password: ''
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
		const isPasswordValid = validateField('password', password.value, 'heslo');
    return isFirstNameValid && isLastNameValid && isUserNameValid && isPasswordValid;
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
      password: password.value,
      is_admin: isAdmin.value,
    };

    try {
      await store.addUser(data);

      firstName.value = '';
      lastName.value = '';
      userName.value = '';
			password.value = '';
			isAdmin.value = false;

      Object.keys(errors.value).forEach((key) => (errors.value[key] = ''));
    } catch (error) {
      store.error = error.message;

      console.error('Failed to add user:', error);
    }
  }
</script>

<style scoped></style>

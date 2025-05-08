<template>
	<v-app>
		<v-main>
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
									<v-card-title
										class="d-flex justify-start align-center text-center text-body-1"
									>
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
							:error-messages="firstNameError ? ['Neplatné jméno'] : []"
							@blur="validateFirstName"
							@click:clear="clearFirstNameError"
						></v-text-field>
					</v-col>
					<v-col>
						<v-text-field
							v-model="lastName"
							label="Zadejte příjmení"
							density="compact"
							variant="outlined"
							clearable
							:error-messages="lastNameError ? ['Neplatné příjmení'] : []"
							@blur="validateLastName"
							@click:clear="clearLastNameError"
						></v-text-field>
					</v-col>
					<v-col>
						<v-text-field
							v-model="userName"
							label="Zadejte uživatelské jméno"
							density="compact"
							variant="outlined"
							clearable
							:error-messages="userNameError ? ['Neplatné uživatelské jméno'] : []"
							@blur="validateUserName"
							@click:clear="clearUserNameError"
						></v-text-field>
					</v-col>
					<v-col>
						<PrimaryButton @click="addUser" text="Přidat uživatele" />
					</v-col>
				</v-row>
			</v-container>
		</v-main>
	</v-app>
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
const firstNameError = ref(false);
const lastNameError = ref(false);
const userNameError = ref(false);

// Validation function
const validate = (refValue, errorRef) => {
	errorRef.value = refValue.value.trim() === '';
};

const clearError = (errorRef) => {
	errorRef.value = false;
};

// Wrappers for use in template
const validateFirstName = () => validate(firstName, firstNameError);
const validateLastName = () => validate(lastName, lastNameError);
const validateUserName = () => validate(userName, userNameError);

const clearFirstNameError = () => clearError(firstNameError);
const clearLastNameError = () => clearError(lastNameError);
const clearUserNameError = () => clearError(userNameError);

// Add user logic
function addUser() {
	validateFirstName();
	validateLastName();
	validateUserName();

	if (firstNameError.value || lastNameError.value || userNameError.value) {
		return;
	}

	const data = {
		first_name: firstName.value,
		last_name: lastName.value,
		user_name: userName.value,
		password: 'admin123',
		isAdmin: false,
	};

	try {
		store.addUser(data);
		// Clear inputs
		firstName.value = '';
		lastName.value = '';
		userName.value = '';
	} catch (error) {
		store.error = error.message;
	}
}
</script>

<style scoped></style>

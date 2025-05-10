<template>

			<error
				v-if="store.error"
				:text="store.error"
				@hide="store.clearError()"
			></error>

			<v-container>
				<v-row>
					<v-col>
						<div class="tw-text-2xl">Dobrý den, {{ first_name }}.</div>
					</v-col>
				</v-row>
				<v-row align="start" justify="start">
					<v-col cols="auto">
						<MeasurementWidget
							title="Poslední měření"
							:datetime="store.measurementInfo.lastMeasurement"
						/>
					</v-col>
					<v-col cols="auto">
						<MeasurementWidget
							title="Plánované měření"
							:datetime="store.measurementInfo.plannedMeasurement"
						/>
					</v-col>
				</v-row>

				<v-row>
					<v-col>
						<v-card class="pa-4">
							<v-row class="tw-flex tw-justify-between tw-items-center">
								<v-col>
									<v-card-title class="tw-pl-1">Manuální měření</v-card-title>
									<v-card-text
										@click="toggleSettings"
										class="tw-cursor-pointer tw-pl-1"
									>
										{{ showSettings ? 'Zobrazit méně' : 'Upravit nastavení' }}
										<v-icon>{{
											showSettings ? 'mdi-chevron-up' : 'mdi-chevron-down'
										}}</v-icon>
									</v-card-text>
								</v-col>

								<v-col class="tw-flex tw-justify-end">
									<LoadingButton
										:loading="loadingButton"
										text="Zahájit měření"
										loading-text="Probíhá měření"
										size="large"
										@click="updateConfig()"
									/>
								</v-col>
							</v-row>

							<v-expand-transition>
								<div v-if="!loading">
									<div v-show="showSettings" class="pt-4">
										<MeasurementSettings
											:multispectralCameraChecked="multispectralCameraChecked"
											@update:multispectralCameraChecked="
												updateMultispectralCameraChecked
											"
											:measurementDuration="measurementDuration"
											@update:measurementDuration="updateMeasurementDuration"
											:rgbCameraChecked="rgbCameraChecked"
											@update:rgbCameraChecked="updateRgbCameraChecked"
											:selectedSensorCount="selectedSensorCount"
											@update:selectedSensorCount="updateSelectedSensorCount"
											:rgbCameraSensors="rgbCameraSensors"
										/>
									</div>
								</div>
							</v-expand-transition>
						</v-card>
					</v-col>
				</v-row>

				<v-row>
					<v-col>
						<v-data-table
							:headers="headers"
							:items="measurements"
							title="Poslední měření"
							class="elevation-1"
						>
							<template v-slot:top>
								<v-toolbar flat dense class="tw-bg-white">
									<v-toolbar-title>Poslední měření </v-toolbar-title>
								</v-toolbar>
							</template>
							<thead>
								<tr>
									<th v-for="header in headers" :key="header.text">
										{{ header.text }}
									</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in displayedMeasurements" :key="item.name">
									<td>{{ formatDateMinutes(item.date_time) }}</td>
									<td>{{ item.number_of_sensors }}</td>
									<td>{{ item.length_of_ae }}</td>
									<td>{{ item.rgb_camera ? 'Ano' : 'Ne' }}</td>
									<td>{{ item.multispectral_camera ? 'Ano' : 'Ne' }}</td>
									<td>{{ item.scheduled ? 'Ano' : 'Ne' }}</td>
									<td>
										<PrimaryButton
											text="Stáhnout"
											@click="downloadData(item.id)"
										/>
									</td>
								</tr>
							</tbody>
							<template v-slot:bottom> </template>
						</v-data-table>
					</v-col>
				</v-row>
			</v-container>

</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useMeasurementsStore } from '@/stores/MeasurementsStore.js';
import PrimaryButton from '@/components/button/PrimaryButton.vue';
import LoadingButton from '@/components/button/LoadingButton.vue';
import MeasurementWidget from '@/components/measurements/MeasurementWidget.vue';
import MeasurementSettings from '@/components/measurements/MeasurementSettings.vue';
import Error from '../components/Error.vue';
import { formatDateMinutes } from '../utils';
import moment from 'moment';

const store = useMeasurementsStore();
const loading = ref(true);

const measurements = computed(() => store.measurementInfo.latestMeasurement);
const measurementsConfig = computed(() => store.measurementConfig);

const multispectralCameraChecked = ref(measurementsConfig.value.multispectral_camera);
const measurementDuration = ref(measurementsConfig.value.length_of_ae);
const rgbCameraChecked = ref(measurementsConfig.value.rgb_camera);
const selectedSensorCount = ref(measurementsConfig.value.number_of_sensors);
const rgbCameraSensors = ref([1, 2, 3, 4, 5, 6]);
const first_name = ref(sessionStorage.getItem('first_name'));
const loadingButton = ref(false);

onMounted(async () => {
	await store.fetchLatestMeasurements();

	loading.value = true;
	await store.fetchMeasurementConfig();

	measurementDuration.value = store.measurementConfig.length_of_ae;
	multispectralCameraChecked.value =
		store.measurementConfig.multispectral_camera;
	rgbCameraChecked.value = store.measurementConfig.rgb_camera;
	selectedSensorCount.value = store.measurementConfig.number_of_sensors;
	loading.value = false;
});

const headers = [
	{ text: 'Datum a čas', value: 'date' },
	{ text: 'Počet senzorů', value: 'sensors' },
	{ text: 'Délka AE', value: 'lengthOfAE' },
	{ text: 'RGB', value: 'rgb' },
	{ text: 'Multispektrální', value: 'multispectral' },
	{ text: 'Plánované měření', value: 'scheduled' },
	{ text: 'Stáhnout data', value: 'actions', sortable: false },
];

const showSettings = ref(false);

function updateConfig() {
	loadingButton.value = true;
	try {
		const currentTime = moment().local().toISOString();
		const data = {
			measurement_frequency: 60,
			first_measurement: currentTime,
			rgb_camera: rgbCameraChecked.value,
			multispectral_camera: multispectralCameraChecked.value,
			number_of_sensors: selectedSensorCount.value,
			length_of_ae: measurementDuration.value,
		};
		// Turned off for debugging...
		// TODO: store.updateMeasurementConfig(data);

		store.fetchManualMeasurementConfig().then(() => {
			console.log('Manual measurement ended');
			loadingButton.value = false;
		});
	} catch (error) {
		store.error = error.message;
	}
}

function updateMultispectralCameraChecked(value) {
	multispectralCameraChecked.value = value;
}

function updateMeasurementDuration(value) {
	measurementDuration.value = Number(value);
}

function updateRgbCameraChecked(value) {
	rgbCameraChecked.value = value;
}

function updateSelectedSensorCount(value) {
	selectedSensorCount.value = value;
}

function toggleSettings() {
	showSettings.value = !showSettings.value;
}

const downloadData = async (item) => {
	const data = JSON.stringify(item);
	const blob = await store.downloadMeasurementZip(item);
	const e = document.createEvent('MouseEvents'),
		a = document.createElement('a');
	a.download = Date.now().toString() + '.zip';
	a.href = window.URL.createObjectURL(blob);
	a.dataset.downloadurl = ['application/zip', a.download, a.href].join(':');
	e.initEvent(
		'click',
		true,
		false,
		window,
		0,
		0,
		0,
		0,
		0,
		false,
		false,
		false,
		false,
		0,
		null,
	);
	a.dispatchEvent(e);
	console.log('Stahuji data pro', item);
};

const displayedMeasurements = computed(() => {
	const data = measurements.value;
	if (!Array.isArray(data)) return [];
	return data.slice(0, 5).map((item) => ({
		...item,
		dateTime: formatDateMinutes(item.dateTime),
	}));
});
</script>

<style scoped></style>

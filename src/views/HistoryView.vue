<template>

			<error
				v-if="store.error"
				:text="store.error"
				@hide="store.clearError()"
			></error>
			<v-container>
				<v-row>
					<v-col>
						<div class="tw-text-2xl">Historie měření</div>
					</v-col>
				</v-row>
				<v-row>
					<v-col>
						<DateTimePickerRange
							v-model:startDate="defaultStartDate"
							v-model:endDate="defaultEndDate"
						/>
					</v-col>
				</v-row>

				<v-row>
					<v-col>
						<v-data-table
							:headers="headers"
							class="elevation-1"
							title="Poslední měření"
						>
							<template v-slot:top>
								<v-toolbar flat dense class="tw-bg-white">
									<v-toolbar-title
										>Měření mezi
										{{ moment(defaultStartDate).format('DD.MM.YYYY HH:mm:ss') }}
										– {{ moment(defaultEndDate).format('DD.MM.YYYY HH:mm:ss') }}
									</v-toolbar-title>
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
								<tr v-for="item in pagedMeasurements" :key="item.name">
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
						<div class="text-center pt-2">
							<v-pagination
								v-model="page"
								:length="pageCount"
								:total-visible="totalVisible"
								prev-icon="mdi-chevron-left"
								next-icon="mdi-chevron-right"
							></v-pagination>
							<div class="tw-text-dark-grey tw-text-xs">{{ rangeText }}</div>
						</div>
					</v-col>
				</v-row>
			</v-container>

</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import PrimaryButton from '@/components/button/PrimaryButton.vue';
import DateTimePickerRange from '@/components/datepickers/DateTimePickerRange.vue';
import moment from 'moment';
import { useMeasurementsStore } from '@/stores/MeasurementsStore.js';
import { formatDateMinutes } from '../utils';
import Error from '@/components/Error.vue';

const store = useMeasurementsStore();

onMounted(() => {
	store.fetchMeasurementHistory(defaultStartDate.value, defaultEndDate.value);
});

const measurements = computed(() => store.measurementHistory.measurements);

const headers = [
	{ text: 'Datum a čas', value: 'date' },
	{ text: 'Počet senzorů', value: 'sensors' },
	{ text: 'Délka AE', value: 'lengthOfAE' },
	{ text: 'RGB', value: 'rgb' },
	{ text: 'Multispektrální', value: 'multispectral' },
	{ text: 'Plánované měření', value: 'scheduled' },
	{ text: 'Stáhnout data', value: 'actions', sortable: false },
];

const page = ref(1);
const itemsPerPage = 15;
const totalVisible = 4;

const totalItems = computed(() => measurements.value?.length ?? 0);
const pageCount = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const pagedMeasurements = computed(() => {
	const all = Array.isArray(measurements.value) ? measurements.value : [];
	const startIndex = (page.value - 1) * itemsPerPage;
	return all.slice(startIndex, startIndex + itemsPerPage);
});

const rangeText = computed(() => {
	const startIndex = (page.value - 1) * itemsPerPage + 1;
	const endIndex = Math.min(page.value * itemsPerPage, totalItems.value);
	return `${startIndex}-${endIndex} z ${totalItems.value}`;
});

// start date is 7 days ago
const defaultStartDate = ref(new Date());
defaultStartDate.value.setDate(defaultStartDate.value.getDate() - 7);

// end date is now
const defaultEndDate = ref(new Date());

watch([defaultStartDate, defaultEndDate], () => {
	const formattedStartDate = moment(
		defaultStartDate.value,
		'DD.MM.YYYY HH:mm:ss',
	).format('YYYY-MM-DDTHH:mm:ss');
	const formattedEndDate = moment(
		defaultEndDate.value,
		'DD.MM.YYYY HH:mm:ss',
	).format('YYYY-MM-DDTHH:mm:ss');

	if (formattedStartDate !== "Invalid date" && formattedEndDate !== "Invalid date") {
			store.fetchMeasurementHistory(formattedStartDate, formattedEndDate);
	} else {
		console.error("Invalid history date range:", formattedStartDate, "–",  formattedEndDate);
	}
});

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
</script>

<style scoped></style>

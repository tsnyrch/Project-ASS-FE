<template>
  <error v-if="store.error" :text="store.error" @hide="store.clearError()"></error>

  <v-container style="max-width: 1280px;">
    <v-row>
      <v-col>
        <div class="tw-text-2xl tw-mt-4 tw-mb-2">Dobrý den, {{ first_name }}.</div>
      </v-col>
    </v-row>
    <v-row align="start" justify="start">
      <v-col cols="12" sm="auto">
        <MeasurementWidget title="Poslední měření" :datetime="store.measurementInfo.lastMeasurement" />
      </v-col>
      <v-col cols="12" sm="auto">
        <MeasurementWidget title="Plánované měření" :datetime="store.measurementInfo.plannedMeasurement" />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="tw-py-5 tw-px-6 tw-shadow-sm tw-rounded-xl tw-bg-gradient-to-r tw-from-white tw-to-light-grey/10 tw-border tw-border-gray-100">
          <v-row class="tw-flex tw-justify-between tw-items-center">
            <v-col>
              <v-card-title class="tw-pl-1 tw-font-semibold">Manuální měření</v-card-title>
              <v-card-text @click="toggleSettings" class="tw-cursor-pointer tw-pl-1 tw-flex tw-items-center tw-text-mendelu-green">
                {{ showSettings ? 'Zobrazit méně' : 'Upravit nastavení' }}
                <v-icon class="tw-ml-1">{{ showSettings ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-card-text>
            </v-col>

            <v-col class="tw-flex tw-justify-end">
              <LoadingButton :loading="loadingButton" text="Zahájit měření" loading-text="Probíhá měření" size="large" @click="updateConfig()" />
            </v-col>
          </v-row>

          <v-expand-transition>
            <div v-if="!loading">
              <div v-show="showSettings" class="pt-4">
                <MeasurementSettings
                  :multispectralCameraChecked="multispectralCameraChecked"
                  @update:multispectralCameraChecked="updateMultispectralCameraChecked"
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
        <v-card class="tw-rounded-xl tw-overflow-hidden tw-border tw-border-gray-100 tw-shadow-sm tw-mb-6">
          <v-data-table :headers="headers" :items="displayedMeasurements" :items-per-page="5" hide-default-footer class="tw-bg-white" item-value="id">
            <template v-slot:top>
              <v-toolbar flat dense class="tw-bg-white tw-border-b tw-border-gray-100">
                <v-toolbar-title class="tw-font-medium tw-text-gray-800">Poslední měření</v-toolbar-title>
              </v-toolbar>
            </template>

            <template v-slot:item.date_time="{ item }">
              {{ formatDateMinutes(item.date_time || item.columns?.date_time || item.raw?.date_time) }}
            </template>

            <template v-slot:item.rgb_camera="{ item }">
              {{ item.rgb_camera || item.columns?.rgb_camera || item.raw?.rgb_camera ? 'Ano' : 'Ne' }}
            </template>

            <template v-slot:item.multispectral_camera="{ item }">
              {{ item.multispectral_camera || item.columns?.multispectral_camera || item.raw?.multispectral_camera ? 'Ano' : 'Ne' }}
            </template>

            <template v-slot:item.scheduled="{ item }">
              {{ item.scheduled || item.columns?.scheduled || item.raw?.scheduled ? 'Ano' : 'Ne' }}
            </template>

            <template v-slot:item.actions="{ item }">
              <PrimaryButton text="Stáhnout" @click="downloadData(item.id || item.raw?.id)" />
            </template>
          </v-data-table>
        </v-card>
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
    multispectralCameraChecked.value = store.measurementConfig.multispectral_camera;
    rgbCameraChecked.value = store.measurementConfig.rgb_camera;
    selectedSensorCount.value = store.measurementConfig.number_of_sensors;
    loading.value = false;
  });

  const headers = [
    { title: 'Datum a čas', key: 'date_time', align: 'start' },
    { title: 'Počet senzorů', key: 'number_of_sensors', align: 'center' },
    { title: 'Délka AE', key: 'length_of_ae', align: 'center' },
    { title: 'RGB', key: 'rgb_camera', align: 'center' },
    { title: 'Multispektrální', key: 'multispectral_camera', align: 'center' },
    { title: 'Plánované měření', key: 'scheduled', align: 'center' },
    { title: 'Stáhnout data', key: 'actions', sortable: false, align: 'end' }
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
        length_of_ae: measurementDuration.value
      };

      store.updateMeasurementConfig(data);

      store.fetchManualMeasurementConfig().then(() => {
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
    e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
  };

  const displayedMeasurements = computed(() => {
    const data = measurements.value;
    if (!Array.isArray(data)) return [];
    return data.slice(0, 5);
  });
</script>

<style scoped></style>

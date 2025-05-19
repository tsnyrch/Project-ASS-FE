<template>
  <v-container style="max-width: 1280px;">
    <v-row>
      <v-col>
        <div class="tw-text-2xl tw-mt-4 tw-mb-2">Nastavení</div>
      </v-col>
    </v-row>

    <v-row align="start" justify="start" class="tw-mb-6">
      <v-col cols="12" sm="auto">
        <MeasurementWidget title="Poslední měření" :datetime="store.measurementInfo.lastMeasurement" />
      </v-col>
      <v-col cols="12" sm="auto">
        <MeasurementWidget title="Plánované měření" :datetime="store.measurementInfo.plannedMeasurement" />
      </v-col>
    </v-row>

		<hr class="tw-mb-8 tw-border-gray-100">

    <v-row>
      <v-col>
        <div class="tw-text-xl tw-font-medium tw-mb-2">Plán automatického měření</div>
      </v-col>
    </v-row>
    <v-row class="tw-mb-2">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="measurementFrequency"
          type="number"
          min="0"
          label="Doba mezi dvěma měřeními (minuty)"
          placeholder="Zadejte délku v minutách"
          variant="outlined"
          hide-details="auto"
					density="comfortable"
				></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <DateTimePickerSingle v-model="measurementDate" label="Datum a čas prvního měření" />
      </v-col>
    </v-row>

		<hr class="tw-mb-8 tw-border-gray-100">

		<v-row>
      <v-col>
        <div class="tw-text-xl tw-font-medium">Parametry měření</div>
      </v-col>
    </v-row>
    <v-row class="tw-mb-6">
      <v-col cols="12">
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
      </v-col>
    </v-row>

    <v-row>
      <v-col class="tw-text-right">
        <PrimaryButton text="Uložit nastavení" @click="updateConfig()" size="large" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import MeasurementWidget from '@/components/measurements/MeasurementWidget.vue';
  import MeasurementSettings from '@/components/measurements/MeasurementSettings.vue';
  import DateTimePickerSingle from '@/components/datepickers/DateTimePickerSingle.vue';
  import PrimaryButton from '@/components/button/PrimaryButton.vue';
  import { useMeasurementsStore } from '@/stores/MeasurementsStore';
  import { onMounted } from 'vue';
	import router from '@/router/index.js';

  const emits = defineEmits(['update:measurementFrequency']);

  const store = useMeasurementsStore();
  const loading = ref(true);

  const measurements = computed(() => store.measurementInfo.latestMeasurement);
  const measurementsConfig = computed(() => store.measurementConfig);

  const multispectralCameraChecked = ref(measurementsConfig.value.multispectralCamera);
  const measurementDuration = ref(measurementsConfig.value.lengthOfAE);
  const rgbCameraChecked = ref(measurementsConfig.value.rgbCamera);
  const selectedSensorCount = ref(measurementsConfig.value.numberOfSensors);
  const rgbCameraSensors = ref([1, 2, 3, 4, 5, 6]);
  const measurementFrequency = ref(measurementsConfig.value.measurementFrequency);
  // Ensure measurementDate in DateTimePickerSingle uses `v-model` correctly.
  // If DateTimePickerSingle emits 'update:modelValue', then use v-model="measurementDate"
  const measurementDate = ref(measurementsConfig?.value?.firstMeasurement ?? new Date());

  onMounted(async () => {
		const is_admin = sessionStorage.getItem('is_admin');
		if (!is_admin) {
			await router.push("/dashboard")
			return;
		}

		loading.value = true;
    await store.fetchLatestMeasurements();
    await store.fetchMeasurementConfig();

    measurementDuration.value = store.measurementConfig.length_of_ae;
    multispectralCameraChecked.value = store.measurementConfig.multispectral_camera;
    rgbCameraChecked.value = store.measurementConfig.rgb_camera;
    selectedSensorCount.value = store.measurementConfig.number_of_sensors;
    measurementFrequency.value = store.measurementConfig.measurement_frequency;
    measurementDate.value = store.measurementConfig.first_measurement ? new Date(store.measurementConfig.first_measurement) : new Date();
    loading.value = false;
  });

  function updateConfig() {
    try {
      const data = {
        measurement_frequency: Number(measurementFrequency.value),
        first_measurement: measurementDate.value,
        rgb_camera: rgbCameraChecked.value,
        multispectral_camera: multispectralCameraChecked.value,
        number_of_sensors: selectedSensorCount.value,
        length_of_ae: Number(measurementDuration.value)
      };
      console.log('Updating config with:', data);
			store.updateMeasurementConfig(data);
    } catch (error) {
      store.error = error.message;
      console.error('Error updating config:', error);
    }
  }

  watch(measurementFrequency, (newValue) => {
    emits('update:measurementFrequency', newValue);
  });

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

  const showSettings = ref(false);
  function toggleSettings() {
    showSettings.value = !showSettings.value;
  }
</script>

<style scoped>
  /* Add any specific scoped styles if needed */
</style>

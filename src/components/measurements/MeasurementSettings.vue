<template>
  <v-row class="">
    <v-col cols="12" md="6" class="pl-0 pt-0 pb-0">
      <v-checkbox
        v-model="localMultispectralCameraChecked"
        label="Multispektrální kamera"
        color="#77BE13"
				class="ml-3"
      ></v-checkbox>
      <v-text-field
        v-model="localMeasurementDuration"
        type="number"
        min="0"
        class="tw-pl-3"
        label="Délka měření akustické emise"
        placeholder="Zadejte délku v minutách"
				density="comfortable"
				variant="outlined"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="6" class="pt-0">
      <v-checkbox class="ml-0" v-model="localRgbCameraChecked" label="RGB kamera" color="#77BE13"></v-checkbox>
      <v-select v-model="localSelectedSensorCount" density="comfortable" variant="outlined" label="Počet senzorů" :items="rgbCameraSensors" placeholder="Vyberte počet"></v-select>
    </v-col>
  </v-row>
</template>

<script setup>
  import { defineProps, defineEmits, ref, watch, onUpdated } from 'vue';

  const props = defineProps({
    multispectralCameraChecked: Boolean,
    measurementDuration: Number,
    rgbCameraChecked: Boolean,
    selectedSensorCount: Number,
    rgbCameraSensors: Array
  });

  const emits = defineEmits(['update:multispectralCameraChecked', 'update:rgbCameraChecked', 'update:measurementDuration', 'update:selectedSensorCount']);

  const localMeasurementDuration = ref(props.measurementDuration);
  const localSelectedSensorCount = ref(props.selectedSensorCount);
  const localMultispectralCameraChecked = ref(props.multispectralCameraChecked);
  const localRgbCameraChecked = ref(props.rgbCameraChecked);

  watch(localMeasurementDuration, (newValue) => {
    emits('update:measurementDuration', newValue);
  });

  watch(localSelectedSensorCount, (newValue) => {
    emits('update:selectedSensorCount', newValue);
  });
  
  watch(localMultispectralCameraChecked, (newValue) => {
    emits('update:multispectralCameraChecked', newValue);
  });

  watch(localRgbCameraChecked, (newValue) => {
    emits('update:rgbCameraChecked', newValue);
  });

  onUpdated(() => {
    localMeasurementDuration.value = props.measurementDuration;
    localSelectedSensorCount.value = props.selectedSensorCount;
    localMultispectralCameraChecked.value = props.multispectralCameraChecked;
    localRgbCameraChecked.value = props.rgbCameraChecked;
  });
</script>

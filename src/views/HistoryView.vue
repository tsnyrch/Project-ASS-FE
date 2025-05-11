<template>
  <error v-if="store.error" :text="store.error" @hide="store.clearError()"></error>
  <v-container>
    <v-row>
      <v-col>
        <div class="tw-text-2xl">Historie měření</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <DateTimePickerRange
          :initialStartDate="defaultStartDate"
          :initialEndDate="defaultEndDate"
          @update:startDate="(newVal) => (defaultStartDate = newVal)"
          @update:endDate="(newVal) => (defaultEndDate = newVal)"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="tw-rounded-xl tw-overflow-hidden tw-border tw-border-gray-100 tw-shadow-sm">
          <v-data-table
            :headers="headers"
            :items="measurements"
            :items-per-page="itemsPerPage"
            :page="page"
            :items-length="totalItems"
            hide-default-footer
            class="tw-bg-white"
            item-value="id"
            @update:page="updatePage"
          >
            <template v-slot:top>
              <v-toolbar flat dense class="tw-bg-white tw-border-b tw-border-gray-100">
                <v-toolbar-title class="tw-font-medium">
                  Měření mezi
                  {{ moment(defaultStartDate).format('DD.MM.YYYY HH:mm:ss') }}
                  – {{ moment(defaultEndDate).format('DD.MM.YYYY HH:mm:ss') }}
                </v-toolbar-title>
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

          <div class="tw-bg-white tw-px-4 tw-py-3 tw-border-t tw-border-gray-100 tw-flex tw-justify-between tw-items-center">
            <div class="tw-text-dark-grey tw-text-sm">{{ rangeText }}</div>
            <v-pagination
              v-model="page"
              :length="pageCount"
              :total-visible="totalVisible"
              prev-icon="mdi-chevron-left"
              next-icon="mdi-chevron-right"
              rounded
              class="tw-mb-0"
            ></v-pagination>
          </div>
        </v-card>
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

  const defaultStartDate = ref(new Date());
  defaultStartDate.value.setDate(defaultStartDate.value.getDate() - 7);

  const defaultEndDate = ref(new Date());

  onMounted(async () => {
    const formattedStartDate = moment(defaultStartDate.value).toISOString();
    const formattedEndDate = moment(defaultEndDate.value).toISOString();
    await store.fetchMeasurementHistory(formattedStartDate, formattedEndDate);
  });

  const measurements = computed(() => store.measurementHistory.measurements);

  const headers = [
    { title: 'Datum a čas', key: 'date_time', align: 'start' },
    { title: 'Počet senzorů', key: 'number_of_sensors', align: 'center' },
    { title: 'Délka AE', key: 'length_of_ae', align: 'center' },
    { title: 'RGB', key: 'rgb_camera', align: 'center' },
    { title: 'Multispektrální', key: 'multispectral_camera', align: 'center' },
    { title: 'Plánované měření', key: 'scheduled', align: 'center' },
    { title: 'Stáhnout data', key: 'actions', sortable: false, align: 'end' }
  ];

  const page = ref(1);
  const itemsPerPage = 15;
  const totalVisible = 4;

  const totalItems = computed(() => measurements.value?.length ?? 0);
  const pageCount = computed(() => Math.ceil(totalItems.value / itemsPerPage));

  function updatePage(newPage) {
    page.value = newPage;
  }

  const rangeText = computed(() => {
    const startIndex = (page.value - 1) * itemsPerPage + 1;
    const endIndex = Math.min(page.value * itemsPerPage, totalItems.value);
    return `${startIndex}-${endIndex} z ${totalItems.value}`;
  });

  watch(
    [defaultStartDate, defaultEndDate],
    async (newValues, oldValues) => {
      if (newValues[0] === oldValues[0] && newValues[1] === oldValues[1]) {
        return;
      }

      const startDate = newValues[0];
      const endDate = newValues[1];

      if (!(startDate instanceof Date) || !(endDate instanceof Date) || isNaN(startDate) || isNaN(endDate)) {
        console.error('Invalid date objects in watcher:', startDate, endDate);
        return;
      }

      const formattedStartDate = moment(startDate).toISOString();
      const formattedEndDate = moment(endDate).toISOString();

      await store.fetchMeasurementHistory(formattedStartDate, formattedEndDate);
    },
    { deep: true }
  );

  const downloadData = async (itemId) => {
    const blob = await store.downloadMeasurementZip(itemId);
    const e = document.createEvent('MouseEvents'),
      a = document.createElement('a');
    a.download = Date.now().toString() + '.zip';
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['application/zip', a.download, a.href].join(':');
    e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
  };
</script>

<style scoped></style>

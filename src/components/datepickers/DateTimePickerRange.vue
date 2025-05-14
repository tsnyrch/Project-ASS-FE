<template>
  <v-dialog v-model="dialog" max-width="700px" scrollable>
    <template v-slot:activator="{ props }">
      <v-text-field
        v-bind="props"
        v-model="formattedRange"
        label="Vyberte časové rozmezí"
        prepend-inner-icon="mdi-calendar-range"
        readonly
        @click:clear="clearRange"
        class="tw-bg-white tw-rounded-md"
        variant="outlined"
      ></v-text-field>
    </template>

    <v-card>
      <v-card-title class="tw-bg-mendelu-green tw-text-white">Vyberte časové rozmezí</v-card-title>

      <v-card-text class="tw-py-4">
        <v-row>
          <v-col cols="12" sm="6">
            <v-sheet class="tw-mb-4 tw-p-2 tw-border tw-rounded tw-border-mendelu-green/20">
              <div class="tw-text-center tw-mb-2 tw-font-medium">Od</div>
              <v-date-picker locale="cs" v-model="startDatePicker" color="mendelu-green" header-color="mendelu-green" class="tw-mx-auto"></v-date-picker>
              <v-text-field
                v-model="startTime"
                label="Čas od"
                type="time"
                variant="outlined"
                color="mendelu-green"
                prepend-inner-icon="mdi-clock-outline"
                class="tw-mt-4"
              ></v-text-field>
            </v-sheet>
          </v-col>

          <v-col cols="12" sm="6">
            <v-sheet class="tw-mb-4 tw-p-2 tw-border tw-rounded tw-border-mendelu-green/20">
              <div class="tw-text-center tw-mb-2 tw-font-medium">Do</div>
              <v-date-picker locale="cs" v-model="endDatePicker" color="mendelu-green" header-color="mendelu-green" class="tw-mx-auto"></v-date-picker>
              <v-text-field
                v-model="endTime"
                label="Čas do"
                type="time"
                variant="outlined"
                color="mendelu-green"
                prepend-inner-icon="mdi-clock-outline"
                class="tw-mt-4"
              ></v-text-field>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="tw-px-4 tw-pb-4">
        <v-btn variant="text" color="grey-darken-1" @click="setDefaultRangeAndPickers">Posledních 7 dní</v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="dialog = false" color="grey-darken-1">Zrušit</v-btn>
        <v-btn variant="elevated" @click="selectRange" class="tw-bg-mendelu-green tw-rounded-xl tw-text-white tw-normal-case">Potvrdit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import moment from 'moment';

  const props = defineProps({
    // Renaming props to avoid conflict with internal refs if we use the same names
    initialStartDate: {
      type: [Date, String, null],
      required: true
    },
    initialEndDate: {
      type: [Date, String, null],
      required: true
    }
  });

  const emit = defineEmits(['update:startDate', 'update:endDate']);

  const dialog = ref(false);
  // Use different names for internal picker models to avoid confusion with props
  const startDatePicker = ref(null); // For v-date-picker (expects Date object)
  const startTime = ref(''); // For time input "HH:mm"
  const endDatePicker = ref(null); // For v-date-picker (expects Date object)
  const endTime = ref(''); // For time input "HH:mm"

  const initializePickers = () => {
    let startMoment = props.initialStartDate ? moment(props.initialStartDate) : moment().subtract(7, 'days');
    if (!startMoment.isValid()) startMoment = moment().subtract(7, 'days');

    let endMoment = props.initialEndDate ? moment(props.initialEndDate) : moment();
    if (!endMoment.isValid()) endMoment = moment();

    startDatePicker.value = startMoment.toDate();
    startTime.value = startMoment.format('HH:mm');
    endDatePicker.value = endMoment.toDate();
    endTime.value = endMoment.format('HH:mm');
  };

  const formattedRange = computed(() => {
    if (!props.initialStartDate || !props.initialEndDate) return '';
    const startM = moment(props.initialStartDate);
    const endM = moment(props.initialEndDate);
    if (!startM.isValid() || !endM.isValid()) return '';
    return `${startM.format('DD.MM.YYYY HH:mm')} – ${endM.format('DD.MM.YYYY HH:mm')}`;
  });

  const setDefaultRangeAndPickers = () => {
    const now = moment();
    const weekAgo = moment().subtract(7, 'days');

    startDatePicker.value = weekAgo.toDate();
    startTime.value = weekAgo.format('HH:mm');
    endDatePicker.value = now.toDate();
    endTime.value = now.format('HH:mm');
    // Optionally emit update immediately or wait for "Potvrdit"
    // emit('update:startDate', weekAgo.toDate());
    // emit('update:endDate', now.toDate());
  };

  const selectRange = () => {
    if (!startDatePicker.value || !endDatePicker.value || !startTime.value || !endTime.value) return;

    const startMomentDate = moment(startDatePicker.value).format('YYYY-MM-DD');
    const endMomentDate = moment(endDatePicker.value).format('YYYY-MM-DD');

    const startObj = moment(`${startMomentDate} ${startTime.value}`, 'YYYY-MM-DD HH:mm').toDate();
    const endObj = moment(`${endMomentDate} ${endTime.value}`, 'YYYY-MM-DD HH:mm').toDate();

    if (moment(startObj).isAfter(endObj)) {
      alert('Počáteční datum musí být před koncovým datem.');
      return;
    }

    emit('update:startDate', startObj);
    emit('update:endDate', endObj);
    dialog.value = false;
  };

  const clearRange = () => {
    // Set to default (last 7 days) and emit
    const now = moment();
    const weekAgo = moment().subtract(7, 'days');

    // Update internal pickers
    startDatePicker.value = weekAgo.toDate();
    startTime.value = weekAgo.format('HH:mm');
    endDatePicker.value = now.toDate();
    endTime.value = now.format('HH:mm');

    // Emit the cleared/default range
    emit('update:startDate', weekAgo.toDate());
    emit('update:endDate', now.toDate());
  };

  watch(
    () => [props.initialStartDate, props.initialEndDate],
    () => {
      initializePickers();
    },
    { immediate: true, deep: true }
  );

  watch(dialog, (isOpen) => {
    if (isOpen) {
      initializePickers(); // Re-initialize when dialog opens
    }
  });
</script>

<template>
  <v-dialog v-model="dialog" width="auto" scrollable>
    <template v-slot:activator="{ props }">
      <v-text-field
        v-bind="props"
        v-model="formattedDate"
        :label="label"
        prepend-inner-icon="mdi-calendar"
        readonly
        @click:clear="clearDate"
				density="comfortable"
				class="tw-bg-white tw-rounded-md"
        variant="outlined"
      ></v-text-field>
    </template>

    <v-card>
      <v-card-title class="tw-bg-mendelu-green tw-text-white">Vyberte datum a čas</v-card-title>

      <v-card-text class="tw-py-4">
        <v-row>
          <v-col cols="12">
            <v-date-picker locale="cs" v-model="pickerDate" class="tw-mx-auto" color="mendelu-green" header-color="mendelu-green"></v-date-picker>
          </v-col>
          <v-col cols="12" class="mt-4">
            <v-text-field
              v-model="pickerTime"
              label="Čas"
              type="time"
              variant="outlined"
              color="mendelu-green"
              prepend-inner-icon="mdi-clock-outline"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="tw-px-4 tw-pb-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="dialog = false" color="grey-darken-1">Zrušit</v-btn>
        <v-btn variant="elevated" @click="selectDate" class="tw-bg-mendelu-green tw-rounded-xl tw-text-white tw-normal-case">Vybrat datum</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import moment from 'moment';

  const props = defineProps({
    modelValue: {
      type: [Date, String, null],
      default: () => new Date()
    },
    label: {
      type: String,
      default: 'Vyberte datum a čas'
    }
  });

  const emit = defineEmits(['update:modelValue']);

  const dialog = ref(false);
  const pickerDate = ref(null); // Initialize as null or a Date object
  const pickerTime = ref(''); // Stores time as "HH:mm"

  // Initialize the date pickers with the current value
  const initializePickers = () => {
    let initialDate = props.modelValue ? moment(props.modelValue) : moment();
    if (!initialDate.isValid()) {
      initialDate = moment();
    }

    // For v-date-picker, it's better to pass Date objects if possible
    // or ensure the string format is YYYY-MM-DD, which moment().toDate() can help with
    // v-date-picker v-model usually expects a Date object or a string that it can parse.
    // Let's ensure pickerDate gets a Date object for v-date-picker
    pickerDate.value = initialDate.toDate();
    pickerTime.value = initialDate.format('HH:mm');
  };

  // Format the date for display in the input field
  const formattedDate = computed(() => {
    if (!props.modelValue) return '';
    const date = moment(props.modelValue);
    return date.isValid() ? date.format('DD.MM.YYYY HH:mm') : ''; // Display HH:mm
  });

  // Combine date and time and emit the new value
  const selectDate = () => {
    if (!pickerDate.value || !pickerTime.value) {
      // Handle case where date or time might not be fully selected
      // Or rely on default/initial values if that's desired
      return;
    }

    const datePart = moment(pickerDate.value).format('YYYY-MM-DD');
    const timePart = pickerTime.value; // Already "HH:mm"

    const dateTimeString = `${datePart} ${timePart}`;
    const dateObj = moment(dateTimeString, 'YYYY-MM-DD HH:mm').toDate();

    emit('update:modelValue', dateObj);
    dialog.value = false;
  };

  // Clear the selected date
  const clearDate = () => {
    emit('update:modelValue', null);
    // Optionally reset pickers to current time or leave them
    // initializePickers(); // if you want to reset to current time on clear
  };

  // Watch for external changes to modelValue and when dialog opens
  watch(
    () => props.modelValue,
    (newValue) => {
      initializePickers();
    },
    { immediate: true }
  );

  watch(dialog, (isOpen) => {
    if (isOpen) {
      initializePickers(); // Re-initialize when dialog opens to reflect current modelValue
    }
  });
</script>

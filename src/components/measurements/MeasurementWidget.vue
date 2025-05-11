<template>
  <v-card
    class="mx-auto tw-bg-white tw-shadow-md tw-rounded-xl tw-border-l-4 tw-border-mendelu-green tw-p-2 tw-transition-all tw-duration-200"
    elevation="0"
    max-width="auto"
  >
    <v-card-item class="tw-px-4 tw-py-3">
      <div>
        <div class="text-overline tw-text-mendelu-green tw-font-medium tw-mb-1">{{ title }}</div>
        <div class="text-h6 tw-mb-1 tw-font-semibold">
          {{ formattedDate }}
        </div>
      </div>
    </v-card-item>
  </v-card>
</template>

<script setup>
  import { computed } from 'vue';
  import { formatDateMinutes } from '@/utils';
  import moment from 'moment';

  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    datetime: {
      type: [Date, String, null],
      default: null
    }
  });

  const formattedDate = computed(() => {
    if (!props.datetime) {
      return 'Není naplánováno';
    }

    try {
      const momentDate = moment(props.datetime);
      if (!momentDate.isValid()) {
        return 'Neplatné datum';
      }
      return formatDateMinutes(props.datetime);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Chyba data';
    }
  });
</script>

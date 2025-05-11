// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import { cs, en } from 'vuetify/locale';

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'cs',
    fallback: 'en',
    messages: { cs, en }
  }
});

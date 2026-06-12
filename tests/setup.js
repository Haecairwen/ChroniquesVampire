import { config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import en from '../src/i18n/locales/en.json';

// Match the Vue Test Utils v1 behaviour these specs were written against:
// auto-generated stubs render their default slot content (button labels,
// headings, etc.), which many assertions read via wrapper.text().
config.global.renderStubDefaultSlot = true;

// Components translate their strings through vue-i18n; specs assert the
// English text, so mount everything with a deterministic English locale.
config.global.plugins = [
    ...(config.global.plugins ?? []),
    createI18n({
        legacy: false,
        globalInjection: true,
        locale: 'en',
        fallbackLocale: 'en',
        messages: { en },
    }),
];

import { config } from '@vue/test-utils';

// Match the Vue Test Utils v1 behaviour these specs were written against:
// auto-generated stubs render their default slot content (button labels,
// headings, etc.), which many assertions read via wrapper.text().
config.global.renderStubDefaultSlot = true;

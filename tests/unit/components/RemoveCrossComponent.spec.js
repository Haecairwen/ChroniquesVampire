import RemoveCrossComponent from "Components/RemoveCrossComponent";
import { shallowMount } from "@vue/test-utils";

describe("components/RemoveCrossComponent.vue", () => {
  it("Has the correct component name", () => {
    expect(RemoveCrossComponent.name).toEqual("RemoveCrossComponent");
  });

  it("Renders the correct content", () => {
    const wrapper = shallowMount(RemoveCrossComponent);

    const classes = [
      "cursor-pointer",
      "select-none",
      "mx-1",
      "hover:text-blood-400",
    ];

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes("title")).toBe("Remove item");
    expect(wrapper.text()).toBe(`×`);
    expect(wrapper.classes()).toEqual(classes);
  });

  it("Arms on first click instead of emitting a 'remove' event.", async () => {
    const wrapper = shallowMount(RemoveCrossComponent);
    const span = wrapper.find('span');

    span.trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted().remove).toBeFalsy();
    expect(wrapper.text()).toBe('Sure?');
    expect(wrapper.attributes("title")).toBe("Click again to confirm");
    expect(wrapper.classes()).toContain('text-blood-500');
  });

  it("Emits a 'remove' event when clicked twice.", async () => {
    const wrapper = shallowMount(RemoveCrossComponent);
    const span = wrapper.find('span');

    span.trigger('click');
    await wrapper.vm.$nextTick();

    span.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted().remove).toBeTruthy();
    expect(wrapper.text()).toBe(`×`);
  });

  it("Disarms automatically after a delay.", async () => {
    vi.useFakeTimers();

    const wrapper = shallowMount(RemoveCrossComponent);
    const span = wrapper.find('span');

    span.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toBe('Sure?');

    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toBe(`×`);
    expect(wrapper.emitted().remove).toBeFalsy();

    vi.useRealTimers();
  });
});

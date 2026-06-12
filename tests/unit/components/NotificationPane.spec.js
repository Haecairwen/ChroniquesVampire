import NotificationPane from "Components/NotificationPane";
import { shallowMount } from "@vue/test-utils";
import { createStore } from 'vuex';

const TYPES = {
  default: ["border-gilt-600", "bg-night-800", "text-parchment-200"],
  danger: ["border-blood-600", "bg-blood-950/70", "text-blood-200"],
  warning: ["border-gilt-500", "bg-night-800", "text-gilt-300"],
};

describe("NotificationPane", () => {
  let store;
  let state;
  let mutations;

  beforeEach(() => {
    state = {
      message: "",
      visible: false,
      type: "default",
    };

    mutations = {
      hide: vi.fn(),
    };

    store = createStore({
      modules: {
        notifications: {
          state,
          mutations,
          namespaced: true,
        },
      },
    });
  });

  it("Has the correct component name", () => {
    expect(NotificationPane.name).toEqual("NotificationPane");
  });

  it("Displays the correct message", () => {
    const message = "Test message";
    state.message = message;
    const wrapper = shallowMount(NotificationPane, { global: { plugins: [store] } });
    expect(wrapper.text()).toContain(message);
  });

  it.each(Object.keys(TYPES))(
    "Displays the correct type of notification - %s",
    (type) => {
      state.type = type;
      const wrapper = shallowMount(NotificationPane, { global: { plugins: [store] } });
      const classes = TYPES[type];
      expect(wrapper.find("div").classes()).toEqual(
        expect.arrayContaining(classes)
      );
    }
  );

  it("Hides after a certain amount of time", async () => {
    const wrapper = shallowMount(NotificationPane, {
      global: { plugins: [store] },
      data() {
        return {
          timeout: 100,
        };
      },
    });
    // Mutate via the store proxy: raw-object writes bypass Vue 3 reactivity.
    store.state.notifications.visible = true;
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mutations.hide).toHaveBeenCalled();
  });

  it("Emits a 'remove' event when the remove cross component is clicked", () => {
    const wrapper = shallowMount(NotificationPane, { global: { plugins: [store] } });
    const removeCross = wrapper.findComponent({ name: "RemoveCrossComponent" });
    removeCross.vm.$emit("remove");
    expect(mutations.hide).toHaveBeenCalled();
  });
});

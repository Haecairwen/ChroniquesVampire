import NotificationPane from "Components/NotificationPane";
import { shallowMount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { useNotificationsStore } from "Stores/notifications";

const TYPES = {
  default: ["border-gilt-600", "bg-night-800", "text-parchment-200"],
  danger: ["border-blood-600", "bg-blood-950/70", "text-blood-200"],
  warning: ["border-gilt-500", "bg-night-800", "text-gilt-300"],
};

const mountPane = (state = {}, options = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      notifications: {
        message: "",
        visible: false,
        type: "default",
        ...state,
      },
    },
  });

  const wrapper = shallowMount(NotificationPane, {
    global: { plugins: [pinia] },
    ...options,
  });

  return { wrapper, notifications: useNotificationsStore() };
};

describe("NotificationPane", () => {
  it("Has the correct component name", () => {
    expect(NotificationPane.name).toEqual("NotificationPane");
  });

  it("Displays the correct message", () => {
    const message = "Test message";
    const { wrapper } = mountPane({ message });
    expect(wrapper.text()).toContain(message);
  });

  it.each(Object.keys(TYPES))(
    "Displays the correct type of notification - %s",
    (type) => {
      const { wrapper } = mountPane({ type });
      const classes = TYPES[type];
      expect(wrapper.find("div").classes()).toEqual(
        expect.arrayContaining(classes)
      );
    }
  );

  it("Hides after a certain amount of time", async () => {
    const { wrapper, notifications } = mountPane({}, {
      data() {
        return {
          timeout: 100,
        };
      },
    });
    notifications.visible = true;
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(notifications.hide).toHaveBeenCalled();
  });

  it("Emits a 'remove' event when the remove cross component is clicked", () => {
    const { wrapper, notifications } = mountPane();
    const removeCross = wrapper.findComponent({ name: "RemoveCrossComponent" });
    removeCross.vm.$emit("remove");
    expect(notifications.hide).toHaveBeenCalled();
  });
});

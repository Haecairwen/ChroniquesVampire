import LoadMenuComponent from "Components/LoadMenuComponent";
import SlideDownPanelComponent from "Components/SlideDownPanelComponent";
import ButtonComponent from "Components/ButtonComponent";
import { shallowMount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { useNotificationsStore } from "Stores/notifications";
import { restoreState, deserialize } from "Libs/gameState";
import localStorage, { supportsLocalStorage } from "Libs/localStorage";

vi.mock("Libs/gameState");

vi.mock("Libs/localStorage");

const mountMenu = ({ initialState = {}, data = {} } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState,
  });

  const wrapper = shallowMount(LoadMenuComponent, {
    data() {
      return data;
    },
    global: {
      plugins: [pinia],
      stubs: { SlideDownPanelComponent, ButtonComponent },
    },
  });

  return { wrapper, notifications: useNotificationsStore() };
};

describe("LoadMenuComponent", () => {
  beforeEach(() => {
    deserialize.mockImplementation(() => ({
      test: "data",
    }));

    supportsLocalStorage.mockImplementation(() => true);
    localStorage.get.mockImplementation(() => "save-content");
  });

  it("Has the correct component name", () => {
    expect(LoadMenuComponent.name).toEqual("LoadMenuComponent");
  });

  it("Renders a SlideDownPanelComponent with a 'Load' heading", () => {
    const { wrapper } = mountMenu();

    expect(wrapper.findComponent(SlideDownPanelComponent).exists()).toBe(true);

    expect(wrapper.text()).toContain("Load");
  });

  it("Renders ButtonComponents with the correct labels", () => {
    const { wrapper } = mountMenu({ data: { loading: true } });

    const buttons = wrapper.findAllComponents(ButtonComponent);

    expect(supportsLocalStorage).toHaveBeenCalled();
    expect(buttons.length).toEqual(3);
    expect(buttons.at(0).text()).toEqual("Close");
    expect(buttons.at(1).text()).toEqual("From File");
    expect(buttons.at(2).text()).toEqual("From Local Storage");
  });

  it("Does not render the 'From Local Storage' button if local storage is not supported", () => {
    supportsLocalStorage.mockImplementation(() => false);

    const { wrapper } = mountMenu({ data: { loading: true } });

    const buttons = wrapper.findAllComponents(ButtonComponent);

    expect(buttons.length).toEqual(2);
    expect(buttons.at(0).text()).toEqual("Close");
    expect(buttons.at(1).text()).toEqual("From File");
  });

  it("Can restore saves from uploaded files", async () => {
    const { wrapper, notifications } = mountMenu({ data: { loading: true } });

    const mockReadAsText = vi.fn();
    const mockReader = {
      readAsText: mockReadAsText,
      result: "dummy data",
      onload: null,
      onerror: null,
    };

    vi.spyOn(global, "FileReader").mockImplementation(function () { return mockReader; });

    const mockEvent = {
      target: {
        files: [new File(["dummy data"], "dummy.txt", { type: "text/plain" })],
      },
    };

    wrapper.vm.load(mockEvent);

    expect(mockReadAsText).toHaveBeenCalled();
    expect(wrapper.vm.loading).toBe(true);
    expect(notifications.hide).toHaveBeenCalled();

    mockReader.onload();

    expect(restoreState).toHaveBeenCalledWith({ test: "data" });
    expect(wrapper.vm.loading).toBe(false);
  });

  it.each([[[]], [["file1", "file2"]]])(
    "Enforces a mandatory single file to be uploaded before starting a restore from file",
    async (files) => {
      const { wrapper, notifications } = mountMenu({ data: { loading: true } });

      const mockReadAsText = vi.fn();
      const mockReader = {
        readAsText: mockReadAsText,
        result: "",
        onload: null,
        onerror: null,
      };

      vi.spyOn(global, "FileReader").mockImplementation(function () { return mockReader; });

      const mockEvent = {
        target: {
          files,
        },
      };

      wrapper.vm.load(mockEvent);

      expect(notifications.showNotification).toHaveBeenCalled();
      expect(mockReadAsText).not.toHaveBeenCalled();
      expect(wrapper.vm.loading).toBe(true);
      expect(notifications.hide).not.toHaveBeenCalled();
      expect(restoreState).not.toHaveBeenCalled();
    }
  );

  it("Can handle errors loading an uploaded file", async () => {
    const { wrapper, notifications } = mountMenu({ data: { loading: true } });

    const mockReadAsText = vi.fn();
    const mockReader = {
      readAsText: mockReadAsText,
      result: "dummy data",
      onload: null,
      onerror: null,
    };

    vi.spyOn(global, "FileReader").mockImplementation(function () { return mockReader; });

    const mockEvent = {
      target: {
        files: [new File(["dummy data"], "dummy.txt", { type: "text/plain" })],
      },
    };

    wrapper.vm.load(mockEvent);

    expect(mockReadAsText).toHaveBeenCalled();
    expect(wrapper.vm.loading).toBe(true);
    expect(notifications.hide).toHaveBeenCalled();

    mockReader.onerror();

    expect(restoreState).not.toHaveBeenCalled();
    expect(wrapper.vm.loading).toBe(true);
    expect(notifications.showNotification).toHaveBeenCalled();
  });

  it("Requires a confirming second click before loading over a game in progress", async () => {
    const { wrapper } = mountMenu({
      initialState: {
        actions: {
          prompts: [{ id: "a", page: 1, count: 1 }],
        },
      },
      data: { loading: true },
    });

    const button = wrapper
      .findAllComponents(ButtonComponent)
      .filter((w) => w.text() === "From Local Storage")
      .at(0);

    button.vm.$emit("click");
    await wrapper.vm.$nextTick();

    expect(restoreState).not.toHaveBeenCalled();
    expect(button.text()).toEqual("Overwrite current game?");

    button.vm.$emit("click");
    await wrapper.vm.$nextTick();

    expect(restoreState).toHaveBeenCalledWith({ test: "data" });
  });

  it("Calls 'fromLocalStorage' when the 'From Local Storage' button is clicked", async () => {
    const { wrapper, notifications } = mountMenu({ data: { loading: true } });

    const buttons = wrapper
      .findAllComponents(ButtonComponent)
      .filter((w) => w.text() === "From Local Storage");

    expect(buttons.length).toEqual(1);

    const button = buttons.at(0);

    button.vm.$emit("click");
    await wrapper.vm.$nextTick();

    expect(notifications.hide).toHaveBeenCalled();
    expect(localStorage.get).toHaveBeenCalledWith("save-game");
    expect(deserialize).toHaveBeenCalledWith("save-content");
    expect(restoreState).toHaveBeenCalledWith({ test: "data" });
    expect(wrapper.vm.loading).toBe(false);
  });
});

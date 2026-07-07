import HeadingComponent from "Components/HeadingComponent";
import { shallowMount } from "@vue/test-utils";

describe("components/HeadingComponent.vue", () => {
  it("Has the correct component name", () => {
    expect(HeadingComponent.name).toEqual("HeadingComponent");
  });

  it("Renders without any props", () => {
    const wrapper = shallowMount(HeadingComponent, {
      slots: {
        default: "Hello World",
      },
    });

    const heading = wrapper.find("h1");

    expect(heading.exists()).toBe(true);
    expect(heading.classes()).toEqual([
      "v-heading",
      "v-heading--1",
      "v-heading--ornate",
    ]);
    expect(heading.text()).toBe("Hello World");
  });

  it("Can set the default slot", () => {
    const wrapper = shallowMount(HeadingComponent, {
      props: {
        level: "1",
      },
      slots: {
        default: "Hello World",
      },
    });

    const heading = wrapper.find("h1");

    expect(heading.exists()).toBe(true);
    expect(heading.text()).toEqual("Hello World");
  });

  it.each([1, 2, 3, 4, 5, 6])(
    "Adds the correct default classes to the heading tag",
    (lvl) => {
      const wrapper = shallowMount(HeadingComponent, {
        props: {
          level: `${lvl}`,
        },
        slots: {
          default: "Hello World",
        },
      });

      const classes = ["v-heading", `v-heading--${lvl}`];

      if (lvl <= 2) {
        classes.push("v-heading--ornate");
      }

      const heading = wrapper.find(`h${lvl}`);

      expect(heading.exists()).toBe(true);
      expect(heading.classes()).toEqual(classes);
    }
  );

  it("Gives ornate levels flanking flourishes", () => {
    const wrapper = shallowMount(HeadingComponent, {
      props: {
        level: "2",
      },
      slots: {
        default: "Hello World",
      },
    });

    expect(wrapper.findAll(".v-heading__flourish")).toHaveLength(2);
  });

  it("Keeps deeper levels plain", () => {
    const wrapper = shallowMount(HeadingComponent, {
      props: {
        level: "4",
      },
      slots: {
        default: "Hello World",
      },
    });

    expect(wrapper.findAll(".v-heading__flourish")).toHaveLength(0);
  });

  it("Renders an icon when one is given", () => {
    const wrapper = shallowMount(HeadingComponent, {
      props: {
        level: "2",
        icon: "quill",
      },
      slots: {
        default: "Hello World",
      },
    });

    const icon = wrapper.findComponent({ name: "GothicIcon" });

    expect(icon.exists()).toBe(true);
    expect(icon.props("name")).toEqual("quill");
  });

  it("Renders no icon by default", () => {
    const wrapper = shallowMount(HeadingComponent, {
      props: {
        level: "2",
      },
      slots: {
        default: "Hello World",
      },
    });

    expect(wrapper.findComponent({ name: "GothicIcon" }).exists()).toBe(false);
  });

  it("Can add extra classes to the heading tag", () => {
    const wrapper = shallowMount(HeadingComponent, {
      props: {
        level: "1",
      },
      slots: {
        default: "Hello World",
      },
      attrs: {
        class: "text-red-500",
      },
    });

    const heading = wrapper.find("h1");

    expect(heading.exists()).toBe(true);
    expect(heading.classes()).toContain("text-red-500");
  });

  it.each([
    { given: 0, replacement: 1 },
    { given: -1, replacement: 1 },
    { given: 7, replacement: 6 },
    { given: 8, replacement: 6 },
  ])(
    "Only allows level prop values from 1 to 6 - convert $given to $replacement",
    ({ given, replacement }) => {
      const wrapper = shallowMount(HeadingComponent, {
        props: {
          level: `${given}`,
        },
        slots: {
          default: "Hello World",
        },
      });

      expect(wrapper.find(`h${replacement}`).exists()).toBe(true);
      expect(wrapper.find(`h${given}`).exists()).toBe(false);
    }
  );

  it("Merges extra classes with the default heading classes", () => {
    const wrapper = shallowMount(HeadingComponent, {
      props: {
        level: "1",
      },
      attrs: {
        class: "text-red-500 text-green-500",
      },
    });

    const heading = wrapper.find("h1");

    expect(heading.exists()).toBe(true);
    expect(heading.classes()).toContain("text-red-500");
    expect(heading.classes()).toContain("text-green-500");
    expect(heading.classes()).toEqual(
      expect.arrayContaining(["v-heading", "v-heading--1"])
    );
  });
});

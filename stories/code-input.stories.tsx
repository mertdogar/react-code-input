import React from "react";
import { Meta, Story } from "@storybook/react";
import { CodeInput, CodeInputProps } from "../src";

const meta: Meta = {
  title: "CodeInput",
  component: CodeInput,
  argTypes: {
    symbols: { control: { type: "array" } },
  },
  args: {
    placeholder: "any(salePrice - vat, cpa)",
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<CodeInputProps> = (args) => (
  <CodeInput
    schema={{
      $id: "a",
      type: "object",
      properties: {
        m1: {
          type: "string",
        },
        m2: {
          type: "object",
          properties: {
            a1: { type: "number" },
            a2: { type: "number" },
          },
        },
      },
    }}
    {...args}
  />
);

export const Default = Template.bind({});
Default.args = {};

export const CustomStyles = Template.bind({});
CustomStyles.args = {
  style: {
    width: "350px",
    padding: "10px",
    fontSize: "14px",
    fontFamily: "monospace",
  },
};

export const ControlledInput = () => {
  const [state, setState] = React.useState("123");
  return (
    <CodeInput
      value={state}
      onChange={(e) => {
        setState(e.currentTarget.value.toUpperCase());
      }}
    />
  );
};

const ExampleCustomInput = React.forwardRef<HTMLInputElement>((props, ref) => (
  <input className="input" ref={ref} {...props} />
));

export const CustomComponent = Template.bind({});
CustomComponent.args = {
  customInputComponent: ExampleCustomInput,
};

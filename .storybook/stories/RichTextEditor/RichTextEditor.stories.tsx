import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import type { TFormattingToolbarMode } from '@interfaces';

import { TOOLBAR_MODES } from './consts';
import { ToolbarPreview } from './fragments';
import { ARG_CATEGORIES } from '../../consts';
import { WithPad } from '../../decorators';

const meta: Meta<typeof ToolbarPreview> = {
  title: 'Components/RichTextEditor',
  component: ToolbarPreview,
  parameters: {
    docs: {
      description: {
        component:
          'The formatting toolbar that appears above a text selection while a node label or a comment is edited. It is an opaque `--surface` overlay portaled to the body, so it keeps its size at any canvas zoom. Buttons keep focus in the editor; the link and color buttons swap the formats for a link form or the `--ink-*` palette.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: TOOLBAR_MODES,
      description: 'Which controls the toolbar shows.',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
    onModeChange: {
      description: 'Fired when a control asks for another mode.',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
  },
  decorators: [WithPad],
  render: function Render(args) {
    const [, updateArgs] = useArgs();

    return <ToolbarPreview {...args} onModeChange={(mode: TFormattingToolbarMode) => updateArgs({ mode })} />;
  },
};

export default meta;

type Story = StoryObj<typeof ToolbarPreview>;

export const Formats: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Bold, italic, underline and strikethrough, then the link and text color, then the two lists. Active formats are pressed.',
      },
    },
  },
  args: { mode: 'format' },
};

export const LinkForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The link form, prefilled with the address of the selected link. Only http, https and email addresses are accepted; a bare domain becomes https.',
      },
    },
  },
  args: { mode: 'link' },
};

export const ColorPalette: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The five palette colors plus Default, each tinted with its theme token.',
      },
    },
  },
  args: { mode: 'color' },
};

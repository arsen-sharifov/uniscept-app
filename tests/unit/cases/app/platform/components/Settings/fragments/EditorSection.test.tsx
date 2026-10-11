import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { PREFERENCES } from '@mocks/preferences';
import { EditorSection } from '@/app/platform/components/Settings/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onUpdate = vi.fn();

describe('EditorSection', () => {
  describe('GIVEN snapping on, smart guides off and a 125% default zoom', () => {
    beforeEach(() => {
      render(<EditorSection preferences={PREFERENCES} onUpdate={onUpdate} />);
    });

    describe('WHEN it renders', () => {
      test('THEN each behavior card and the zoom stack reflect the preferences', () => {
        expect(
          screen.getByRole('switch', { name: new RegExp(TRANSLATIONS.platform.settings.editor.snapToGrid) }),
        ).toBeChecked();
        expect(
          screen.getByRole('switch', { name: new RegExp(TRANSLATIONS.platform.settings.editor.smartGuides) }),
        ).not.toBeChecked();
        expect(
          within(screen.getByRole('radiogroup', { name: TRANSLATIONS.platform.settings.editor.defaultZoom })).getByRole(
            'radio',
            { checked: true },
          ),
        ).toHaveTextContent('125');
      });
    });

    describe('WHEN both behavior cards are toggled', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getByRole('switch', { name: new RegExp(TRANSLATIONS.platform.settings.editor.snapToGrid) }),
        );
        fireEvent.click(
          screen.getByRole('switch', { name: new RegExp(TRANSLATIONS.platform.settings.editor.smartGuides) }),
        );
      });

      test('THEN each preference flips', () => {
        expect(onUpdate).toHaveBeenCalledTimes(2);
        expect(onUpdate).toHaveBeenNthCalledWith(1, 'snapToGrid', false);
        expect(onUpdate).toHaveBeenNthCalledWith(2, 'smartGuides', true);
      });
    });

    describe('WHEN another zoom level is picked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('radio', { name: /^150/ }));
      });

      test('THEN the default zoom preference is updated', () => {
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith('defaultZoom', 150);
      });
    });
  });
});

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { SheetChrome } from '@/app/platform/components/SheetChrome';

describe('SheetChrome', () => {
  describe('GIVEN an open thread of a workspace', () => {
    beforeEach(() => {
      render(<SheetChrome workspaceName="Product Lab" threadName="Why do users churn?" />);
    });

    describe('WHEN it renders', () => {
      test('THEN the brand, the workspace and the thread read as one trail', () => {
        expect(document.body).toHaveTextContent('uniscept·Product Lab·Why do users churn?');
      });
    });
  });

  describe('GIVEN neither a workspace nor a thread', () => {
    beforeEach(() => {
      render(<SheetChrome />);
    });

    describe('WHEN it renders', () => {
      test('THEN only the brand shows without separators', () => {
        expect(document.body).toHaveTextContent(/^uniscept$/);
      });
    });
  });
});

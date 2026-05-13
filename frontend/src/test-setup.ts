import 'zone.js';
import 'zone.js/testing';
import '@testing-library/jest-dom';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
    { teardown: { destroyAfterEach: false } }
  );
} catch (e) {
  // Environment already initialized
}

import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

vi.mock('Libs/localStorage');

describe('i18n', () => {
  beforeEach(() => {
    vi.resetModules();
    supportsLocalStorage.mockImplementation(() => true);
    localStorage.get.mockImplementation(() => null);
  });

  it('Defaults to English when nothing is stored', async () => {
    const { currentLocale } = await import('../../../src/i18n');

    expect(currentLocale()).toEqual('en');
  });

  it('Restores a stored locale', async () => {
    localStorage.get.mockImplementation(() => 'fr');

    const { currentLocale, LOCALE_KEY } = await import('../../../src/i18n');

    expect(localStorage.get).toHaveBeenCalledWith(LOCALE_KEY);
    expect(currentLocale()).toEqual('fr');
  });

  it('Ignores an invalid stored locale', async () => {
    localStorage.get.mockImplementation(() => 'klingon');

    const { currentLocale } = await import('../../../src/i18n');

    expect(currentLocale()).toEqual('en');
  });

  it('Switches and persists the locale', async () => {
    const { setLocale, currentLocale, LOCALE_KEY } = await import('../../../src/i18n');

    setLocale('fr');

    expect(currentLocale()).toEqual('fr');
    expect(localStorage.set).toHaveBeenCalledWith(LOCALE_KEY, 'fr');
  });

  it('Rejects unsupported locales', async () => {
    const { setLocale, currentLocale } = await import('../../../src/i18n');

    setLocale('klingon');

    expect(currentLocale()).toEqual('en');
    expect(localStorage.set).not.toHaveBeenCalled();
  });

  it('Provides a French message for every English key', async () => {
    const { default: en } = await import('../../../src/i18n/locales/en.json');
    const { default: fr } = await import('../../../src/i18n/locales/fr.json');

    const flatten = (obj, prefix = '') => Object.entries(obj).flatMap(([key, value]) =>
      typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`]
    );

    expect(flatten(fr).sort()).toEqual(flatten(en).sort());
  });
});

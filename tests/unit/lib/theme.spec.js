import { initTheme, setTheme, currentTheme, AVAILABLE_THEMES, THEME_KEY } from 'Libs/theme';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

vi.mock('Libs/localStorage');

describe('lib/theme', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
    supportsLocalStorage.mockImplementation(() => true);
    localStorage.get.mockImplementation(() => null);
  });

  it('Offers the gothic, baroque, nocturne, and cathedral themes', () => {
    expect(AVAILABLE_THEMES).toEqual(['gothic', 'baroque', 'nocturne', 'cathedral']);
  });

  it('Defaults to gothic when nothing is stored', () => {
    expect(initTheme()).toEqual('gothic');
    expect(document.documentElement.dataset.theme).toEqual('gothic');
    expect(currentTheme()).toEqual('gothic');
  });

  it('Restores a stored theme', () => {
    localStorage.get.mockImplementation(() => 'baroque');

    expect(initTheme()).toEqual('baroque');

    expect(localStorage.get).toHaveBeenCalledWith(THEME_KEY);
    expect(document.documentElement.dataset.theme).toEqual('baroque');
  });

  it('Ignores an invalid stored theme', () => {
    localStorage.get.mockImplementation(() => 'rococo');

    expect(initTheme()).toEqual('gothic');
  });

  it('Falls back to gothic when local storage is unsupported', () => {
    supportsLocalStorage.mockImplementation(() => false);

    expect(initTheme()).toEqual('gothic');
    expect(localStorage.get).not.toHaveBeenCalled();
  });

  it('Switches and persists the theme', () => {
    initTheme();

    setTheme('baroque');

    expect(currentTheme()).toEqual('baroque');
    expect(document.documentElement.dataset.theme).toEqual('baroque');
    expect(localStorage.set).toHaveBeenCalledWith(THEME_KEY, 'baroque');
  });

  it('Rejects unsupported themes', () => {
    initTheme();

    setTheme('rococo');

    expect(currentTheme()).toEqual('gothic');
    expect(localStorage.set).not.toHaveBeenCalled();
  });
});

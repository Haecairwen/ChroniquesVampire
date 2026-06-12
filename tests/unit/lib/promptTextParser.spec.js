import { parsePromptText, VISIT_LETTERS } from 'Libs/promptTextParser';

describe('lib/promptTextParser', () => {
  it('Exposes the visit letters in order', () => {
    expect(VISIT_LETTERS).toEqual(['a', 'b', 'c']);
  });

  it('Parses simple header and text entries', () => {
    const raw = [
      '1a',
      'First prompt text.',
      '',
      '1b',
      'Second visit text.',
      '',
      '2a',
      'Another prompt.',
    ].join('\n');

    const { texts, imported, warnings } = parsePromptText(raw);

    expect(imported).toEqual(3);
    expect(warnings).toEqual([]);
    expect(texts).toEqual({
      1: { a: 'First prompt text.', b: 'Second visit text.' },
      2: { a: 'Another prompt.' },
    });
  });

  it('Handles a UTF-8 BOM and CRLF line endings', () => {
    const raw = '﻿1a\r\nWindows text.\r\n\r\n1b\r\nMore text.\r\n';

    const { texts, imported } = parsePromptText(raw);

    expect(imported).toEqual(2);
    expect(texts[1]).toEqual({ a: 'Windows text.', b: 'More text.' });
  });

  it('Joins wrapped lines and keeps paragraph breaks', () => {
    const raw = [
      '12c',
      'A prompt whose text is wrapped',
      'across two lines.',
      '',
      'And a second paragraph.',
      '',
      '13a',
      'Next.',
    ].join('\n');

    const { texts } = parsePromptText(raw);

    expect(texts[12].c).toEqual('A prompt whose text is wrapped across two lines.\n\nAnd a second paragraph.');
    expect(texts[13].a).toEqual('Next.');
  });

  it('Handles the malformed header sharing a line with its text', () => {
    const raw = [
      '4a',
      'Normal entry.',
      '',
      '4b. You are adopted into a strange cult who take you in.',
      '',
      '4c',
      'Final entry.',
    ].join('\n');

    const { texts, imported } = parsePromptText(raw);

    expect(imported).toEqual(3);
    expect(texts[4].b).toEqual('You are adopted into a strange cult who take you in.');
  });

  it('Skips book front matter before the Prompts marker', () => {
    const raw = [
      'Thousand Year Old Vampire',
      'You will need a d10 and a d6 to play.',
      'Prompts',
      '',
      '1a',
      'Real prompt.',
    ].join('\n');

    const { texts, imported } = parsePromptText(raw);

    expect(imported).toEqual(1);
    expect(texts).toEqual({ 1: { a: 'Real prompt.' } });
  });

  it('Stops parsing at Appendix One, whose alternative prompts reuse the numbering', () => {
    const raw = [
      'Prompts',
      '1a',
      'Main prompt.',
      '',
      'Appendix One',
      'Alternative Prompts',
      '1a',
      'Alternative prompt that must not overwrite the main one.',
    ].join('\n');

    const { texts, imported } = parsePromptText(raw);

    expect(imported).toEqual(1);
    expect(texts[1].a).toEqual('Main prompt.');
  });

  it('Warns about duplicate entries and keeps the later one', () => {
    const raw = [
      '1a',
      'First version.',
      '',
      '1a',
      'Second version.',
    ].join('\n');

    const { texts, imported, warnings } = parsePromptText(raw);

    expect(imported).toEqual(1);
    expect(warnings.length).toEqual(1);
    expect(texts[1].a).toEqual('Second version.');
  });

  it('Does not mistake prose containing numbers for headers', () => {
    const raw = [
      '1a',
      'Take the skill Bloodthirsty.',
      'Lose 3 Resources, then check a Skill.',
    ].join('\n');

    const { texts, imported } = parsePromptText(raw);

    expect(imported).toEqual(1);
    expect(texts[1].a).toEqual('Take the skill Bloodthirsty. Lose 3 Resources, then check a Skill.');
  });

  it('Warns when nothing can be imported', () => {
    expect(parsePromptText('').warnings.length).toEqual(1);
    expect(parsePromptText('no prompts here').warnings.length).toEqual(1);
    expect(parsePromptText(null).warnings.length).toEqual(1);
  });
});

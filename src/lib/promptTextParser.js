// Parses the book's prompt text into a lookup table keyed by prompt
// number and visit letter, matching how the official text organises the
// Prompts section:
//
//   1a
//   In your blood-hunger, you destroy someone close to you. ...
//
//   1b
//   ...
//
// The parser tolerates the quirks found in real exports of the text:
// a UTF-8 BOM, CRLF line endings, and the occasional malformed header
// sharing its line with the start of the prompt text ("4b. You are...").
// Parsing stops at Appendix One, whose alternative prompts reuse the
// same numbering and would otherwise overwrite the main prompts.

const HEADER_PATTERN = /^(\d{1,3})\s*([a-cA-C])\b\s*[.:)]?\s*(.*)$/;
const PROMPTS_MARKER = /^Prompts$/;
const APPENDIX_MARKER = /^Appendix\s+One\b/i;

export const VISIT_LETTERS = ['a', 'b', 'c'];

export const parsePromptText = (raw) => {
    const texts = {};
    const warnings = [];

    if (typeof raw !== 'string' || raw.trim() === '') {
        return { texts, imported: 0, warnings: ['Nothing to import.'] };
    }

    const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/);

    // If the paste includes the surrounding book text, skip ahead to the
    // Prompts section; if it's already just prompts, parse from the top.
    const promptsAt = lines.findIndex((line) => PROMPTS_MARKER.test(line.trim()));
    const startAt = promptsAt === -1 ? 0 : promptsAt + 1;

    let imported = 0;
    let current = null;
    let paragraphs = [];
    let paragraph = [];

    const closeParagraph = () => {
        if (paragraph.length) {
            paragraphs.push(paragraph.join(' '));
            paragraph = [];
        }
    };

    const closeEntry = () => {
        if (!current) {
            return;
        }

        closeParagraph();

        const text = paragraphs.join('\n\n').trim();

        if (text !== '') {
            if (texts[current.page]?.[current.letter] !== undefined) {
                warnings.push(`Duplicate prompt ${current.page}${current.letter}; the later entry was kept.`);
            } else {
                imported++;
            }

            texts[current.page] = {
                ...texts[current.page],
                [current.letter]: text,
            };
        }

        current = null;
        paragraphs = [];
    };

    for (let i = startAt; i < lines.length; i++) {
        const line = lines[i].trim();

        if (APPENDIX_MARKER.test(line)) {
            break;
        }

        const header = line.match(HEADER_PATTERN);

        if (header) {
            closeEntry();

            current = {
                page: parseInt(header[1], 10),
                letter: header[2].toLowerCase(),
            };

            // Malformed entries put the start of the text on the header line.
            if (header[3]) {
                paragraph.push(header[3]);
            }

            continue;
        }

        if (!current) {
            continue;
        }

        if (line === '') {
            closeParagraph();
        } else {
            paragraph.push(line);
        }
    }

    closeEntry();

    if (imported === 0) {
        warnings.push('No prompts found. Paste the Prompts section of the book as plain text.');
    }

    return { texts, imported, warnings };
};

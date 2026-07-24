// What this file is: unit tests for json.ts's defensive parsing -- fenced
// JSON, bare JSON, prose-wrapped JSON, and the failure cases (malformed
// JSON, JSON that doesn't match the expected shape).
// In plain terms: tests proving the app can make sense of messy AI output.

import { describe, expect, it } from 'vitest';
import { JsonParseError, parseJson, stripCodeFences } from './json';

interface Hello {
  hello: string;
}

function isHello(x: unknown): x is Hello {
  return typeof x === 'object' && x !== null && typeof (x as Hello).hello === 'string';
}

describe('stripCodeFences', () => {
  it('strips a ```json fence', () => {
    expect(stripCodeFences('```json\n{"hello":"world"}\n```')).toBe('{"hello":"world"}');
  });

  it('strips a bare ``` fence', () => {
    expect(stripCodeFences('```\n{"hello":"world"}\n```')).toBe('{"hello":"world"}');
  });

  it('leaves unfenced text unchanged (trimmed)', () => {
    expect(stripCodeFences('  {"hello":"world"}  ')).toBe('{"hello":"world"}');
  });
});

describe('parseJson', () => {
  it('parses bare JSON', () => {
    expect(parseJson('{"hello":"world"}', isHello)).toEqual({ hello: 'world' });
  });

  it('parses fenced JSON', () => {
    expect(parseJson('```json\n{"hello":"world"}\n```', isHello)).toEqual({ hello: 'world' });
  });

  it('extracts JSON wrapped in prose', () => {
    const raw = 'Sure! Here you go: {"hello":"world"} Hope that helps.';
    expect(parseJson(raw, isHello)).toEqual({ hello: 'world' });
  });

  it('extracts only the first complete object when the model appends extra alternatives after it', () => {
    const raw = '{"hello":"world"}\n\nor\n\n{"hello":"different"}';
    expect(parseJson(raw, isHello)).toEqual({ hello: 'world' });
  });

  it('does not get confused by braces inside a string value', () => {
    const raw = '{"hello":"a {weird} value"} extra junk after';
    expect(parseJson(raw, isHello)).toEqual({ hello: 'a {weird} value' });
  });

  it('throws JsonParseError on malformed JSON', () => {
    expect(() => parseJson('{not json', isHello)).toThrow(JsonParseError);
  });

  it('throws JsonParseError when the shape does not validate', () => {
    expect(() => parseJson('{"nope":"world"}', isHello)).toThrow(JsonParseError);
  });
});

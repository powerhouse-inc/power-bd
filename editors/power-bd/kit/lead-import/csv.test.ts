import { describe, expect, it } from "vitest";
import { detectSeparator, parseCsv } from "./csv.js";

describe("parseCsv", () => {
  it("reads headers and rows", () => {
    expect(parseCsv("Company,Status\nKelvar,In touch\nBrightwater,Met\n")).toEqual({
      headers: ["Company", "Status"],
      rows: [["Kelvar", "In touch"], ["Brightwater", "Met"]],
    });
  });

  it("keeps separators, line breaks and doubled quotes inside quotes", () => {
    const t = parseCsv('Name,Notes\n"Verstovšek, Igor","He said ""AI mirror""\nand more"\n');
    expect(t.rows).toEqual([["Verstovšek, Igor", 'He said "AI mirror"\nand more']]);
  });

  it("takes CRLF and CR line ends, skips empty lines, drops a BOM", () => {
    expect(parseCsv("﻿A,B\r\n1,2\r\n\r\n3,4\r5,6").rows).toEqual([["1", "2"], ["3", "4"], ["5", "6"]]);
    expect(parseCsv("﻿A,B\r\n1,2").headers).toEqual(["A", "B"]);
  });

  it("pads short rows and keeps a trailing empty field", () => {
    expect(parseCsv("A,B,C\n1\n2,,\n").rows).toEqual([["1", "", ""], ["2", "", ""]]);
  });

  it("reads semicolon and tab files, as European spreadsheets write them", () => {
    expect(detectSeparator("Podjetje;Status;Lastnik\nX;Y;Z")).toBe(";");
    expect(parseCsv("A;B\n1,5;2").rows).toEqual([["1,5", "2"]]);
    expect(parseCsv("A\tB\n1\t2").rows).toEqual([["1", "2"]]);
    expect(detectSeparator('"a;b",c\n')).toBe(",");
  });

  it("is empty for empty text", () => {
    expect(parseCsv("")).toEqual({ headers: [], rows: [] });
    expect(parseCsv("\n\n")).toEqual({ headers: [], rows: [] });
  });
});

import { Fragment } from "react";
import { markPlaceholders } from "../../kit/proposal-check/proposal-check.js";
import type {
  DocBlock,
  ProsePart,
  Span,
} from "../../kit/proposal-render/proposal-render.js";
import {
  documentPictures,
  foldedMarkdown,
  picturesNote,
} from "../../kit/proposal-render/pictures.js";
import type { PreviewMode } from "../../kit/proposal-view/index.js";
import { DocFigure, PictureFold } from "./Files.js";

type Codes = Set<string>;

/** A text of the document, with what is still to be filled in marked. */
function Text({ text, codes }: { text: string; codes: Codes }) {
  return (
    <>
      {markPlaceholders(text, codes).map((piece, i) =>
        piece.placeholder ? (
          <mark key={i} className="pb-doc__gap" title="Still to fill in">
            {piece.text}
          </mark>
        ) : (
          <Fragment key={i}>{piece.text}</Fragment>
        ),
      )}
    </>
  );
}

function Spans({ spans, codes }: { spans: Span[]; codes: Codes }) {
  return (
    <>
      {spans.map((span, i) => {
        const text = <Text text={span.text} codes={codes} />;
        if (span.href)
          return (
            <a key={i} href={span.href} target="_blank" rel="noreferrer">
              {text}
            </a>
          );
        if (span.strong) return <strong key={i}>{text}</strong>;
        if (span.em) return <em key={i}>{text}</em>;
        if (span.code) return <code key={i}>{text}</code>;
        return <Fragment key={i}>{text}</Fragment>;
      })}
    </>
  );
}

function Items({ items, codes }: { items: Span[][]; codes: Codes }) {
  return (
    <>
      {items.map((item, i) => (
        <li key={i}>
          <Spans spans={item} codes={codes} />
        </li>
      ))}
    </>
  );
}

function Prose({ parts, codes }: { parts: ProsePart[]; codes: Codes }) {
  return (
    <>
      {parts.map((part, i) => {
        if (part.kind === "list") {
          const List = part.ordered ? "ol" : "ul";
          return (
            <List key={i}>
              <Items items={part.items} codes={codes} />
            </List>
          );
        }
        const spans = <Spans spans={part.spans} codes={codes} />;
        if (part.kind === "paragraph") return <p key={i}>{spans}</p>;
        return part.level === 3 ? (
          <h3 key={i}>{spans}</h3>
        ) : (
          <h4 key={i}>{spans}</h4>
        );
      })}
    </>
  );
}

const anchorOf = (id: string) => `pb-doc-${id}`;

function Block({
  block,
  codes,
  documentId,
}: {
  block: DocBlock;
  codes: Codes;
  documentId: string;
}) {
  switch (block.kind) {
    case "title":
      return (
        <h1 className="pb-doc__title">
          <Text text={block.text} codes={codes} />
        </h1>
      );
    case "fields":
      return (
        <dl className="pb-doc__fields">
          {block.rows.map((row, i) => (
            <Fragment key={i}>
              <dt>{row.label}</dt>
              {row.value == null ? (
                <dd className="is-blank" aria-label="To sign by hand" />
              ) : (
                <dd>{row.value}</dd>
              )}
            </Fragment>
          ))}
        </dl>
      );
    case "contents":
      return (
        <>
          <h2>Contents</h2>
          <ol className="pb-doc__toc">
            {block.items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${anchorOf(item.id)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.document
                      .getElementById(anchorOf(item.id))
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <Text text={item.title} codes={codes} />
                </a>
              </li>
            ))}
          </ol>
        </>
      );
    case "heading": {
      const text = <Text text={block.text} codes={codes} />;
      if (block.level === 2)
        return <h2 id={block.id ? anchorOf(block.id) : undefined}>{text}</h2>;
      return block.level === 3 ? <h3>{text}</h3> : <h4>{text}</h4>;
    }
    case "prose":
      return <Prose parts={block.parts} codes={codes} />;
    case "paragraph":
      return (
        <p>
          <Text text={block.text} codes={codes} />
        </p>
      );
    case "list":
      return (
        <ul>
          <Items items={block.items} codes={codes} />
        </ul>
      );
    case "ticks":
      return (
        <ul className="pb-doc__ticks">
          {block.items.map((item, i) => (
            <li key={i}>
              <span className="pb-doc__box" aria-hidden="true" />
              <span>
                <Spans spans={item} codes={codes} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "table": {
      const column = (i: number) =>
        block.numeric.includes(i)
          ? "is-num"
          : block.codes?.includes(i)
            ? "is-code"
            : undefined;
      return (
        <div className="pb-doc-table-wrap">
          <table className="pb-doc-table">
            <thead>
              <tr>
                {block.header.map((h, i) => (
                  <th key={i} className={column(i)}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className={row.role ? `is-${row.role}` : undefined}>
                  {row.cells.map((c, i) => (
                    <td key={i} className={column(i)}>
                      <Text text={c} codes={codes} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "figure":
      return (
        <DocFigure
          documentId={documentId}
          fileRef={block.ref}
          caption={block.caption}
        />
      );
  }
}

/**
 * The markdown Export saves and Copy markdown copies, under the file's name and
 * how many pictures it carries: the same text, each picture's data folded to
 * one line.
 */
function MarkdownPage({
  blocks,
  documentId,
  fileName,
}: {
  blocks: DocBlock[];
  documentId: string;
  fileName: string;
}) {
  const note = picturesNote(documentPictures(blocks).length);
  return (
    <article
      className="pb-doc pb-doc--source"
      aria-label="The proposal's markdown, as Export saves it"
    >
      <div className="pb-doc__head">
        <span className="pb-doc__file">{fileName}</span>
        {note ? <span className="pb-doc__count">{note}</span> : null}
      </div>
      <pre className="pb-doc__source">
        {foldedMarkdown(blocks).map((part, i) =>
          part.kind === "text" ? (
            <Fragment key={i}>{part.text}</Fragment>
          ) : (
            <PictureFold
              key={i}
              documentId={documentId}
              picture={part.picture}
            />
          ),
        )}
      </pre>
    </article>
  );
}

/**
 * The proposal as the client reads it, or its markdown as Export saves it: one
 * page, the width of the column, made from the same blocks as the export.
 */
export function PreviewView({
  blocks,
  codes,
  documentId,
  mode,
  fileName,
}: {
  blocks: DocBlock[];
  codes: Codes;
  documentId: string;
  mode: PreviewMode;
  /** The name of the file Export saves. */
  fileName: string;
}) {
  if (mode === "markdown")
    return (
      <MarkdownPage
        blocks={blocks}
        documentId={documentId}
        fileName={fileName}
      />
    );
  return (
    <article
      className="pb-doc"
      aria-label="The proposal as the client reads it"
    >
      {blocks.map((block, i) => (
        <Block key={i} block={block} codes={codes} documentId={documentId} />
      ))}
    </article>
  );
}

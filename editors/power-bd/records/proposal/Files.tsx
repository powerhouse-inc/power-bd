import {
  useAttachmentPreview,
  useAttachmentUpload,
  type DocumentDispatch,
} from "@powerhousedao/reactor-browser";
import { generateId } from "document-model";
import {
  actions,
  type FigureAnchorKind,
  type FileRef,
  type ProposalAction,
  type ProposalState,
} from "document-models/proposal";
import { useRef, useState } from "react";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useRun, type OnErrors } from "../../components/shared/useRun.js";
import {
  pictureFold,
  type DocPicture,
} from "../../kit/proposal-render/pictures.js";

/**
 * Adds a file in the order the service needs: hash it for its reference, send the
 * operation that carries the reference, and only then upload the bytes.
 */
export function useAttach(
  documentId: string,
  dispatch: DocumentDispatch<ProposalAction>,
) {
  const { preprocess, upload, stage, error } = useAttachmentUpload();
  const attach = async (
    file: File,
    make: (f: FileRef) => ProposalAction,
    onErrors: OnErrors,
  ): Promise<boolean> => {
    try {
      const pre = await preprocess(file, { documentId });
      const accepted = await new Promise<boolean>((resolve) =>
        dispatch(
          make({
            ref: pre.ref,
            name: file.name,
            type: file.type || "application/octet-stream",
          }),
          (errors) => {
            onErrors(errors);
            resolve(false);
          },
          () => resolve(true),
        ),
      );
      if (accepted) await upload(pre);
      return accepted;
    } catch (e) {
      onErrors([
        e instanceof Error ? e : new Error("The file could not be added."),
      ]);
      return false;
    }
  };
  return { attach, stage, error };
}

export function FilePicker({
  label,
  disabled,
  accept,
  onFile,
}: {
  label: string;
  disabled?: boolean;
  accept?: string;
  onFile: (file: File) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <button
        className="pb-btn pb-btn--sm"
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        <Icon name="plus" />
        {label}
      </button>
    </>
  );
}

function Image({ documentId, file }: { documentId: string; file: FileRef }) {
  const p = useAttachmentPreview({ documentId, ref: file.ref });
  if (p.url) return <img className="pb-thumb" src={p.url} alt={file.name} />;
  return (
    <span className="pb-faint pb-small">
      {p.error ? "The picture is not available yet." : "Loading the picture…"}
    </span>
  );
}

/** A picture of the document, in place, with its caption. */
export function DocFigure({
  documentId,
  fileRef,
  caption,
}: {
  documentId: string;
  fileRef: FileRef["ref"];
  caption: string;
}) {
  const p = useAttachmentPreview({ documentId, ref: fileRef });
  return (
    <figure className="pb-doc__figure">
      {p.url ? (
        <img src={p.url} alt={caption} />
      ) : (
        <div className="pb-doc__figure-wait">
          {p.error
            ? "The picture is not available yet."
            : "Loading the picture…"}
        </div>
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/**
 * A picture's data in the Markdown view, folded to one line: its type, and its
 * size once the picture has been read, as the Document view reads it.
 */
export function PictureFold({
  documentId,
  picture,
}: {
  documentId: string;
  picture: DocPicture;
}) {
  const p = useAttachmentPreview({ documentId, ref: picture.ref });
  const fold = pictureFold(picture.type, p.error ? null : p.header?.sizeBytes);
  return (
    <span
      className={`pb-doc__fold${fold.unread ? " is-unread" : ""}`}
      title="Folded here. Export and Copy carry the picture in full."
    >
      {fold.text}
    </span>
  );
}

function Download({ documentId, file }: { documentId: string; file: FileRef }) {
  const [want, setWant] = useState(false);
  const p = useAttachmentPreview({
    documentId,
    ref: want ? file.ref : null,
  });
  if (p.url)
    return (
      <a className="pb-btn pb-btn--sm" href={p.url} download={file.name}>
        <Icon name="external" />
        Save {file.name}
      </a>
    );
  return (
    <button
      className="pb-btn pb-btn--sm"
      disabled={want && !p.error}
      onClick={() => setWant(true)}
    >
      <Icon name="external" />
      {want && !p.error ? "Getting the file…" : `Download ${file.name}`}
    </button>
  );
}

/** The copy that was sent, or the signed copy: a download, with replace and remove. */
export function FileSlot({
  label,
  file,
  documentId,
  editable,
  attach,
  make,
  clear,
  send,
}: {
  label: string;
  file: FileRef | null | undefined;
  documentId: string;
  editable: boolean;
  attach: ReturnType<typeof useAttach>["attach"];
  make: (f: FileRef) => ProposalAction;
  clear: ProposalAction;
  send: (a: ProposalAction, e: OnErrors) => void;
}) {
  const run = useRun();
  return (
    <div className="pb-field">
      <span className="pb-field__label">{label}</span>
      <div className="pb-row">
        {file ? (
          <Download documentId={documentId} file={file} />
        ) : (
          <span className="pb-faint pb-small">No file yet.</span>
        )}
        <FilePicker
          label={file ? "Replace the file" : "Attach a file"}
          disabled={!editable}
          onFile={(f) => run.run((e) => void attach(f, make, e))}
        />
        {file ? (
          <button
            className="pb-btn pb-btn--ghost pb-btn--sm"
            disabled={!editable}
            onClick={() => run.run((e) => send(clear, e))}
          >
            Remove the file
          </button>
        ) : null}
      </div>
      <ErrorLine message={run.error} />
    </div>
  );
}

/** Figures: pictures with captions under a section or a use case. */
export function Figures({
  s,
  documentId,
  disabled,
  attach,
  send,
}: {
  s: ProposalState;
  documentId: string;
  disabled: boolean;
  attach: ReturnType<typeof useAttach>["attach"];
  send: (a: ProposalAction, e: OnErrors) => void;
}) {
  const run = useRun();
  const [anchor, setAnchor] = useState("");
  const [caption, setCaption] = useState("");
  const anchors: { kind: FigureAnchorKind; id: string; label: string }[] = [
    ...s.sections
      .filter((x) => x.kind === "PROSE")
      .map((x) => ({
        kind: "SECTION" as const,
        id: x.id,
        label: `Section: ${x.title || "Untitled"}`,
      })),
    ...s.useCases.map((u) => ({
      kind: "USE_CASE" as const,
      id: u.id,
      label: `Use case: ${u.title}`,
    })),
  ];
  const keyOf = (a: { kind: string; id: string }) => `${a.kind}|${a.id}`;
  const chosen = anchors.find((a) => keyOf(a) === anchor);
  const where = (kind: string, id: string) =>
    anchors.find((a) => keyOf(a) === `${kind}|${id}`)?.label ?? "Unknown place";
  return (
    <div className="pb-stack">
      <h3 className="pb-overline">Pictures</h3>
      {s.figures.length === 0 ? (
        <p className="pb-faint pb-small">None yet.</p>
      ) : null}
      <div className="pb-list">
        {s.figures.map((f) => (
          <div key={f.id} className="pb-list__item pb-align-start">
            <div className="pb-list__main pb-grid pb-gap-6">
              <Image documentId={documentId} file={f.file} />
              <span className="pb-small pb-faint">
                {where(f.anchorKind, f.anchorId)}
              </span>
              <input
                className="pb-input"
                aria-label="Caption"
                placeholder="Caption"
                disabled={disabled}
                defaultValue={f.caption ?? ""}
                key={f.caption ?? ""}
                onBlur={(e) =>
                  e.target.value !== (f.caption ?? "") &&
                  run.run((er) =>
                    send(
                      actions.updateFigure({
                        id: f.id,
                        caption: e.target.value,
                      }),
                      er,
                    ),
                  )
                }
              />
            </div>
            <div className="pb-list__end">
              <FilePicker
                label="Replace"
                disabled={disabled}
                accept="image/*"
                onFile={(file) =>
                  run.run(
                    (e) =>
                      void attach(
                        file,
                        (x) => actions.updateFigure({ id: f.id, file: x }),
                        e,
                      ),
                  )
                }
              />
              <button
                className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
                aria-label="Remove this picture"
                disabled={disabled}
                onClick={() =>
                  run.run((e) => send(actions.removeFigure({ id: f.id }), e))
                }
              >
                <Icon name="trash" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="pb-row">
        <select
          className="pb-select pb-input--auto"

          aria-label="Where the picture goes"
          disabled={disabled}
          value={anchor}
          onChange={(e) => setAnchor(e.target.value)}
        >
          <option value="">Where it goes…</option>
          {anchors.map((a) => (
            <option key={keyOf(a)} value={keyOf(a)}>
              {a.label}
            </option>
          ))}
        </select>
        <input
          className="pb-input"
          aria-label="New caption"
          placeholder="Caption"
          disabled={disabled}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <FilePicker
          label="Add a picture"
          accept="image/*"
          disabled={disabled || !chosen}
          onFile={(file) => {
            if (!chosen) return;
            run.run(
              (e) =>
                void attach(
                  file,
                  (x) =>
                    actions.addFigure({
                      id: generateId(),
                      anchorKind: chosen.kind,
                      anchorId: chosen.id,
                      file: x,
                      caption: caption || undefined,
                    }),
                  e,
                ),
            );
            setCaption("");
          }}
        />
      </div>
      <ErrorLine message={run.error} />
    </div>
  );
}

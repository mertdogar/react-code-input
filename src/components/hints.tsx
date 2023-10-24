import React, { CSSProperties, useMemo } from "react";
import { EditorToken } from "../compiler";
import { JSONSchema7 } from "json-schema";
import * as JSONSchemaLibrary from "json-schema-library";

interface HintsProps {
  hints: string[];
  activeToken: EditorToken;
  activeIndex: number;
  offsetLeft: number;
  onSelectHint: (index: number) => any;
  schema: JSONSchema7;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function Hints({
  hints,
  activeToken,
  activeIndex,
  offsetLeft,
  onSelectHint,
  schema,
  inputRef,
}: HintsProps) {
  const containerRef = React.createRef<HTMLDivElement>();
  const parts = activeToken ? activeToken.value.split(".") : [];
  const schema_ = useMemo(() => new JSONSchemaLibrary.Draft07(schema), [
    schema,
  ]);
  const mappedHints = useMemo(
    () =>
      (hints || []).map((hint, index) => {
        return {
          hint: hint
            .split(".")
            .slice(parts.length - 1, parts.length)
            .join("."),
          index,
          pointer: `/${hint.split(".").join("/")}`,
          schema: schema_.getSchema({
            pointer: `/${hint.split(".").join("/")}`,
          }),
        };
      }),
    [hints]
  );

  const filteredHints = useMemo(
    () =>
      mappedHints.filter((value, index, self) => {
        return self.findIndex(({ hint }) => hint == value.hint) === index;
      }),
    [mappedHints]
  );

  const hintRefs = filteredHints.map(() => React.createRef<HTMLDivElement>());
  const [styles, setStyles] = React.useState(getComputedStyles(null, 0));

  React.useLayoutEffect(() => {
    const realIndex = filteredHints.findIndex(
      ({ index }) => index === activeIndex
    );
    const activeHintRef = hintRefs[realIndex];
    const containerEl = containerRef.current;
    if (!activeHintRef) return;
    const targetEl = activeHintRef.current;

    if (!containerEl || !targetEl) return;

    const targetOffsetTop = targetEl.offsetTop;
    const targetOffsetTopFromBottom =
      targetEl.offsetTop + targetEl.getBoundingClientRect().height;
    const containerHeight = containerEl.getBoundingClientRect().height;
    const targetAtBottomOffsetTop = targetOffsetTopFromBottom - containerHeight;

    if (targetAtBottomOffsetTop > containerEl.scrollTop) {
      containerEl.scrollTop = targetAtBottomOffsetTop;
    } else if (targetOffsetTop < containerEl.scrollTop) {
      containerEl.scrollTop = targetOffsetTop;
    }
  }, [activeIndex, filteredHints]);

  React.useLayoutEffect(() => {
    setStyles(getComputedStyles(inputRef.current, offsetLeft));
  }, []);

  if (!hints.length) return null;

  return (
    <div style={styles.positioningContainer}>
      <div style={styles.stackingContainer}>
        <div ref={containerRef} style={styles.hints}>
          {filteredHints.map(({ hint, index, schema }) => (
            <div
              ref={hintRefs[index]}
              key={index}
              style={{
                ...styles.hint,
                ...(activeIndex === index ? styles.hintActive : {}),
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectHint(index);
              }}
            >
              {hint} [{schema?.type}]
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const getComputedStyles = (inputEl: HTMLElement | null, offsetLeft: number) => {
  if (!inputEl) return { hints: {}, hint: {}, hintActive: {} };
  const s = getComputedStyle(inputEl);
  const inputRect = inputEl.getBoundingClientRect();
  const inputPaddingBottom = Number(s.paddingBottom.replace("px", ""));
  const inputFontSize = Number(s.fontSize.replace("px", ""));
  const hintPaddingY = 6;
  const hintHeight = inputFontSize + hintPaddingY * 2;
  const hintTop =
    inputRect.height - inputPaddingBottom + inputPaddingBottom / 2.5;

  return {
    positioningContainer: {
      position: "absolute",
      top: hintTop,
    } as CSSProperties,
    stackingContainer: {
      position: "fixed",
      zIndex: 999,
    } as CSSProperties,
    hints: {
      display: "inline-block",
      position: "absolute",
      left: offsetLeft || s.paddingLeft,
      minWidth: 300,
      maxWidth: 400,
      maxHeight: hintHeight * 7,
      marginLeft: -1,
      overflowX: "hidden",
      overflowY: "scroll",
      background: "#f9f9f9",
      border: "1px solid #dcdcdc",
      color: "#111",
    } as CSSProperties,
    hint: {
      boxSizing: "content-box",
      height: s.fontSize,
      padding: `${hintPaddingY}px 6px`,
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      lineHeight: 1,
      cursor: "pointer",
    } as CSSProperties,
    hintActive: {
      background: "#4299E1",
      color: "white",
    } as CSSProperties,
  };
};

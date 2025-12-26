type CommandResult = {
  type: "calculation" | "color" | "unit" | "string" | "time";
  label: string;
  value: string;
  action: () => void;
};

export function parseCommand(input: string): CommandResult | null {
  const cleanInput = input.trim();
  if (!cleanInput) return null;

  // --- 1. MATH CALCULATOR ---
  const mathRegex = /^[\d\s+\-*/().%]+$/;
  const hasOperator = /[\+\-\*\/\%\(\)]/.test(cleanInput);

  if (mathRegex.test(cleanInput) && hasOperator) {
    try {
      const result = new Function(`return ${cleanInput}`)();
      if (Number.isFinite(result)) {
        const formatted = Number(result).toLocaleString("en-US", {
          maximumFractionDigits: 4,
        });
        return {
          type: "calculation",
          label: "Result",
          value: formatted,
          action: () => navigator.clipboard.writeText(formatted),
        };
      }
    } catch {
      // Ignore
    }
  }

  // --- 2. HEX <-> RGB CONVERTER ---
  // Hex to RGB
  const hexRegex = /^#?([a-f\d]{3}|[a-f\d]{6})$/i;
  const hexMatch = cleanInput.match(hexRegex);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const rgbValue = `rgb(${r}, ${g}, ${b})`;

    return {
      type: "color",
      label: "HEX → RGB",
      value: rgbValue,
      action: () => navigator.clipboard.writeText(rgbValue),
    };
  }

  // RGB to Hex
  const rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
  const rgbMatch = cleanInput.match(rgbRegex);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);

    // Validate range 0-255
    if (r <= 255 && g <= 255 && b <= 255) {
      const hexValue =
        "#" +
        [r, g, b]
          .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          })
          .join("");

      return {
        type: "color",
        label: "RGB → HEX",
        value: hexValue,
        action: () => navigator.clipboard.writeText(hexValue),
      };
    }
  }

  // --- 3. PIXELS <-> REM ---
  // Px to Rem
  const pxRegex = /^(\d+(?:\.\d+)?) ?px$/i;
  const pxMatch = cleanInput.match(pxRegex);
  if (pxMatch) {
    const pixels = parseFloat(pxMatch[1]);
    const rem = pixels / 16;
    const remValue = `${rem.toLocaleString("en-US", { maximumFractionDigits: 3 })}rem`;

    return {
      type: "unit",
      label: "Pixels → REM",
      value: remValue,
      action: () => navigator.clipboard.writeText(remValue),
    };
  }

  // Rem to Px
  const remRegex = /^(\d+(?:\.\d+)?) ?rem$/i;
  const remMatch = cleanInput.match(remRegex);
  if (remMatch) {
    const rem = parseFloat(remMatch[1]);
    const pixels = rem * 16;
    const pxValue = `${pixels}px`;

    return {
      type: "unit",
      label: "REM → Pixels",
      value: pxValue,
      action: () => navigator.clipboard.writeText(pxValue),
    };
  }

  // --- 4. STRING TOOLS (Slugify / Base64) ---
  if (cleanInput.startsWith("slug ")) {
    const text = cleanInput.replace("slug ", "");
    const slug = text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
    return {
      type: "string",
      label: "Slugify",
      value: slug,
      action: () => navigator.clipboard.writeText(slug),
    };
  }

  if (cleanInput.startsWith("b64 ")) {
    const text = cleanInput.replace("b64 ", "");
    try {
      const encoded = btoa(text);
      return {
        type: "string",
        label: "Base64 Encode",
        value: encoded,
        action: () => navigator.clipboard.writeText(encoded),
      };
    } catch {
      // ignore
    }
  }

  // --- 5. TIME TOOLS ---
  if (cleanInput === "now" || cleanInput === "time" || cleanInput === "ts") {
    const now = Math.floor(Date.now() / 1000);
    return {
      type: "time",
      label: "Current Timestamp",
      value: now.toString(),
      action: () => navigator.clipboard.writeText(now.toString()),
    };
  }

  return null;
}

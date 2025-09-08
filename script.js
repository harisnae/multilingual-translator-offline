import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// ---------- UI elements ----------
const modelSelect   = document.getElementById('modelSelect');
const loadBtn       = document.getElementById('loadBtn');
const translateBtn  = document.getElementById('translateBtn');
const clearBtn      = document.getElementById('clearBtn');
const copyBtn       = document.getElementById('copyBtn');
const directionLbl  = document.getElementById('directionLabel');
const statusEl      = document.getElementById('status');
const srcEl         = document.getElementById('src');
const dstEl         = document.getElementById('dst');

// ---------- State ----------
let translator   = null;   // pipeline object
let loadedModelId = null;  // currently loaded model identifier

// ---------- Model → direction map ----------
const MODEL_DIRECTIONS = {
  // English → Other
  "Xenova/opus-mt-en-af":   "English → Afrikaans",
  "Xenova/opus-mt-en-ar":   "English → Arabic",
  "Xenova/opus-mt-en-zh":   "English → Chinese",
  "Xenova/opus-mt-en-cs":   "English → Czech",
  "Xenova/opus-mt-en-da":   "English → Danish",
  "Xenova/opus-mt-en-nl":   "English → Dutch",
  "Xenova/opus-mt-en-fi":   "English → Finnish",
  "Xenova/opus-mt-en-fr":   "English → French",
  "Xenova/opus-mt-en-de":   "English → German",
  "Xenova/opus-mt-en-hi":   "English → Hindi",
  "Xenova/opus-mt-en-hu":   "English → Hungarian",
  "Xenova/opus-mt-en-id":   "English → Indonesian",
  "Xenova/opus-mt-en-jap":  "English → Japanese",
  "Xenova/opus-mt-en-mul":  "English → Multiple",
  "Xenova/opus-mt-en-ro":   "English → Romanian",
  "Xenova/opus-mt-en-ROMANCE":"English → Romance languages",
  "Xenova/opus-mt-en-ru":   "English → Russian",
  "Xenova/opus-mt-en-sv":   "English → Swedish",
  "Xenova/opus-mt-en-uk":   "English → Ukrainian",
  "Xenova/opus-mt-en-vi":   "English → Vietnamese",
  "Xenova/opus-mt-en-xh":   "English → Xhosa",
  // Other → English
  "Xenova/opus-mt-af-en":   "Afrikaans → English",
  "Xenova/opus-mt-ar-en":   "Arabic → English",
  "Xenova/opus-mt-bat-en":  "Baltic → English",
  "Xenova/opus-mt-zh-en":   "Chinese → English",
  "Xenova/opus-mt-cs-en":   "Czech → English",
  "Xenova/opus-mt-de-en":   "German → English",
  "Xenova/opus-mt-hi-en":   "Hindi → English",
  "Xenova/opus-mt-id-en":   "Indonesian → English",
  "Xenova/opus-mt-it-en":   "Italian → English",
  "Xenova/opus-mt-ja-en":   "Japanese → English",
  "Xenova/opus-mt-jap-en":  "Japanese → English",
  "Xenova/opus-mt-ko-en":   "Korean → English",
  "Xenova/opus-mt-no-de":   "Norwegian → German",
  "Xenova/opus-mt-nl-en":   "Dutch → English",
  "Xenova/opus-mt-pl-en":   "Polish → English",
  "Xenova/opus-mt-ru-en":   "Russian → English",
  "Xenova/opus-mt-es-en":   "Spanish → English",
  "Xenova/opus-mt-sv-en":   "Swedish → English",
  "Xenova/opus-mt-tc-big-tr-en":"TC Big TR → English",
  "Xenova/opus-mt-tr-en":   "Turkish → English",
  "Xenova/opus-mt-uk-en":   "Ukrainian → English",
  "Xenova/opus-mt-xh-en":   "Xhosa → English"
  // Other ↔ Other (non‑English)
  "Xenova/opus-mt-da-de":   "Danish → German",
  "Xenova/opus-mt-fi-de":   "Finnish → German",
  "Xenova/opus-mt-fr-de":   "French → German",
  "Xenova/opus-mt-de-fr":   "German → French",
  "Xenova/opus-mt-fr-ro":   "French → Romanian",
  "Xenova/opus-mt-ro-fr":   "Romanian → French",
  "Xenova/opus-mt-fr-ru":   "French → Russian",
  "Xenova/opus-mt-ru-fr":   "Russian → French",
  "Xenova/opus-mt-fr-es":   "French → Spanish",
  "Xenova/opus-mt-es-fr":   "Spanish → French",
  "Xenova/opus-mt-de-es":   "German → Spanish",
  "Xenova/opus-mt-es-de":   "Spanish → German",
  "Xenova/opus-mt-gem-gem": "Germanic → Germanic",
  "Xenova/opus-mt-gmw-gmw": "West Germanic → West Germanic",
  "Xenova/opus-mt-it-fr":   "Italian → French",
  "Xenova/opus-mt-it-es":   "Italian → Spanish",
  "Xenova/opus-mt-es-it":   "Spanish → Italian",
  "Xenova/opus-mt-no-de":   "Norwegian → German",
  "Xenova/opus-mt-ru-uk":   "Russian → Ukrainian",
  "Xenova/opus-mt-uk-ru":   "Ukrainian → Russian",
  "Xenova/opus-mt-es-ru":   "Spanish → Russian"
};

// ---------- Helper ----------
function setStatus(msg) {
  statusEl.textContent = msg;
}

// Update direction label whenever the selected model changes
function updateDirectionLabel() {
  const modelId = modelSelect.value;
  directionLbl.textContent = MODEL_DIRECTIONS[modelId] || "";
}

// ---------- Load model ----------
async function loadModel() {
  const modelId = modelSelect.value;

  // If the same model is already loaded, just enable translation
  if (modelId === loadedModelId && translator) {
    setStatus(`Model "${modelId}" already loaded`);
    translateBtn.disabled = false;
    return;
  }

  // Initialise UI for loading
  setStatus(`Loading model "${modelId}"… 0%`);
  loadBtn.disabled = true;
  translateBtn.disabled = true;

  try {
    translator = await pipeline("translation", modelId, {
      progress_callback: p => {
        if (p?.progress !== undefined) {
          // p.progress may be a fraction (0‑1) or already a percent (0‑100)
          const raw = p.progress;
          const pct = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
          setStatus(`Loading model "${modelId}"… ${pct}%`);
        }
      }
    });

    loadedModelId = modelId;
    setStatus("Model loaded – ready to translate");
    translateBtn.disabled = false;
    updateDirectionLabel();   // show correct direction after loading
  } catch (e) {
    console.error(e);
    setStatus("❌ Failed to load model: " + (e?.message ?? e));
    translator = null;
    loadedModelId = null;
  } finally {
    loadBtn.disabled = false;
  }
}

// ---------- Translate ----------
async function translate() {
  const text = srcEl.value.trim();
  if (!text) {
    setStatus("⚠️ Please enter some text first");
    return;
  }

  translateBtn.disabled = true;
  setStatus("Translating…");

  // Let the UI paint the status before heavy work starts
  await new Promise(r => setTimeout(r, 0));

  dstEl.value = "";

  try {
    const result = await translator(text, {
      max_new_tokens: 256,
      return_full_text: false
    });

    const translation =
      result?.[0]?.generated_text?.trim() ??
      result?.[0]?.translation_text?.trim() ??
      result?.[0]?.text?.trim() ??
      "";

    dstEl.value = translation;
    setStatus("✅ Done");
  } catch (e) {
    console.error(e);
    setStatus("❌ Inference error: " + (e?.message ?? e));
  } finally {
    translateBtn.disabled = false;
  }
}

// ---------- Clear ----------
function clearAll() {
  srcEl.value = "";
  dstEl.value = "";
  setStatus("Cleared");
}

// ---------- Copy ----------
async function copyResult() {
  const txt = dstEl.value;
  if (!txt) {
    setStatus("Nothing to copy");
    return;
  }
  try {
    await navigator.clipboard.writeText(txt);
    setStatus("✅ Text copied to clipboard");
  } catch (e) {
    console.error(e);
    setStatus("❌ Copy failed");
  }
}

// ---------- Event listeners ----------
loadBtn.addEventListener("click", loadModel);
translateBtn.addEventListener("click", translate);
clearBtn.addEventListener("click", clearAll);
copyBtn.addEventListener("click", copyResult);
modelSelect.addEventListener("change", updateDirectionLabel);

// Disable translate until a model is loaded
translateBtn.disabled = true;

// Initialise direction label for the default selected model
updateDirectionLabel();

# multilingual-translator-offline 

**ONNX Multilingual Translator** – a pure‑client, offline‑first web app that runs dozens of OPUS‑MT translation models (int8‑quantised ONNX) directly in the browser via `@xenova/transformers`. After a model is loaded it is cached in the browser and can be used without any network connection.

---  

## Table of Contents
1. [Demo](#demo)  
2. [Key Features](#key-features)  
3. [Architecture Overview](#architecture-overview)  
4. [Supported Language Pairs](#supported-language-pairs)  
5. [Model Configuration Details (example: `Xenova/opus-mt-en-de`)](#model-configuration-details-example-xenovaopus-mt-en-de)  
6. [Technical Limits & Performance](#technical-limits--performance)  
7. [Dependencies & Libraries](#dependencies--libraries)  
8. [Installation & Deployment on GitHub Pages](#installation--deployment-on-github-pages)  
9. [Usage Guide](#usage-guide)  
10. [Extending the App (adding new models / custom ONNX)](#extending-the-app-adding-new-models--custom-onnx)  
11. [License](#license)  

---  

## Demo
The live application is hosted as a static site on GitHub Pages:

```
https://harisnae.github.io/multilingual-translator-offline/
```

Open the page, pick a model, click **Load model**, then translate. After the model finishes loading you can go offline – the translator will still work.

---  

## Key Features
| Feature |
|---------|
| Offline‑first – models are downloaded once, stored in IndexedDB and reused without network. |
| Client‑side inference – no server, no API keys, no data leaves the user’s device. progress (percentage) is shown in the **Status** field. |
| Copy / Clear UI – one‑click copy of the translation, clear button, responsive layout. |
| 43 OPUS‑MT language pairs – English ↔ many languages, plus reverse directions. |
| Int8 quantised ONNX – ~4‑5× smaller files, fast inference in the browser. |
| Static‑site friendly – can be served from any static host (GitHub Pages, Netlify, Cloudflare Pages). |
| Responsive design – mobile‑first CSS, works on screens down to 320 px. |

---  

## Architecture Overview
```
index.html          ← static HTML UI
style.css           ← responsive CSS
script.js           ← UI logic (main thread)
└─ pipeline()       ← @xenova/transformers (ONNX Runtime Web)
   └─ internal worker (handled by the library) runs the ONNX model
```

* **Model loading** – `pipeline("translation", modelId, {progress_callback})` downloads three ONNX files (`encoder_model.onnx`, `decoder_model.onnx`, `decoder_model_merged.onnx`) plus the JSON configuration files.  
* **Caching** – the library automatically stores the files in **IndexedDB**; subsequent loads read from the cache.  
* **Inference** – `translator(text, {max_new_tokens:256, return_full_text:false})` runs the model in the internal worker and returns the generated translation.  

---  

## Supported Language Pairs
The `<select>` element in **index.html** contains the full list. Each model ID now links to its Hugging Face repository.

| Model ID (link) | Direction |
|-----------------|-----------|
| [Xenova/opus‑mt‑en‑af](https://huggingface.co/Xenova/opus-mt-en-af) | English → Afrikaans |
| [Xenova/opus‑mt‑en‑ar](https://huggingface.co/Xenova/opus-mt-en-ar) | English → Arabic |
| [Xenova/opus‑mt‑en‑zh](https://huggingface.co/Xenova/opus-mt-en-zh) | English → Chinese |
| [Xenova/opus‑mt‑en‑cs](https://huggingface.co/Xenova/opus-mt-en-cs) | English → Czech |
| [Xenova/opus‑mt‑en‑da](https://huggingface.co/Xenova/opus-mt-en-da) | English → Danish |
| [Xenova/opus‑mt‑en‑nl](https://huggingface.co/Xenova/opus-mt-en-nl) | English → Dutch |
| [Xenova/opus‑mt‑en‑fi](https://huggingface.co/Xenova/opus-mt-en-fi) | English → Finnish |
| [Xenova/opus‑mt‑en‑fr](https://huggingface.co/Xenova/opus-mt-en-fr) | English → French |
| **[Xenova/opus‑mt‑en‑de](https://huggingface.co/Xenova/opus-mt-en-de)** | English → German |
| [Xenova/opus‑mt‑en‑hi](https://huggingface.co/Xenova/opus-mt-en-hi) | English → Hindi |
| [Xenova/opus‑mt‑en‑hu](https://huggingface.co/Xenova/opus-mt-en-hu) | English → Hungarian |
| [Xenova/opus‑mt‑en‑id](https://huggingface.co/Xenova/opus-mt-en-id) | English → Indonesian |
| [Xenova/opus‑mt‑en‑jap](https://huggingface.co/Xenova/opus-mt-en-jap) | English → Japanese |
| [Xenova/opus‑mt‑en‑mul](https://huggingface.co/Xenova/opus-mt-en-mul) | English → Multiple |
| [Xenova/opus‑mt‑en‑ro](https://huggingface.co/Xenova/opus-mt-en-ro) | English → Romanian |
| [Xenova/opus‑mt‑en‑ROMANCE](https://huggingface.co/Xenova/opus-mt-en-ROMANCE) | English → Romance languages |
| [Xenova/opus‑mt‑en‑ru](https://huggingface.co/Xenova/opus-mt-en-ru) | English → Russian |
| [Xenova/opus‑mt‑en‑sv](https://huggingface.co/Xenova/opus-mt-en-sv) | English → Swedish |
| [Xenova/opus‑mt‑en‑uk](https://huggingface.co/Xenova/opus-mt-en-uk) | English → Ukrainian |
| [Xenova/opus‑mt‑en‑vi](https://huggingface.co/Xenova/opus-mt-en-vi) | English → Vietnamese |
| [Xenova/opus‑mt‑en‑xh](https://huggingface.co/Xenova/opus-mt-en-xh) | English → Xhosa |
| [Xenova/opus‑mt‑af‑en](https://huggingface.co/Xenova/opus-mt-af-en) | Afrikaans → English |
| [Xenova/opus‑mt‑ar‑en](https://huggingface.co/Xenova/opus-mt-ar-en) | Arabic → English |
| [Xenova/opus‑mt‑bat‑en](https://huggingface.co/Xenova/opus-mt-bat-en) | Baltic → English |
| [Xenova/opus‑mt‑zh‑en](https://huggingface.co/Xenova/opus-mt-zh-en) | Chinese → English |
| [Xenova/opus‑mt‑cs‑en](https://huggingface.co/Xenova/opus-mt-cs-en) | Czech → English |
| [Xenova/opus‑mt‑de‑en](https://huggingface.co/Xenova/opus-mt-de-en) | German → English |
| [Xenova/opus‑mt‑hi‑en](https://huggingface.co/Xenova/opus-mt-hi-en) | Hindi → English |
| [Xenova/opus‑mt‑id‑en](https://huggingface.co/Xenova/opus-mt-id-en) | Indonesian → English |
| [Xenova/opus‑mt‑it‑en](https://huggingface.co/Xenova/opus-mt-it-en) | Italian → English |
| [Xenova/opus‑mt‑ja‑en](https://huggingface.co/Xenova/opus-mt-ja-en) | Japanese → English |
| [Xenova/opus‑mt‑jap‑en](https://huggingface.co/Xenova/opus-mt-jap-en) | Japanese → English |
| [Xenova/opus‑mt‑ko‑en](https://huggingface.co/Xenova/opus-mt-ko-en) | Korean → English |
| [Xenova/opus‑mt‑no‑de](https://huggingface.co/Xenova/opus-mt-no-de) | Norwegian → German |
| [Xenova/opus‑mt‑nl‑en](https://huggingface.co/Xenova/opus-mt-nl-en) | Dutch → English |
| [Xenova/opus‑mt‑pl‑en](https://huggingface.co/Xenova/opus-mt-pl-en) | Polish → English |
| [Xenova/opus‑mt‑ru‑en](https://huggingface.co/Xenova/opus-mt-ru-en) | Russian → English |
| [Xenova/opus‑mt‑es‑en](https://huggingface.co/Xenova/opus-mt-es-en) | Spanish → English |
| [Xenova/opus‑mt‑sv‑en](https://huggingface.co/Xenova/opus-mt-sv-en) | Swedish → English |
| [Xenova/opus‑mt‑tc‑big‑tr‑en](https://huggingface.co/Xenova/opus-mt-tc-big-tr-en) | TC Big TR → English |
| [Xenova/opus‑mt‑tr‑en](https://huggingface.co/Xenova/opus-mt-tr-en) | Turkish → English |
| [Xenova/opus‑mt‑uk‑en](https://huggingface.co/Xenova/opus-mt-uk-en) | Ukrainian → English |
| [Xenova/opus‑mt‑xh‑en](https://huggingface.co/Xenova/opus-mt-xh-en) | Xhosa → English |

*The list is alphabetically ordered inside each group (English → X, X → English).*

---  

## Model Configuration Details (example: `Xenova/opus‑mt‑en‑de`)

All OPUS‑MT models share the same schema; the JSON files below are taken from the **English → German** model and illustrate the key fields that the app relies on.

### `config.json`
```json
{
  "_name_or_path": "Helsinki-NLP/opus-mt-en-de",
  "architectures": ["MarianMTModel"],
  "model_type": "marian",
  "is_encoder_decoder": true,
  "d_model": 512,
  "encoder_layers": 6,
  "decoder_layers": 6,
  "encoder_attention_heads": 8,
  "decoder_attention_heads": 8,
  "encoder_ffn_dim": 2048,
  "decoder_ffn_dim": 2048,
  "max_length": 512,
  "max_position_embeddings": 512,
  "vocab_size": 58101,
  "decoder_vocab_size": 58101,
  "pad_token_id": 58100,
  "bos_token_id": 0,
  "eos_token_id": 0,
  "decoder_start_token_id": 58100,
  "num_beams": 4,
  "use_cache": true,
  "share_encoder_decoder_embeddings": true,
  "scale_embedding": true,
  "dropout": 0.1,
  "attention_dropout": 0.0,
  "activation_dropout": 0.0,
  "activation_function": "swish",
  "bad_words_ids": [[58100]],
  "transformers_version": "4.34.0.dev0"
}
```
*Key points*  
* `max_length = 512` → input token limit.  
* `num_beams = 4` → default beam‑search width.  
* Shared encoder‑decoder embeddings reduce memory usage.

### `tokenizer_config.json`
```json
{
  "tokenizer_class": "MarianTokenizer",
  "source_lang": "en",
  "target_lang": "de",
  "model_max_length": 512,
  "pad_token": "<pad>",
  "eos_token": "</s>",
  "unk_token": "<unk>",
  "clean_up_tokenization_spaces": true,
  "separate_vocabs": false
}
```
*The tokenizer respects `model_max_length = 512`, matching the model’s `max_length`.*

### `quantize_config.json`
```json
{
  "per_channel": true,
  "reduce_range": true,
  "per_model_config": {
    "encoder_model":   { "op_types": [...], "weight_type": "QInt8" },
    "decoder_model":   { "op_types": [...], "weight_type": "QInt8" },
    "decoder_model_merged": { "op_types": [...], "weight_type": "QInt8" },
    "decoder_with_past_model": { "op_types": [...], "weight_type": "QInt8" }
  }
}
```
*All four ONNX sub‑graphs are int8‑quantised (QInt8) with per‑channel scaling, giving a ~4‑5× size reduction while preserving translation quality.*

---  

## Technical Limits & Performance
| Aspect | Value / Explanation |
|--------|----------------------|
| Input token limit | 512 tokens (derived from `config.max_length` and `tokenizer_config.model_max_length`). |
| Output token limit | 256 new tokens – set in `script.js` via `max_new_tokens: 256`. |
| Model file size | Approximately 30 – 45 MB per language pair (int8‑quantised ONNX). |
| Runtime memory | Roughly 80 – 120 MB while a model is loaded (depends on the pair). |
| Progress handling | `progress_callback` receives `p.progress` (0‑1 or 0‑100). The code normalises it to a percentage and updates the **Status** field. |
| Offline caching | Files are stored in IndexedDB automatically by `@xenova/transformers`. After the first load the UI shows “Model loaded – ready to translate” even when the network is offline. |
| Browser support | Modern browsers with WebAssembly & IndexedDB (Chrome ≥ 89, Edge, Firefox ≥ 86, Safari ≥ 14). |
| Security | Must be served over HTTPS (GitHub Pages provides this) – required for IndexedDB and the Clipboard API. |

---  

## Dependencies & Libraries
| Library | Version | Role |
|---------|---------|------|
| `@xenova/transformers` | **2.17.2** (loaded from CDN) | High‑level pipeline API, ONNX Runtime Web backend, automatic model download & caching. |
| `ort-web` (bundled inside the transformer library) | – | Executes the ONNX graphs in the browser (WebAssembly). |
| No npm build step is required – the app consists of static HTML, CSS and a single ES‑module JavaScript file. |
| *Optional* – for local development you can `npm i @xenova/transformers` and use a bundler (Vite, Parcel, etc.). |

---  

## Installation & Deployment on GitHub Pages
1. **Clone the repository**  
   ```bash
   git clone https://github.com/harisnae/multilingual-translator-offline.git
   cd multilingual-translator-offline
   ```

2. **No build step** – the app runs directly from the static files.  
   *If you want a local dev server:*  
   ```bash
   npx serve .
   ```

3. **Push to GitHub** (the `main` branch).  

4. **Enable GitHub Pages**  
   * Settings → Pages → Source: `main` branch / `/` (root).  
   * GitHub will automatically serve `index.html` at the URL shown in the **Demo** section.

5. **Warm‑up the cache (optional)** – open the page once with an internet connection, click **Load model** for the models you plan to use. The files are stored in IndexedDB and will be available offline thereafter.

---  

## Usage Guide
1. **Select a model** from the dropdown (e.g., *English → German*).  
2. Click **Load model** – the **Status** field shows a loading percentage.  
3. When the status reads **“Model loaded – ready to translate”**, type or paste text into the **Input** textarea.  
4. Press **Translate** – the button is disabled while inference runs, the status shows **“Translating…”**, then the **Output** textarea is filled.  
5. **Copy** copies the translation to the clipboard; **Clear** empties both textareas.  

*If you go offline after step 2, the same model can be used again without any network traffic.*

---  

## Extending the App  

### Adding a New OPUS‑MT Model
1. Add the model ID to the `<select>` in **index.html** (keep the English → X group first, then X → English, both alphabetically).  
2. Add a human‑readable description to `MODEL_DIRECTIONS` in **script.js**.  
3. Commit and push – the app will automatically download the ONNX files and JSON configs from the Hub when the new model is selected.

### Using a Custom ONNX Model
If you have a model that is not already available as an ONNX repository on the Hub:

1. Export & quantise with Optimum (example for the English → German model):  
   ```bash
   optimum export onnx --model Helsinki-NLP/opus-mt-en-de \
       --output_dir ./onnx_export \
       --quantize int8
   ```
2. Upload the following files to a new Hub repository (e.g., `Xenova/your‑custom‑model`):  
   * `encoder_model.onnx`  
   * `decoder_model.onnx`  
   * `decoder_model_merged.onnx` (optional, improves speed)  
   * `config.json`  
   * `tokenizer_config.json`  
   * `quantize_config.json` (if you quantised)  
3. Use the new repository ID in the UI dropdown; the rest of the code works unchanged.

---  

## License
This project is licensed under the **Apache License Version 2.0**. See the `LICENSE` file for the full text.

---  

### Quick Reference
> **multilingual-translator-offline** – a static, client‑side, offline‑first web app that runs int8‑quantised ONNX OPUS‑MT models (e.g., `Xenova/opus-mt-en-de`) in the browser via `@xenova/transformers`. Input ≤ 512 tokens, output ≤ 256 tokens, works on GitHub Pages, no server required.  

Feel free to open issues, submit pull requests for new language pairs, or improve the UI!

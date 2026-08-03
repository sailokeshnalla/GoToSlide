import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Wand2, Bold, Italic, Underline, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { backendApi } from '@/lib/backendApi';

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseModelJson(raw) {
  if (!raw) return null;
  let text = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
    }
    return null;
  }
}

function buildPrompt(brief, placeholders) {
  const spec = placeholders
    .map((p) => {
      const limit = p.char_limit ? `${p.char_limit} characters max` : 'no strict limit';
      const kind = p.is_multiline ? 'multi-line' : 'single line';
      return `- "${p.placeholder}" (role: ${p.role}, ${kind}, ${limit})`;
    })
    .join('\n');

  const system =
    'You are a senior presentation copywriter. You fill placeholders on a single slide ' +
    'with concise, polished, professional copy derived from the user\'s brief.';

  const user =
    `USER BRIEF:\n${brief}\n\n` +
    `PLACEHOLDERS TO FILL:\n${spec}\n\n` +
    `RULES:\n` +
    `1. NEVER exceed the character limit. Count characters precisely before responding.\n` +
    `2. ALWAYS write complete, finished sentences or phrases — never cut off mid-word or mid-sentence.\n` +
    `3. Match the role:\n` +
    `   - "title" = a short punchy slide title (complete phrase, no trailing words).\n` +
    `   - "heading" or "option" = a concise label of 2–5 complete words.\n` +
    `   - "description" = one or two complete sentences that end with a full stop. If the limit is tight, write ONE strong sentence rather than starting a second one you cannot finish.\n` +
    `4. If the character limit is very tight, prioritise a complete short sentence over a longer incomplete one.\n` +
    `5. Base every value on the brief. Where the brief is thin, infer reasonable, on-topic professional content.\n` +
    `6. Do not include curly braces or placeholder names in your output — only the replacement copy.\n` +
    `7. Return ONLY a JSON object mapping each EXACT placeholder string (with its braces) to its text. ` +
    `No markdown, no code fences, no commentary, no extra keys.`;

  return `${system}\n\n${user}`;
}

// ── Font options ──────────────────────────────────────────────────────────────
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20];
const FONT_FAMILIES = [
  { label: 'Calibri',         value: 'Calibri' },
  { label: 'Arial',           value: 'Arial' },
  { label: 'Georgia',         value: 'Georgia' },
  { label: 'Verdana',         value: 'Verdana' },
  { label: 'Trebuchet MS',    value: 'Trebuchet MS' },
  { label: 'Courier New',     value: 'Courier New' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Comic Sans MS',   value: 'Comic Sans MS' },
];
const COLOR_PALETTE = [
  '#ffffff','#f1f5f9','#94a3b8','#1e293b','#000000',
  '#ef4444','#f97316','#eab308','#22c55e','#06b6d4',
  '#3b82f6','#6366f1','#8b5cf6','#ec4899','#f43f5e',
];

function PowerPointIcon({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10C4 6.68629 6.68629 4 10 4H26V44H10C6.68629 44 4 41.3137 4 38V10Z" fill="#C43E1C" />
      <rect x="26" y="4" width="18" height="13.33" fill="#FF8F6B" />
      <rect x="26" y="17.33" width="18" height="13.34" fill="#ED6C47" />
      <rect x="26" y="30.67" width="18" height="13.33" fill="#D24726" />
      <text x="15" y="29" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="18" fill="white" textAnchor="middle">P</text>
    </svg>
  );
}

function PdfIcon({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 4C7.79086 4 6 5.79086 6 8V40C6 42.2091 7.79086 44 10 44H38C40.2091 44 42 42.2091 42 40V16L30 4H10Z" fill="#E2574C" />
      <path d="M30 4V12C30 14.2091 31.7909 16 34 16H42L30 4Z" fill="#F2A29C" />
      <text x="24" y="32" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11" fill="white" textAnchor="middle">PDF</text>
    </svg>
  );
}

function ImageFileIcon({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="40" height="36" rx="6" fill="#7C3AED" />
      <circle cx="16" cy="18" r="4" fill="#FDE68A" />
      <path d="M4 34L16 24L24 30L34 20L44 30V36C44 39.3137 41.3137 42 38 42H10C6.68629 42 4 39.3137 4 36V34Z" fill="#A855F7" />
    </svg>
  );
}

const DOWNLOAD_FORMATS = [
  { value: 'pptx',  label: 'PPT',  ext: 'pptx', Icon: PowerPointIcon },
  { value: 'pdf',   label: 'PDF',  ext: 'pdf',  Icon: PdfIcon },
  { value: 'image', label: 'PNG',  ext: 'jpg',  Icon: ImageFileIcon },
];

const FONT_WIDTH_MULTIPLIERS = {
  'Calibri':         1.00,
  'Arial':           1.05,
  'Trebuchet MS':    1.05,
  'Georgia':         1.05,
  'Times New Roman': 1.00,
  'Verdana':         1.15,
  'Comic Sans MS':   1.10,
  'Courier New':     1.30,
};

function getEffectiveCharLimit(schemaPh, style) {
  const schemaLimit = schemaPh?.char_limit ?? null;
  if (!schemaLimit) return null;

  const designFontSize = schemaPh?.recommended_font_size || 18;
  const currentSize    = parseFloat(style?.fontSize || designFontSize);
  const sizeFactor     = designFontSize / currentSize;

  const currentFont = style?.fontFamily || 'Calibri';
  const fontMult    = FONT_WIDTH_MULTIPLIERS[currentFont] ?? 1.0;
  const fontFactor  = 1 / fontMult;
  const scaleFactor = sizeFactor * fontFactor;

  return Math.max(5, Math.floor(schemaLimit * scaleFactor));
}

function updateStyle(setFontStyles, ph, prop, value) {
  setFontStyles(prev => ({ ...prev, [ph]: { ...prev[ph], [prop]: value } }));
}

function formatPlaceholderLabel(ph) {
  return ph
    .replace(/[{}]/g, '')
    .replace(/(\d+)/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

// ─────────────────────────────────────────────────────────────────────────────
// PlaceholderField
// ─────────────────────────────────────────────────────────────────────────────
function PlaceholderField({
  ph, idx, label, style, schemaPh, mapping,
  formData, setFormData, fontStyles, setFontStyles,
  openColorPicker, setOpenColorPicker, openFontPicker, setOpenFontPicker,
}) {
  const textareaRef = useRef(null);
  const isMultiline = schemaPh.is_multiline || false;

  const charLimit   = getEffectiveCharLimit(schemaPh, style);
  const currentLen  = (formData[ph] || '').length;
  const fillPct     = charLimit ? Math.min((currentLen / charLimit) * 100, 100) : 0;
  const isNearLimit = charLimit ? currentLen >= charLimit * 0.85 : false;
  const isAtLimit   = charLimit ? currentLen >= charLimit        : false;
  const remaining   = charLimit ? charLimit - currentLen         : null;

  const barColor = isAtLimit   ? '#ef4444'
                 : isNearLimit ? '#eab308'
                 : fillPct > 0 ? '#6366f1'
                 :               '#334155';

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [formData[ph], style.fontSize, style.fontFamily, style.bold, style.italic]);

  const borderClass = isAtLimit   ? 'border-red-500/60 focus:border-red-500'
                    : isNearLimit ? 'border-yellow-500/60 focus:border-yellow-500'
                    :               'border-slate-200 focus:border-indigo-500';

  const inputFontSize = (() => {
    if (isMultiline) return undefined;
    const val          = formData[ph] || '';
    const chosenPx     = parseFloat(style.fontSize || 18);
    const fontMult     = FONT_WIDTH_MULTIPLIERS[style.fontFamily || 'Calibri'] ?? 1.0;
    const inputWidthPx = 260;
    const charWidthPx  = chosenPx * 0.56 * fontMult;
    const charsCanFit  = Math.floor(inputWidthPx / charWidthPx);
    if (!val || val.length <= charsCanFit) return `${chosenPx}px`;
    const scaledPx = Math.max(10, Math.floor((inputWidthPx / val.length) / (0.56 * fontMult)));
    return `${scaledPx}px`;
  })();

  const inputStyle = {
    fontWeight:     style.bold      ? 700      : 400,
    fontStyle:      style.italic    ? 'italic' : 'normal',
    textDecoration: style.underline ? 'underline' : 'none',
    color:          '#1e293b',
    fontFamily:     style.fontFamily || 'Calibri',
    ...(isMultiline
      ? { resize: 'none', overflow: 'hidden', minHeight: '72px' }
      : { fontSize: inputFontSize, transition: 'font-size 0.1s ease' }
    ),
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-600">{label}</label>

      <div className="relative">
        {isMultiline ? (
          <textarea
            ref={textareaRef}
            rows={1}
            value={formData[ph] || ''}
            maxLength={charLimit ?? undefined}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, [ph]: e.target.value }));
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400 transition-colors ${borderClass}`}
            placeholder={`Enter your ${label}...`}
            style={inputStyle}
          />
        ) : (
          <input
            type="text"
            value={formData[ph] || ''}
            maxLength={charLimit ?? undefined}
            onChange={(e) => setFormData(prev => ({ ...prev, [ph]: e.target.value }))}
            className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400 transition-colors ${borderClass}`}
            placeholder={`Enter your ${label}...`}
            style={inputStyle}
          />
        )}

        {charLimit && (
          <div className="mt-1.5 px-0.5 space-y-1">
            <div className="w-full h-1 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${fillPct}%`,
                  backgroundColor: barColor,
                  boxShadow: isAtLimit   ? '0 0 6px rgba(239,68,68,0.6)'
                           : isNearLimit ? '0 0 6px rgba(234,179,8,0.5)'
                           : 'none',
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-medium ${
                isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : 'text-slate-500'
              }`}>
                {isAtLimit
                  ? '⚠ Character limit reached'
                  : isNearLimit
                  ? `${remaining} character${remaining === 1 ? '' : 's'} left`
                  : schemaPh.role
                  ? schemaPh.role.charAt(0).toUpperCase() + schemaPh.role.slice(1)
                  : ''}
              </span>
              <span className={`text-[10px] font-mono tabular-nums ${
                isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : 'text-slate-500'
              }`}>
                {currentLen} / {charLimit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Style toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap p-2 bg-slate-50 border border-slate-200 rounded-xl">
        <button
          title="Bold"
          onClick={() => updateStyle(setFontStyles, ph, 'bold', !style.bold)}
          className={`p-1.5 rounded-lg transition-all ${style.bold ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          title="Italic"
          onClick={() => updateStyle(setFontStyles, ph, 'italic', !style.italic)}
          className={`p-1.5 rounded-lg transition-all ${style.italic ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          title="Underline"
          onClick={() => updateStyle(setFontStyles, ph, 'underline', !style.underline)}
          className={`p-1.5 rounded-lg transition-all ${style.underline ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        <select
          value={style.fontSize || 18}
          onChange={(e) => updateStyle(setFontStyles, ph, 'fontSize', Number(e.target.value))}
          className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-1.5 py-1 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          title="Font size"
        >
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}pt</option>)}
        </select>

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        {/* Font Family */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenFontPicker(openFontPicker === ph ? null : ph);
              setOpenColorPicker(null);
            }}
            className="flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 hover:border-indigo-500/50 transition-all"
            title="Font family"
          >
            <span>{FONT_FAMILIES.find(f => f.value === style.fontFamily)?.label || 'Default'}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {openFontPicker === ph && (
            <div className="absolute top-8 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[110px]">
              {FONT_FAMILIES.map(f => (
                <button
                  key={f.value}
                  onClick={() => {
                    updateStyle(setFontStyles, ph, 'fontFamily', f.value);
                    setOpenFontPicker(null);
                  }}
                  style={{ fontFamily: f.value }}
                  className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                    style.fontFamily === f.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        {/* Color picker */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenColorPicker(openColorPicker === ph ? null : ph);
              setOpenFontPicker(null);
            }}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 hover:border-indigo-500/50 transition-all"
            title="Text colour"
          >
            <span
              className="w-3 h-3 rounded-full border border-slate-300 flex-shrink-0"
              style={{ background: style.color || '#ffffff' }}
            />
            <span>Color</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {openColorPicker === ph && (
            <div className="absolute top-8 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-[188px]">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Text Colour</p>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      updateStyle(setFontStyles, ph, 'color', c);
                      setOpenColorPicker(null);
                    }}
                    className="w-7 h-7 rounded-md transition-transform hover:scale-110"
                    style={{
                      background: c,
                      border: style.color === c ? '2px solid #6366f1' : '1px solid rgba(0,0,0,0.1)',
                    }}
                    title={c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-500">HEX</span>
                <input
                  value={style.color || '#ffffff'}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                      updateStyle(setFontStyles, ph, 'color', v);
                    }
                  }}
                  maxLength={7}
                  placeholder="#ffffff"
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-mono outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span
                  className="w-5 h-5 rounded flex-shrink-0 border border-slate-300"
                  style={{ background: style.color || '#ffffff' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function TemplatePreviewModal({ previewTemplate, onClose }) {
  const [formData, setFormData]               = useState({});
  const [isGenerating, setIsGenerating]       = useState(false);
  const [fontStyles, setFontStyles]           = useState({});
  const [openColorPicker, setOpenColorPicker] = useState(null);
  const [openFontPicker, setOpenFontPicker]   = useState(null);
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
  const pickerRef    = useRef(null);
  const formatMenuRef = useRef(null);

  const [detectedPlaceholders, setDetectedPlaceholders] = useState([]);
  const [isDetecting, setIsDetecting]                   = useState(false);
  const [templateSchema, setTemplateSchema]             = useState({});
  const [placeholderMappings, setPlaceholderMappings]   = useState({});

  const [activeImageUrl, setActiveImageUrl]             = useState(previewTemplate?.preview_image);
  const [pendingImageUrl, setPendingImageUrl]           = useState(null);
  const [isBasePreviewLoading, setIsBasePreviewLoading] = useState(false);
  const [slideDimensions, setSlideDimensions]           = useState({ width: 9144000, height: 6858000, type: 'pptx' });

  const [aiBrief, setAiBrief]               = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError]               = useState('');
  const [aiProvider, setAiProvider]         = useState(null);
  const [aiKeyPresent, setAiKeyPresent]     = useState(false);

  // FLICK FIX: derive a STABLE identity for the template and key the load effect
  // on it (below) instead of the previewTemplate object. Parents sometimes hand
  // down a fresh object on every render; depending on that object re-ran the
  // effect repeatedly, toggling the loading state on/off — the flick you saw
  // right before the placeholders appear. templateRef lets the effect read the
  // latest template fields without depending on the object reference.
  const templateRef = useRef(previewTemplate);
  const templateKey = previewTemplate?.id ?? previewTemplate?.download_url ?? null;

  useEffect(() => {
    templateRef.current = previewTemplate;
  }, [previewTemplate]);

  // ── Lock body scroll while modal is open ─────────────────────────────────
  useEffect(() => {
    document.body.style.overflow            = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow            = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // ── Close pickers on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpenColorPicker(null);
        setOpenFontPicker(null);
      }
      if (formatMenuRef.current && !formatMenuRef.current.contains(e.target)) {
        setIsFormatMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── FIX: Reset ALL derived state immediately when template changes ────────
  // Previously this reset only happened when previewTemplate was falsy,
  // so switching between templates left stale placeholders/overlays visible.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({});
    setDetectedPlaceholders([]);
    setPlaceholderMappings({});
    setActiveImageUrl(templateRef.current?.preview_image);
    setPendingImageUrl(null);
    setIsBasePreviewLoading(false);
    setFontStyles({});
    setTemplateSchema({});
    setAiBrief('');
    setAiError('');
    setSlideDimensions({ width: 9144000, height: 6858000, type: 'pptx' });

    if (!templateKey) return;

    // Read the current template from the ref (not the effect's closure) so the
    // effect can depend on the stable templateKey alone.
    const tpl = templateRef.current;

    // ── Parse schema ──────────────────────────────────────────────────────
    let parsedSchema = {};
    try {
      let schemaObj = tpl.schema;
      if (typeof schemaObj === 'string') schemaObj = JSON.parse(schemaObj);
      if (schemaObj?.placeholders) {
        Object.entries(schemaObj.placeholders).forEach(([key, val]) => {
          parsedSchema[key.replace(/[{}\s]/g, '').toLowerCase()] = val;
        });
      }
    } catch (e) {
      console.warn('Failed to parse template schema:', e);
    }
    // FIX Bug 2: set schema state AND use parsedSchema in the async fn below
    // so both the state and initial styles use the same parsed data.
    setTemplateSchema(parsedSchema);

    // ── Detect placeholders ───────────────────────────────────────────────
    let cancelled = false; // guard against stale async results if user switches fast

    const detectPlaceholders = async () => {
      setIsDetecting(true);
      try {
        const res = await fetch('/api/detect-placeholders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateUrl: tpl.download_url }),
        });

        if (cancelled) return; // FIX: discard result if template already changed

        if (res.ok) {
          const data = await res.json();

          if (cancelled) return;

          const placeholders = data.placeholders || [];
          const mappings     = data.placeholderMappings || {};

          setDetectedPlaceholders(placeholders);
          setPlaceholderMappings(mappings);
          if (data.slideWidth && data.slideHeight) {
            setSlideDimensions({ width: data.slideWidth, height: data.slideHeight, type: data.fileType || 'pptx' });
          }

          const initialData       = {};
          const emptyReplacements = {};
          const initialStyles     = {};
          const augmentedSchema = { ...parsedSchema };

          placeholders.forEach((ph, index) => {
            initialData[ph]       = '';
            // Empty (not a space) so the base preview renders each placeholder
            // box genuinely blank. The live overlay is then the ONLY thing
            // drawing text into those boxes -- nothing to overlap with.
            emptyReplacements[ph] = '';

            const meta       = mappings[ph] || {};
            const normKey    = ph.replace(/[{}\s]/g, '').toLowerCase();
            
            // Map generic ph_X keys from dashboard metadata to actual detected keys
            const fallbackKey = `ph_${index}`;
            if (!augmentedSchema[normKey] && !augmentedSchema[ph] && augmentedSchema[fallbackKey]) {
              augmentedSchema[normKey] = augmentedSchema[fallbackKey];
            }
            
            const schemaMeta = augmentedSchema[normKey] || augmentedSchema[ph] || {};

            initialStyles[ph] = {
              fontSize:   meta.fontSize || schemaMeta.recommended_font_size || 18,
              bold:       schemaMeta.is_bold ?? meta.isBold ?? false,
              italic:     meta.isItalic || false,
              underline:  false,
              color:      schemaMeta.color || meta.color || '#1e293b',
              fontFamily: 'Calibri',
            };
          });

          // Update schema with augmented mapping so UI displays char limits correctly
          setTemplateSchema(augmentedSchema);

          setFormData(initialData);
          setFontStyles(initialStyles);

          if (placeholders.length > 0) {
            setIsBasePreviewLoading(true);
            try {
              const baseRes = await fetch('/api/generate-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  templateUrl:  tpl.download_url,
                  replacements: emptyReplacements,
                }),
              });

              if (cancelled) return;

              if (baseRes.ok) {
                const baseData = await baseRes.json();
                if (baseData.previewUrl) {
                  setPendingImageUrl(baseData.previewUrl);
                } else {
                  if (!cancelled) setIsBasePreviewLoading(false);
                }
              } else {
                if (!cancelled) setIsBasePreviewLoading(false);
              }
            } catch (err) {
              if (!cancelled) {
                console.error('Failed to generate base preview:', err);
                setIsBasePreviewLoading(false);
              }
            }
          }
        }
      } catch (err) {
        if (!cancelled) console.error('Detection error:', err);
      } finally {
        if (!cancelled) setIsDetecting(false);
      }
    };

    detectPlaceholders();

    // FIX: cancel in-flight async work when template changes before it resolves
    return () => { cancelled = true; };

  }, [templateKey]); // FLICK FIX: stable string key — one load per real template, no re-run thrash

  // ── Read AI key from user metadata ───────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAiProvider(user?.user_metadata?.ai_provider || null);
      setAiKeyPresent(!!user?.user_metadata?.ai_api_key);
    });
  }, []);

  // ── AI content generation ─────────────────────────────────────────────────
  const handleGenerateAI = async () => {
    if (!aiBrief.trim()) {
      setAiError('Add a few sentences describing your content first.');
      return;
    }
    if (detectedPlaceholders.length === 0) {
      setAiError('No placeholders to fill in this template.');
      return;
    }

    setAiError('');
    setIsAiGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const provider = user?.user_metadata?.ai_provider || 'gemini';

      const spec = detectedPlaceholders.map((ph) => {
        const normPh = ph.replace(/[{}\s]/g, '').toLowerCase();
        const meta   = templateSchema[normPh] || templateSchema[ph] || {};
        return {
          placeholder:  ph,
          role:         meta.role || 'text',
          char_limit:   meta.char_limit ?? null,
          is_multiline: meta.is_multiline ?? false,
        };
      });

      const promptStr = buildPrompt(aiBrief, spec);

      const payload = {
        provider: provider,
        prompt: promptStr,
        template: previewTemplate?.download_url || "",
        content: aiBrief,
        options: {}
      };

      const resData = await backendApi.post('/api/generate-ai-content', payload);

      if (!resData || !resData.success) {
        throw new Error(resData?.message || 'AI generation failed. Please try again.');
      }

      const raw = resData.text;
      const parsed = parseModelJson(raw);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('The model did not return usable content. Please try again.');
      }

      const normalizedReturned = {};
      for (const [k, v] of Object.entries(parsed)) normalizedReturned[formatPlaceholderLabel(k).replace(/ /g, '').toLowerCase()] = v;

      const content = {};
      for (const p of spec) {
        const value = parsed[p.placeholder] ?? normalizedReturned[formatPlaceholderLabel(p.placeholder).replace(/ /g, '').toLowerCase()] ?? '';
        content[p.placeholder] = value;
      }

      setFormData((prev) => {
        const next = { ...prev };
        spec.forEach(({ placeholder, char_limit }) => {
          let val = content?.[placeholder];
          if (typeof val !== 'string') return;
          val = val.trim();
          if (char_limit && val.length > char_limit) {
            val = val.slice(0, char_limit).trimEnd();
          }
          next[placeholder] = val;
        });
        return next;
      });
    } catch (err) {
      setAiError(err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = async (format = 'pptx') => {
    if (!previewTemplate.download_url) {
      alert('This template does not have a valid download URL.');
      return;
    }

    const formatMeta = DOWNLOAD_FORMATS.find(f => f.value === format) || DOWNLOAD_FORMATS[0];

    try {
      setIsGenerating(true);
      setIsFormatMenuOpen(false);

      const replacementsToSend = {};
      detectedPlaceholders.forEach((key) => {
        const val = formData[key];
        replacementsToSend[key] = val?.trim() ? val : '';
      });
      const stylingToSend = {};
      Object.entries(fontStyles).forEach(([key, s]) => {
        stylingToSend[key] = {
          bold:       s.bold,
          italic:     s.italic,
          underline:  s.underline,
          fontSize:   s.fontSize,
          color:      s.color,
          fontFamily: s.fontFamily,
        };
      });

      const hasPlaceholders = detectedPlaceholders.length > 0;

      // Resolve the URL of the file to download. For a customised deck (or any
      // non-pptx format) the backend renders it and returns a Supabase URL via
      // the /api/generate-template proxy (JSON: { downloadUrl }). For an
      // untouched pptx we just download the original template URL directly.
      let fileUrl;
      if (hasPlaceholders || format !== 'pptx') {
        const res = await fetch('/api/generate-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateUrl:  previewTemplate.download_url,
            replacements: replacementsToSend,
            styling:      stylingToSend,
            format,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.downloadUrl) {
          throw new Error(data.error || 'Failed to generate file');
        }
        fileUrl = data.downloadUrl;
      } else {
        fileUrl = previewTemplate.download_url;
      }

      // Fetch the actual file bytes so we can force a download with a clean
      // filename (opening the URL directly could just render in the browser).
      const fileRes = await fetch(fileUrl);
      if (!fileRes.ok) throw new Error('Failed to fetch the generated file');
      const downloadBlob = await fileRes.blob();

      const url = window.URL.createObjectURL(downloadBlob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${previewTemplate.title.replace(/\s+/g, '_')}${hasPlaceholders ? '_Custom' : ''}.${formatMeta.ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error generating template: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex bg-white overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full h-full flex flex-col md:flex-row overflow-hidden"
      >

        {/* ── LEFT: Slide preview ───────────────────────────────────────── */}
        <div className="relative w-full md:w-3/5 h-[45vh] md:h-full bg-slate-100 border-r border-slate-200 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-30 pointer-events-none" />

          <button
            onClick={onClose}
            title="Back to categories"
            className="absolute top-5 left-5 z-20 flex items-center gap-1.5 pl-2.5 pr-4 py-2 bg-white/90 backdrop-blur border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-indigo-400 rounded-full shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back</span>
          </button>

          <div className="relative w-full flex-1 flex items-center justify-center p-6 md:p-10 min-h-0 overflow-hidden">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xl bg-white flex items-center justify-center" style={{ maxWidth: '100%', maxHeight: '100%' }}>
              
              {/* Invisible SVG to maintain aspect ratio bounded by max width/height */}
              <svg 
                viewBox={`0 0 ${slideDimensions.width || 16} ${slideDimensions.height || 9}`} 
                width="100000"
                height="100000"
                className="opacity-0 pointer-events-none"
                style={{ 
                  display: 'block',
                  maxWidth: '100%', 
                  maxHeight: '100%',
                }}
              />

              <div className="absolute inset-0 w-full h-full" style={{ containerType: 'inline-size' }}>

                <Image
                  src={activeImageUrl || previewTemplate.preview_image}
                  alt="Slide preview"
                  fill
                  unoptimized={true}
                  className={`object-contain transition-opacity duration-300 ${
                    isBasePreviewLoading ? 'opacity-40 blur-sm' : 'opacity-100'
                  }`}
                />

                {pendingImageUrl && (
                  <Image
                    src={pendingImageUrl}
                    alt="Preload"
                    fill
                    unoptimized={true}
                    className="opacity-0 pointer-events-none"
                    onLoad={() => {
                      setActiveImageUrl(pendingImageUrl);
                      setPendingImageUrl(null);
                      setIsBasePreviewLoading(false);
                    }}
                    onError={() => {
                      setPendingImageUrl(null);
                      setIsBasePreviewLoading(false);
                    }}
                  />
                )}

                {isBasePreviewLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030712]/40 z-10 backdrop-blur-[2px]">
                    <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span className="text-white text-xs font-semibold tracking-wide drop-shadow-md bg-black/30 px-3 py-1 rounded-full border border-white/10">
                      Preparing Live Canvas...
                    </span>
                  </div>
                )}

                {/* Placeholder overlays.

                    The overlay is only ever allowed to draw over the *blank* base
                    preview (every placeholder rendered empty by the backend). It
                    must NEVER draw over previewTemplate.preview_image -- the
                    original thumbnail still has the design's example text baked in,
                    and painting our own copy on top of it, offset by the imperfect
                    % positioning, is what produced the earlier ghosting.

                    Because the base preview boxes are genuinely blank, we can show
                    a faint placeholder *label* for empty fields (so the user can
                    see WHERE each field lands), and the typed value once present --
                    with nothing underneath to overlap. */}
                <div className="absolute inset-0 pointer-events-none">
                  {(activeImageUrl !== previewTemplate.preview_image && !isBasePreviewLoading) &&
                   Object.entries(placeholderMappings).map(([ph, mapping]) => {
                    const value    = formData[ph];
                    const style    = fontStyles[ph] || {};
                    const hasValue = value !== undefined && value !== null && value.trim() !== '';

                    // Typed value, or a faint label so the placeholder position is
                    // visible on the otherwise-blank slide.
                    const displayValue = hasValue ? value : formatPlaceholderLabel(ph);

                    const normPh   = ph.replace(/[{}\s]/g, '').toLowerCase();
                    // FIX Bug 2: templateSchema state is now correctly set before
                    // overlays render, so this lookup always finds the right schema.
                    const schemaPh = templateSchema[normPh] || templateSchema[ph] || {};

                    const schemaLines   = schemaPh.lines       || 1;
                    const isMultiline   = schemaPh.is_multiline || schemaLines > 1;
                    const schemaBold    = schemaPh.is_bold      ?? mapping.isBold ?? false;
                    const recommendedPt = mapping.fontSize || schemaPh.recommended_font_size || 18;

                    const activePt      = parseFloat(style.fontSize || recommendedPt);
                    const slideWidthPt  = slideDimensions.type === 'svg'
                      ? slideDimensions.width
                      : (slideDimensions.width || 9144000) / 12700;
                    const fontSizeCqw   = (activePt / slideWidthPt) * 100;
                    const lineHeightCqw = fontSizeCqw * 1.35;

                    const boxLeft  = Math.max(0, mapping.left);
                    const boxTop   = Math.max(0, mapping.top);
                    const boxWidth = Math.min(mapping.width, 100 - boxLeft);

                    const heightFromMapping = mapping.height || 0;
                    const heightForLines    = schemaLines * lineHeightCqw * 1.1;
                    const boxMinHeight      = Math.min(
                      Math.max(heightFromMapping, heightForLines),
                      95 - boxTop
                    );

                    const fwm = {
                      'Calibri': 1.00, 'Arial': 1.05, 'Georgia': 1.05,
                      'Verdana': 1.15, 'Trebuchet MS': 1.05,
                      'Times New Roman': 1.00, 'Comic Sans MS': 1.10,
                      'Courier New': 1.30,
                    };
                    const fontWidthMult = fwm[style.fontFamily || 'Calibri'] ?? 1.0;
                    const charWidthCqw  = fontSizeCqw * 0.56 * fontWidthMult;
                    const charsPerLine  = Math.max(1, Math.floor(boxWidth / charWidthCqw));
                    const linesAvail    = Math.max(1, Math.floor(boxMinHeight / lineHeightCqw));
                    const maxCharsInBox = charsPerLine * linesAvail;
                    const textLen       = displayValue.length;
                    const shrinkFactor  = textLen > maxCharsInBox && maxCharsInBox > 0
                      ? Math.max(0.5, Math.sqrt(maxCharsInBox / textLen))
                      : 1;
                    const finalFontSize = fontSizeCqw * shrinkFactor;
                    const finalColor    = style.color || schemaPh.color || mapping.color || '#1e293b';

                    return (
                      <div
                        key={ph}
                        style={{
                          position:        'absolute',
                          left:            `${boxLeft}%`,
                          top:             `${boxTop}%`,
                          width:           `${boxWidth}%`,
                          minHeight:       `${boxMinHeight}%`,
                          height:          'auto',
                          overflow:        'visible',
                          fontSize:        `${finalFontSize}cqw`,
                          lineHeight:      1.4,
                          fontWeight:      style.bold    ? 'bold'   : schemaBold       ? 'bold'   : 'normal',
                          fontStyle:       style.italic  ? 'italic' : mapping.isItalic ? 'italic' : 'normal',
                          textDecoration:  style.underline ? 'underline' : 'none',
                          fontFamily:      style.fontFamily || 'Calibri',
                          color:           finalColor,
                          display:         'flex',
                          flexDirection:   'column',
                          justifyContent:  isMultiline ? 'flex-start' : 'center',
                          alignItems:      mapping.align === 'CENTER' ? 'center'
                                         : mapping.align === 'RIGHT'  ? 'flex-end'
                                         : 'flex-start',
                          textAlign:       mapping.align === 'CENTER' ? 'center'
                                         : mapping.align === 'RIGHT'  ? 'right'
                                         : 'left',
                          whiteSpace:      (!isMultiline || displayValue.length < 20) ? 'nowrap' : 'pre-wrap',
                          wordBreak:       'normal',
                          overflowWrap:    'normal',
                          // Faint for the placeholder label, full for real text.
                          opacity:         hasValue ? 1 : 0.4,
                          transition:      'opacity 0.2s ease',
                        }}
                      >
                        {displayValue}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form sidebar ───────────────────────────────────────── */}
        <div
          ref={pickerRef}
          className="modal-sidebar w-full md:w-2/5 h-full flex flex-col overflow-y-auto overflow-x-hidden bg-white"
        >
          <div className="flex flex-col flex-grow p-8 md:p-10">

            {/* Header */}
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-lg uppercase tracking-wider mb-4 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                {previewTemplate.category}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">{previewTemplate.title}</h2>
            </div>

            {/* Fields */}
            <div className="flex-grow space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                Customize PPT Data
              </div>

              {/* Generate with AI */}
              {!isDetecting && detectedPlaceholders.length > 0 && (
                <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-purple-50/50 p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      Generate with AI
                    </div>
                    {aiProvider && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md">
                        {aiProvider === 'grok' ? 'xAI Grok' : 'Google Gemini'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    Paste your notes or describe your idea. AI writes copy that fits each
                    placeholder&apos;s character limit, then fills the fields below.
                  </p>

                  <textarea
                    rows={3}
                    value={aiBrief}
                    onChange={(e) => setAiBrief(e.target.value)}
                    placeholder="e.g. A quarterly update on our product launch: we shipped the new dashboard, grew users 30%, and are expanding to the EU next quarter…"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400 transition-colors resize-none text-sm leading-relaxed"
                  />

                  {aiError && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-red-500">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      {aiError}
                    </p>
                  )}



                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isAiGenerating}
                    className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      isAiGenerating
                        ? 'bg-indigo-300 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] hover:shadow-[0_0_26px_rgba(99,102,241,0.55)] active:scale-[0.99]'
                    }`}
                  >
                    {isAiGenerating ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Writing your content…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate content
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* FIX Bug 4: show spinner during detection, "no placeholders" only
                  after detection completes AND the result is genuinely empty. */}
              {isDetecting ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-70">
                  <svg className="animate-spin h-6 w-6 text-indigo-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span className="text-xs text-slate-500">Scanning template for placeholders...</span>
                </div>
              ) : detectedPlaceholders.length === 0 ? (
                <div className="text-sm text-slate-400 py-4 text-center">
                  No placeholders detected in this template.
                </div>
              ) : (
                detectedPlaceholders.map((ph, idx) => {
                  const label    = formatPlaceholderLabel(ph);
                  const style    = fontStyles[ph] || {};
                  const normPh   = ph.replace(/[{}\s]/g, '').toLowerCase();
                  const schemaPh = templateSchema[normPh] || templateSchema[ph] || {};
                  const mapping  = placeholderMappings[ph] || {};

                  return (
                    <PlaceholderField
                      key={`${ph}-${idx}`}
                      ph={ph}
                      idx={idx}
                      label={label}
                      style={style}
                      schemaPh={schemaPh}
                      mapping={mapping}
                      formData={formData}
                      setFormData={setFormData}
                      fontStyles={fontStyles}
                      setFontStyles={setFontStyles}
                      openColorPicker={openColorPicker}
                      setOpenColorPicker={setOpenColorPicker}
                      openFontPicker={openFontPicker}
                      setOpenFontPicker={setOpenFontPicker}
                    />
                  );
                })
              )}
            </div>

            {/* Generate & Download */}
            <div ref={formatMenuRef} className="relative mt-6 pt-6 border-t border-slate-200 flex gap-4">
              <button
                disabled={isGenerating}
                onClick={() => setIsFormatMenuOpen(prev => !prev)}
                className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] transform ${
                  isGenerating
                    ? 'opacity-70 cursor-not-allowed animate-pulse'
                    : 'hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-0.5'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Generate & Download</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isFormatMenuOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {isFormatMenuOpen && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-full left-0 right-0 mb-3 z-[60] bg-white border border-slate-200 rounded-2xl shadow-2xl ring-1 ring-black/5 p-3"
                >
                  <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Download as
                  </p>
                  <div className="flex items-stretch gap-2">
                    {DOWNLOAD_FORMATS.map((f) => {
                      const Icon = f.Icon;
                      return (
                        <button
                          key={f.value}
                          onClick={() => handleDownload(f.value)}
                          className="flex-1 flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:-translate-y-0.5 transition-all"
                        >
                          <Icon className="w-9 h-9" />
                          <span className="text-xs font-bold text-slate-700">{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
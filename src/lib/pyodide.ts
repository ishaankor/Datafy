// Pyodide WebAssembly Python Engine for Browser Matplotlib & Seaborn Execution

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    pyodideInstance?: any;
    pyodideLoadingPromise?: Promise<any>;
  }
}

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/";

export async function getPyodide(): Promise<any> {
  if (typeof window === "undefined") return null;

  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (window.pyodideLoadingPromise) {
    return window.pyodideLoadingPromise;
  }

  window.pyodideLoadingPromise = (async () => {
    // Inject pyodide.js script tag if not present
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${PYODIDE_CDN}pyodide.js`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Pyodide CDN script"));
        document.head.appendChild(script);
      });
    }

    if (!window.loadPyodide) {
      throw new Error("Pyodide script failed to initialize loadPyodide");
    }

    const pyodide = await window.loadPyodide({
      indexURL: PYODIDE_CDN,
    });

    // Load Python packages needed for data science visualization
    await pyodide.loadPackage(["pandas", "matplotlib", "seaborn", "numpy"]);

    window.pyodideInstance = pyodide;
    return pyodide;
  })();

  return window.pyodideLoadingPromise;
}

export async function executePythonChart(
  code: string,
  csvContent: string
): Promise<string | null> {
  try {
    const pyodide = await getPyodide();
    if (!pyodide) return null;

    // Write CSV content to pyodide virtual filesystem
    pyodide.FS.writeFile("current_data.csv", csvContent);

    // Python script wrapper to execute code and capture chart image as Base64 PNG
    const runnerCode = `
import io, base64, sys
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('dark_background')
plt.rcParams['figure.dpi'] = 150
plt.rcParams['font.sans-serif'] = 'sans-serif'
plt.rcParams['axes.edgecolor'] = '#D4AF37'
plt.rcParams['axes.linewidth'] = 0.8

# Override plt.show so calling it does not clear/wipe the figure canvas
plt.show = lambda *args, **kwargs: None

user_code = ${JSON.stringify(code)}

# Provide pre-loaded dataframe in local scope
df = pd.read_csv('current_data.csv')
num_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c]) and not c.lower().startswith('unnamed')]

locs = {
    'df': df,
    'pd': pd,
    'plt': plt,
    'sns': sns,
    'num_cols': num_cols
}

try:
    exec(user_code, locs, locs)
except Exception as e:
    print(f"Python Execution Error: {e}", file=sys.stderr)

# Save current figure to BytesIO buffer
buf = io.BytesIO()
fig = plt.gcf()
fig.savefig(buf, format='png', bbox_inches='tight', dpi=150, facecolor='#0D0D0F', edgecolor='none')
buf.seek(0)
img_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
plt.close('all')

img_b64
`;

    const resultB64 = await pyodide.runPythonAsync(runnerCode);
    if (resultB64 && typeof resultB64 === "string" && resultB64.length > 100) {
      return `data:image/png;base64,${resultB64}`;
    }
    return null;
  } catch (err) {
    console.error("Pyodide WASM Execution Failed:", err);
    return null;
  }
}

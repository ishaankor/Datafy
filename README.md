<p align="center">
  <img width="150" height="150" src="./public/favicon.ico" alt="logo">
</p>

> An autonomous, AI-driven data science copilot that transforms raw data into an interactive, visual, and analytical canvas.

**Datafy!** bridges the gap between raw numbers and actionable insights. Designed as an elegant, conversational interface, it acts as a Principal Data Scientist sitting right beside you—capable of dynamically analyzing datasets, executing complex mathematical operations, and rendering stunning visual artifacts in real time.

---

### The Vision

Modern data analysis is often fragmented across Jupyter notebooks, BI dashboards, and terminal windows. Datafy! unifies this process. By allowing users to upload a CSV and seamlessly highlight specific cells, rows, or columns, the system instantly narrows its analytical focus. Whether executing exploratory data analysis (EDA), inferential statistics, or advanced machine learning workflows, the copilot interprets the data and returns a curated, mathematically rigorous narrative to the user's demands.

### Engineering Highlights

The architecture of Datafy! was designed to prioritize speed, analytical autonomy, and context resilience, overcoming the traditional bottlenecks of LLM-based agentic workflows:

* **Optimized Agentic Workflow:** Powered by LangChain, the system utilizes a custom, single-pass unified execution node. By collapsing heavy, multi-agent ReAct loops into a streamlined architecture, generation latency is drastically reduced while maintaining elite reasoning capabilities.
* **Secure Python Sandbox:** The backend features a dynamic Python REPL that executes Pandas manipulations and statistical models on the fly.
* **Context-Safe Visual Extraction:** Matplotlib charts are rendered to the server's disk and converted directly to Base64 strings. This allows the system to bypass massive context-window bloat, ensuring smaller, highly capable fallback models never crash due to token limits.
* **Dynamic Matrix Parsing:** The TypeScript frontend distinguishes between dense and sparse data selections, transforming user highlights into structured key-value CSV subsets. The backend intelligently pivots and filters these subsets without corrupting the primary dataset context.
* **Resilient Fallback Hierarchy:** Engineered to maintain maximum uptime using OpenRouter. The system utilizes a strict fallback chain of highly capable models (e.g., Nemotron-3, Llama-3.3-70B, and Gemini Flash) to avoid inference queuing and seamlessly handle API volatility.
* **Pedagogical AI Design:** The final synthesis engine is explicitly prompted to generate questions that target core mathematical concepts, guiding the user toward a deeper understanding of their data distributions and statistical outcomes.

---

### Technical Architecture

**Frontend**

* **Framework:** React & TypeScript
* **Visuals:** Tailwind CSS, Recharts, and custom Base64 Matplotlib Parsers
* **State Management:** React Hooks and custom hooks

**Backend & AI**

* **Framework:** FastAPI (Python)
* **Agentic Orchestration:** LangGraph & LangChain
* **Data Science Engine:** Pandas, Matplotlib, Scikit-learn
* **LLM Infrastructure:** OpenRouter API

---
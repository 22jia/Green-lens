# Green Lens

Green Lens is a consumer-facing ESG search prototype. Users search a brand, the app collects recent ESG-related news, asks an AI model to analyze the brand, and returns a score, rating, dimension breakdown, key facts, and source links.

## Current Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Tavily for ESG/news search
- DeepSeek via the OpenAI-compatible SDK for analysis

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Then fill in:

- `DEEPSEEK_API_KEY`
- `TAVILY_API_KEY`

Run the app:

```bash
npm run dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

## Useful Scripts

- `npm run dev`: start the local development server
- `npm run lint`: run Next.js linting
- `npm run typecheck`: run TypeScript checks
- `npm run build`: create a production build
- `npm run check`: run lint, typecheck, and build together

## Product Direction

### P0: Core Scoring Quality

- Improve the backend prompt and scoring logic.
- Move from one-shot AI scoring to a layered weighted scoring model.
- Add a small JSON calibration database for 10-20 major brands, covering known ESG highlights and controversies.

### P1: Traffic And Retention

- Add a static "red/black list" page that can be regenerated daily.
- Improve source-link presentation and source trust cues.

### P2: Commercialization

- Design a deep report format.
- Explore donation QR codes or affiliate links for sustainable products.

## Known Technical Notes

- `lucide-react` is now listed as a project dependency. Previously it was resolved from a parent `node_modules`, which made the project less portable.
- `npm audit fix` has already updated the safe transitive dependencies. The remaining audit warnings currently require a breaking Next.js major upgrade, so they are intentionally not force-fixed in this baseline pass.
- The project is initialized as a Git repository on the `main` branch, but no commit has been created yet.

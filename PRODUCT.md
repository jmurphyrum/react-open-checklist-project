# Product

## Register

product

## Users

Three overlapping audiences, all equally primary:

- **Collectors / hobbyists** — people who collect physical trading cards (Sports, TCG, Non-Sport) and use the browser to look up sets, check card details, and reference attributes like rookies, autographs, relics, and serial numbers.
- **Data contributors / maintainers** — people who add or validate card and set records to keep the open dataset accurate. Their primary workflow is the validator: paste JSON, confirm it conforms to the versioned schema, then submit. The validation path exists specifically for them.
- **Developers / integrators** — developers building apps, tools, marketplaces, or services that consume the Open Checklist API or schemas. Downstream trading card tools (price trackers, collection managers, deck builders) are a primary consumer category. They use the browser as a reference implementation and the validator as a schema testing surface.

All three share a context of high information density and domain expertise. None of them want the UI to get in their way.

## Product Purpose

Open Checklist is a Cloudflare-hosted trading card checklist browser and API that makes reliable, structured checklist data easier to browse, validate, and integrate. It provides versioned open schemas — for cards (v0.1) and sets (v0.2), stored in R2 — for consistent data contribution across sports, TCG, and non-sport card genres. A contributor-friendly validation path lets community submissions be checked against live schemas before insertion. Success looks like: the data is findable, the schemas are trustworthy, and the tool is clearly the right place to go when someone needs authoritative card or set information.

## Brand Personality

Precise, open, reliable.

Reference: Linear — clean, high-contrast, crisp typography, purposeful layout, no decorative noise. Confidence without flash.

Emotional goal: users should feel like they are using a tool that takes the domain seriously. The card hobby has real depth (parallels, print runs, manufacturer variations, schema versioning); the UI should honor that rather than flatten it.

## Anti-references

- **Sports betting / DFS apps**: no dark-and-neon, no aggressive color hierarchies, no urgency-manufacturing UI patterns. Open Checklist is reference infrastructure, not a live-market product.
- **Card marketplace clutter (eBay, COMC)**: avoid ad-heavy, transaction-first layouts. This is a catalog and validation tool, not a storefront.

## Design Principles

1. **Data is the product** — chrome is infrastructure. Every pixel that isn't serving the data should earn its place.
2. **Three audiences, one front door** — collectors, contributors, and developers each have a primary workflow; the navigation and information architecture should make all three paths obvious without requiring a role selection screen.
3. **Polished without pretense** — Linear-caliber finish: sharp grid, consistent spacing, no gratuitous animation. The quality signals trust in the data, not investor-deck aesthetics.
4. **Open by structure** — the "open" in Open Checklist is concrete, not just posture: versioned schemas (cards v0.1, sets v0.2) served from R2, downloadable data objects, contributor-facing validation before insert. The UI should surface schema versions and data access points visibly — not buried in API docs.
5. **Honor the domain** — sets have seasons, parallels, and print runs; cards have subjects, roles, and attributes with real meaning to collectors. Labels and hierarchy should reflect domain vocabulary, not abstract it away.

## Accessibility & Inclusion

Target WCAG 2.1 AA. No specific known user needs at this time; apply AA as the floor for contrast, keyboard navigation, and screen reader compatibility. Handle reduced-motion thoughtfully whenever animation is introduced.

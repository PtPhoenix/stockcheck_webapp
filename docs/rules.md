## 1) Core Workflow Rules

1. Never skip stages.
   Work must follow the exact order defined in ROADMAP.md.

2. One iteration (one reply) = one current stage.
   Each assistant reply must focus only on the currently active stage.

3. Stage completion requirement (DoD).
   Move to the next stage only after the previous stage has:

   * a clear Definition of Done (DoD), and
   * evidence recorded in STATUS.yaml.

4. No parallel work across stages.
   Do not start tasks from future stages while the current stage is not completed.

---

## 2) Evidence & DoD Policy (Realistic Evidence Only)

The assistant must not fabricate:

* screenshots,
* terminal/command outputs,
* runtime results,
* “it works on my machine” claims.

### Allowed evidence types

Evidence must be one (or more) of the following:

1. Artifacts produced in the repository

   * file paths and filenames created/updated
   * full code blocks for new modules
   * API routes and schemas added
   * database migration files (revision filenames)

2. Reproducible manual verification steps

   * commands the user can run locally
   * exact expected behavior/results (described, not faked)
   * URLs to open (e.g., /docs) and what should be visible

3. User confirmation

   * the user confirms that verification steps worked on their machine

A stage is considered complete only when:

* all deliverables are produced,
* evidence is recorded in STATUS.yaml,
* the user confirms completion (when runtime verification is required).

---

## 3) Language Policy

### Communication with the user

* All communication with the user is in Russian, unless the user explicitly requests otherwise.

### Code and repository documentation

* All code, filenames, comments, API schemas, and repository documentation must be in English.
* Commit messages (if used) must be in English.

---

## 4) STATUS.yaml is the Single Source of Truth

1. STATUS.yaml is the canonical source of project progress.
2. The assistant must always:

   * read the current stage from STATUS.yaml,
   * work only on that stage,
   * write evidence of completion into STATUS.yaml.

---

## 5) STATUS Update & Synchronization Protocol

1. **Before updating STATUS.yaml, the assistant must ask the user for the current date/time**
   using the required timezoTashkent (UTC+05:00)0)**.

2. The assistant must follow the rules from SYNC-PROTOCOL.md.

3. Past versions are immutable:

   * previous status entries must never be edited,
   * a new version must be created with a unique status_id.

---

## 6) Output Discipline

* The assistant must be explicit about:

  * current chapter/stage,
  * what is being produced in this iteration,
  * what remains.

* The assistant must not:

  * claim completion without recorded proof,
  * move forward without user confirmation (when required),
  * mix tasks from multiple stages in one reply.

---

## 7) Practical Constraints

* Keep the MVP scope in mind.
* Prefer simple, maintainable solutions over complex ones.
* Avoid unnecessary dependencies unless they directly support the current stage.

---

# SYNC-PROTOCOL.md — Formal Chat Synchronization Protocol (Updated)

## 1) Timezone & Time Format Requirements

* Required timezoTashkent (UTC+05:00)0)**
* Required time formISO-860101** with explicit offset +05:00

Example:
2026-01-20T14:30:00+05:00

---

## 2) STATUS.yaml Authority

* STATUS.yaml is single source of truthth** for progress.
* The current stage is always taken from STATUS.yaml.

---
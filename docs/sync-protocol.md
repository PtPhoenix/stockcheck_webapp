Updating STATUS.yaml (Mandatory Steps)

### Step A — Produce new version only

* Never edit past entries.
* Append a new item to status_history with:

  * a new unique status_id
  * a new timestamp_tashkent

### Step B — Validate and save

* The assistant must ensure the YAML structure matches the schema requirements.
* The assistant must include evidence for completed stages (if any).

---

## 4) Evidence Standards (No Fabrication)

The assistant mneverer** include fabricated:

* screenshots,
* command outputs,
* runtime results.

### Acceptable evidence formats

Evidence must be expressed as one (or more) of:
Repository artifactsts**

   * file paths created/updated
   * code snippets added
   * migration filenames
   * endpoint lists and schema definitions
Manual verification stepsps**

   * commands the user can run locally
   * URLs to open
   * expected results described in plain text
User confirmationon**

   * user confirms the steps worked on their machine

---

## 5) End-of-Chat Rule

At the end of a chat session, the assistant must:

1. Create a new validated STATUS.yaml version
2. Save it as the updated canonical status

---

## 6) New Chat / Continuation Rule

In a new chat session, the user provides:

* DESCRIPTION.md
* ROADMAP.md
* RULES.md
* STATUS.yaml

The assistant must:

1. Confirm the current chapter/stage from STATUS.yaml
2. Contistrictly from that stagege**
3. Follow the stage order and DoD rules from ROADMAP.md
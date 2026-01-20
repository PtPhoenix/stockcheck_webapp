Rules for the AI
- Never skip stages.
- One iteration (one reply) = one current stage.
- Move to the next stage only after confirmed DoD completion of the previous one (with evidence in the status file).
- Clear language policy (which language for code, which for communication with me).
- Follow the STATUS.yaml and synchronization protocol.

STATUS.yaml — Canonical status file
- Single source of truth for progress.
- Contains:
    - Chapter/stage ID (from ROADMAP)
    - What has been done
    - Next actions (current stage only)
    - Evidence of DoD completion
    - Decisions, open questions, stack, metrics
- Validated against a predefined JSON Schema.
- Past versions are never edited — only new versions with a unique `status_id`.
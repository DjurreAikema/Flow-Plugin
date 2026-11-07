# Step 01: Review page and server

Date: 2 November 2026

## Goal
The plugin has a review page and a local server that shows the review items and writes the results to a file.

## Context to read
- `docs/tasks/0004-review-page/README.md`
- `docs/workflow/CONFIG.md`, project rules 1 and 2
- `plugins/flow/reference/WORKFLOW.md` section 8
- `plugins/flow/reference/WRITING_STYLE.md`
- `tools/verify.sh`

## Files touched
- `plugins/flow/templates/review-page.html` (new)
- `plugins/flow/scripts/review_server.py` (new)
- `tools/verify.sh` (changed)

## Work
1. Write `plugins/flow/templates/review-page.html`. It is one self-contained file with no external resource. It reads the items from a JSON block `<script id="items" type="application/json">`. The block holds a placeholder that the server or the agent replaces. Each item shows its step, its text, its "Why" line and ⏸️ when it is blocking. Each item has the choices "Passed" and "Failed", and a comment box. A failed item needs a comment. The button "Finish" is active when every item has a result.
2. In the page: when the page has a server URL with a token, "Finish" posts the results as JSON to the server. Otherwise "Finish" downloads `checklist-results.json`. After "Finish", the page tells the developer to go back to the agent.
3. Write `plugins/flow/scripts/review_server.py`. It uses Python 3 and the standard library only. Usage: `python3 review_server.py <items file> <results file>`. It listens on `127.0.0.1` with a random port and a random token. It serves the page with the items filled in. It accepts one post with the right token, writes the results file, and exits.
4. In the server: open the browser with the module `webbrowser`. When no browser opens, print `no-browser` and exit with code 3. When the server cannot start, exit with code 2. Print the URL when the browser opens, so the developer can open it by hand.
5. In the server: add the command `python3 review_server.py wait <results file> <seconds>`. It waits until the results file exists, at most the given seconds. It exits with code 0 when the file exists, and 1 otherwise.
6. In `tools/verify.sh`: add check 5. Run `python3 -m py_compile` on every `.py` file in `plugins/flow/scripts/`. When `python3` is missing, show `⚠️ python (python3 not installed)`. Name the check in the comment at the top.

## Review checklist
- [x] Open the review page through the server with 3 sample items, one of them blocking. Judge the layout, the controls and the text.
  Why: The page is new. Its look and its ease of use need a human.
  Checked: 2 November 2026

## Docs to update
none

## Out of scope
- The checklist skill. Step 02 does this.
- A dependency outside the Python standard library.
- Any network address other than `127.0.0.1`.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The items file holds `task` and a list `items`. Each item has `id`, `step`, `stepTitle`, `text`, `why` and `blocking`. The results file holds `task` and a list `results`, with `id`, `step`, `text`, `result` and `comment` per item.
- The server serves the page only at `/<token>`, and accepts the results only at `/<token>/finish`. It checks every result: a known id, `passed` or `failed`, and a reason for each failed item.
- The server writes the results file through a temporary file and a rename, so the wait command never reads a partial file.
- On Linux without `DISPLAY` or `WAYLAND_DISPLAY`, the server reports `no-browser` without a call to `webbrowser`. In such a session `webbrowser` can start a text browser that blocks.
- The server exits with code 4 after a timeout, default 3600 seconds, so a forgotten server does not run forever. The step names only the codes 2 and 3.
- The page escapes `</` in the items, and renders `` `code` `` in the item text. It follows the light and dark mode of the system.
- The agent ran the server with a stand-in browser, and the page in headless Chrome. The tests covered exit codes 2, 3 and 4, a wrong token, and a failed item without a reason. They also covered the post and the download.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | The verify check compiles each script with the Python function `compile()`, not with `python3 -m py_compile` (work item 6, task decision 8). | `py_compile` writes a `__pycache__` folder into the plugin. The check is the same. | none |

#!/usr/bin/env python3
"""Driver of the workflow benchmark.

Runs one setup on one feature in a copy of the sample project, plays the
developer, and writes a result file per run in bench/results/. A setup with
"developer": "haiku" gets its replies from a simulated developer on Haiku,
who answers from the intent card of the feature.
Standard library only. Runs on Windows, macOS and Linux.

Usage:
    python bench/run.py --setup <name> --plugin <folder> [--feature holds]
                        [--runs 3] [--keep] [--dry-run]

Exit codes: 0 all runs done or skipped, 1 a run failed, 2 usage limit.
"""

import argparse
import datetime
import glob
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import threading
import tempfile
import time
import urllib.request

BENCH = os.path.dirname(os.path.abspath(__file__))
RESULTS = os.path.join(BENCH, "results")
CALL_TIMEOUT = 3600
URL_FILE = "browser-url.txt"
# [Verify] Both flags. See bench/README.md.
ISOLATION_FLAGS = ["--setting-sources", "project,local"]
BASE_FLAGS = [
    "--output-format", "json",
    "--model", "opus",
    "--permission-mode", "bypassPermissions",
]
LIMIT_RE = re.compile(
    r"(?i)(usage limit|rate limit|limit reached|reached your .*limit|"
    r"weekly limit|5-hour limit|out of (extra )?usage|quota)"
)
QUESTION_RE = re.compile(r"(?m)^\s*\d+\.\s+(Assumption|Conflict|Blocker):")
GIT_ID = ["-c", "user.name=bench", "-c", "user.email=bench@example.invalid"]
# [Verify] Against the price list: the price of each token kind, relative to input.
TOKEN_WEIGHTS = {"input": 1, "cache_write": 1.25, "cache_read": 0.1, "output": 5}
# The simulated developer: Haiku, no tools, no saved session, no plugin.
DEVELOPER_FLAGS = [
    "--output-format", "json",
    "--model", "haiku",
    "--tools", "",
    "--no-session-persistence",
    "--system-prompt", "You play a software developer. Follow the instructions in the message.",
]
DEVELOPER_PROMPT = """You play the developer who asked an AI coding agent for a feature. Your real intent is on the intent card below. The agent never saw the card. Read the last message of the agent, then write your reply to it.

Rules:
1. Answer only what the message asks. Never mention a fact of the card that the message does not ask about.
2. When the message asks you to pick an option, pick the option that fits the card. Pick option 1 "Build now" when the brief or the plan matches the card.
3. When the message proposes work that the card rules out, say no, in one sentence.
4. When the card does not answer a question, let the agent decide.
5. {finish}
6. Write only the reply, in a few short sentences, as the developer. No preamble.

=== INTENT CARD ===
{intent}
=== LAST MESSAGE OF THE AGENT ===
{message}
"""
FINISH_RULE = {
    True: "When the message waits for nothing from you, because it reports finished work and asks no question, reply with exactly the word DONE.",
    False: "Always write a reply. Never reply DONE.",
}
TEST_RULE_RE = re.compile(r"new\s+Date\(\s*\)|\bDate\.now\(|\bcurrentYear\(")
EXPORT_RE = re.compile(
    r"(?m)^export\s+(?:declare\s+)?(?:default\s+)?(?:abstract\s+)?(?:async\s+)?"
    r"(?:class|function\*?|const|let|var|type|interface|enum)\s+([A-Za-z_$][\w$]*)")
EXPORT_LIST_RE = re.compile(r"(?m)^export\s+(?:type\s+)?\{([^}]*)\}")


class LimitReached(Exception):
    pass


def make_fake_browser(tmp):
    """Write a browser that records its URL. Return its absolute path.

    Python webbrowser takes BROWSER as one executable name, so the path is the
    whole value. The page is never shown. The watcher below plays the reader.
    """
    url_file = os.path.join(tmp, URL_FILE)
    if os.name == "nt":
        path = os.path.join(tmp, "fake-browser.cmd")
        lines = ["@echo off", '<nul set /p "=%~1" > "' + url_file + '"', "exit /b 0"]
        eol = chr(13) + chr(10)
    else:
        path = os.path.join(tmp, "fake-browser.sh")
        lines = ["#!/bin/sh", "printf '%s' " + chr(34) + "$1" + chr(34) + " > '" + url_file + "'", "exit 0"]
        eol = chr(10)
    with open(path, "w", encoding="ascii", newline="") as f:
        f.write(eol.join(lines) + eol)
    if os.name != "nt":
        os.chmod(path, 0o755)
    return path


ITEMS_RE = re.compile(r'<script id="items" type="application/json">(.*?)</script>', re.S)


def post_review(url):
    """Open the review page like a browser, then post "passed" for every item."""
    with urllib.request.urlopen(url, timeout=30) as r:
        html = r.read().decode("utf-8")
    m = ITEMS_RE.search(html)
    if not m:
        raise RuntimeError("no items block in the review page")
    data = json.loads(m.group(1).replace("<\\/", "</"))
    ids = [it["id"] for it in data["items"]]
    body = json.dumps({"results": [{"id": i, "result": "passed", "comment": ""} for i in ids]})
    base = url.split("/", 3)
    req = urllib.request.Request(
        base[0] + "//" + base[2] + data["post"], data=body.encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        r.read()
    return ids


class ReviewWatcher(threading.Thread):
    """Poll for the URL file of the fake browser. Click "Finish" on each page."""

    def __init__(self, tmp):
        super().__init__(daemon=True)
        self.url_file = os.path.join(tmp, URL_FILE)
        self.stop_event = threading.Event()
        self.busy = False
        self.pages = []

    def run(self):
        while not self.stop_event.is_set():
            if os.path.exists(self.url_file):
                self.busy = True
                try:
                    time.sleep(0.2)
                    with open(self.url_file, encoding="utf-8") as f:
                        url = f.read().strip()
                    os.remove(self.url_file)
                    entry = {"url": url}
                    try:
                        entry["item_ids"] = post_review(url)
                    except Exception as e:  # keep the run going, record the cause
                        entry["error"] = str(e)
                    self.pages.append(entry)
                except OSError:
                    pass
                finally:
                    self.busy = False
            self.stop_event.wait(0.3)

    def settle(self, seconds=15):
        """Wait until the watcher has no work left."""
        end = time.time() + seconds
        while time.time() < end and (self.busy or os.path.exists(self.url_file)):
            time.sleep(0.2)


# ---------------------------------------------------------------- helpers

def git(path, *args, check=True):
    """Run git in a folder. Never runs git in the current directory."""
    r = subprocess.run(
        ["git", "-C", path, *args],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    if check and r.returncode != 0:
        raise RuntimeError("git %s failed in %s: %s" % (" ".join(args), path, r.stderr.strip()))
    return r


def rmtree(path):
    def onerror(func, p, _exc):
        os.chmod(p, stat.S_IWRITE)
        func(p)
    shutil.rmtree(path, onerror=onerror)


def read_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write_json(path, data):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def last_line(text, skip_fence=False):
    """The last line of a message. skip_fence drops closing code fences first,
    so the driver reads a 👉 line that the agent put inside a code block, as a
    person does. The workflow figures still count such a message as a violation."""
    lines = [l.strip() for l in (text or "").splitlines() if l.strip()]
    if skip_fence:
        while lines and lines[-1] == "```":
            lines.pop()
    return lines[-1] if lines else ""


def glob_to_regex(pattern):
    out, i = "", 0
    while i < len(pattern):
        if pattern.startswith("**", i):
            out += ".*"
            i += 2
        elif pattern[i] == "*":
            out += "[^/]*"
            i += 1
        elif pattern[i] == "?":
            out += "[^/]"
            i += 1
        else:
            out += re.escape(pattern[i])
            i += 1
    return re.compile("^" + out + "$")


def parse_tap(text):
    """Return (passed, total) from the summary lines of the TAP reporter."""
    def num(name):
        m = re.search(r"(?m)^# %s (\d+)\s*$" % name, text)
        return int(m.group(1)) if m else None
    return num("pass"), num("tests")


def verify_command(sample_config):
    with open(sample_config, encoding="utf-8") as f:
        m = re.search(r"(?m)^- Verify: `([^`]+)`", f.read())
    if not m:
        raise RuntimeError("no verify command in " + sample_config)
    return m.group(1)


TAP_TEST_RE = re.compile(r"(?m)^\s*(not )?ok \d+ - (.*?)(?:\s+#\s.*)?\s*$")


def tap_results(text):
    """Map each test name of the TAP output to True (pass) or False (fail)."""
    out = {}
    for m in TAP_TEST_RE.finditer(text):
        name = m.group(2).replace("\\#", "#")
        out[name] = out.get(name, True) and not m.group(1)
    return out


def run_node_tests(cmd, cwd):
    """Run a node test command with the TAP reporter. Return a figure dict."""
    cmd = cmd.replace("node --test", "node --test --test-reporter=tap", 1)
    r = subprocess.run(
        cmd, cwd=cwd, shell=True, capture_output=True, text=True,
        encoding="utf-8", errors="replace", timeout=600,
    )
    passed, total = parse_tap(r.stdout)
    return {"exit_code": r.returncode, "passed": passed, "total": total,
            "tests": tap_results(r.stdout)}


# ------------------------------------------------------------ preparation

def prepare(setup, feature_dir, feature, tmp):
    """Make the work folder and the origin. Return (work, first commit)."""
    work = os.path.join(tmp, "work")
    shutil.copytree(
        os.path.join(BENCH, "sample"), work,
        ignore=shutil.ignore_patterns("node_modules", ".git"),
    )
    for rel in setup["remove"]:
        p = os.path.join(work, rel)
        if os.path.isdir(p):
            rmtree(p)
        elif os.path.exists(p):
            os.remove(p)
    for item in setup["files"]:
        dest = os.path.join(work, item["path"])
        os.makedirs(os.path.dirname(dest) or work, exist_ok=True)
        if "source" in item:
            shutil.copyfile(os.path.join(BENCH, item["source"]), dest)
        else:
            with open(dest, "w", encoding="utf-8", newline="\n") as f:
                f.write(item["text"] + "\n")
    # Keep LF in the hooks and scripts, whatever the checkout did.
    for root, _dirs, names in os.walk(work):
        for n in names:
            p = os.path.join(root, n)
            if n in ("pre-commit", "pre-push") or n.endswith(".sh"):
                with open(p, "rb") as f:
                    data = f.read()
                if b"\r\n" in data:
                    with open(p, "wb") as f:
                        f.write(data.replace(b"\r\n", b"\n"))

    git(work, "init", "-b", "main")
    git(work, "config", "core.autocrlf", "false")
    git(work, "add", "-A")
    git(work, *GIT_ID, "commit", "-m", "Sample project")
    first = git(work, "rev-parse", "HEAD").stdout.strip()
    origin = os.path.join(tmp, "origin.git")
    subprocess.run(["git", "init", "--bare", "-b", "main", origin],
                   capture_output=True, check=True)
    git(work, "remote", "add", "origin", origin)
    git(work, "push", "origin", "main")

    # Only now switch on the guard. It would refuse the commit and the push.
    git(work, "config", "core.hooksPath", "tools/git-hooks")

    guard = None
    if os.path.isdir(os.path.join(work, "tools", "git-hooks")):
        r = git(work, *GIT_ID, "commit", "--allow-empty", "-m", "guard test", check=False)
        guard = r.returncode != 0
        if r.returncode == 0:
            git(work, "reset", "--hard", first)

    # A feature in the mode "request" starts from a raw request: no brief.
    if feature_mode(feature) == "brief":
        brief_dir = os.path.join(work, "docs", "tasks", "_new")
        os.makedirs(brief_dir, exist_ok=True)
        shutil.copyfile(os.path.join(feature_dir, feature["brief"]),
                        os.path.join(brief_dir, "BRIEF.md"))
    return work, first, guard


def feature_mode(feature):
    return feature.get("mode", "brief")


def read_text(path):
    with open(path, encoding="utf-8") as f:
        return f.read().strip()


def start_message(setup, feature_dir, feature):
    """The first message of the setup. {request} becomes the text of the request."""
    message = setup["start"]
    if "{request}" in message:
        if "request" not in feature:
            raise RuntimeError("setup needs a request, and the feature has none")
        message = message.replace("{request}", read_text(os.path.join(feature_dir, feature["request"])))
    return message


# ------------------------------------------------------------ Claude Code

def is_done(reply):
    return re.sub(r"[^A-Za-z]", "", reply or "").upper() == "DONE"


def next_message(text, setup, last_command, posted=False, developer=None):
    """Return (message, kind). message is None when the run stops.

    developer is the simulated developer: a function (message, may_finish)
    that returns a reply. A setup without the plugin has no marks, so the
    developer reads each message, and replies DONE when it waits for nothing.
    A flow setup gets a reply of the developer on each 👉 line.
    """
    line = last_line(text, skip_fence=True)
    if developer and not setup["plugin"]:
        reply = developer(text, True)
        return (None, "finished") if is_done(reply) or not reply.strip() else (reply, "reply")
    if "\U0001F449" in line:  # 👉
        if developer:
            reply = developer(text, False)
            return (reply, "reply") if reply.strip() else (None, "stop")
        for rule in setup["replies"]:
            if re.search(rule["match"], line):
                return rule["reply"], "reply"
        for rule in setup["replies"]:
            if re.search(rule["match"], text):
                return rule["reply"], "reply"
        return "go", "reply"
    if "👀" in line:  # 👀
        # A review page is open. The watcher clicked "Finish" in this call.
        return ("I clicked Finish.", "reply") if posted else (None, "stop")
    if "▶" in line:  # ▶️
        if last_command and last_command.startswith("/flow:build"):
            return None, "finished"
        m = re.search(r"`(/flow:[^`]+)`", line) or re.search(r"(/flow:\S.*)$", line)
        if m:
            return m.group(1).strip(), "command"
    return None, "stop"


def call_claude(message, plugin, session_id, work, browser):
    claude = shutil.which("claude")
    if not claude:
        raise RuntimeError("claude is not on the PATH")
    cmd = [claude, "-p", *BASE_FLAGS, *ISOLATION_FLAGS]
    if plugin:
        cmd += ["--plugin-dir", plugin]
    if session_id:
        cmd += ["--resume", session_id]
    env = dict(os.environ, BROWSER=browser)
    # The message goes through stdin. A shell on Windows would mangle quotes.
    r = subprocess.run(
        cmd, cwd=work, env=env, input=message, capture_output=True, text=True,
        encoding="utf-8", errors="replace", timeout=CALL_TIMEOUT,
    )
    try:
        return json.loads(r.stdout)
    except ValueError:
        return {"is_error": True, "result": (r.stdout + r.stderr).strip(),
                "session_id": session_id, "_unparsed": True}


def simulated_developer(intent, message, may_finish, cwd):
    """One call of Claude Code on Haiku that answers the agent from the intent card.

    No plugin, no tools, no saved session. cwd is an empty folder, so that no
    CLAUDE.md loads. Return (reply, JSON result).
    """
    claude = shutil.which("claude")
    if not claude:
        raise RuntimeError("claude is not on the PATH")
    prompt = DEVELOPER_PROMPT.format(finish=FINISH_RULE[may_finish], intent=intent,
                                     message=message)
    r = subprocess.run(
        [claude, "-p", *DEVELOPER_FLAGS, *ISOLATION_FLAGS], cwd=cwd, input=prompt,
        capture_output=True, text=True, encoding="utf-8", errors="replace",
        timeout=CALL_TIMEOUT,
    )
    try:
        res = json.loads(r.stdout)
    except ValueError:
        res = {"is_error": True, "result": (r.stdout + r.stderr).strip()}
    text = res.get("result") or ""
    if res.get("is_error"):
        if LIMIT_RE.search(text):
            raise LimitReached(text)
        raise RuntimeError("the simulated developer returned an error: " + text[:300])
    return text.strip(), res


def conversation(setup, plugin, work, log, watcher, browser, first_message, intent=None):
    """Play the developer. Return (results, messages sent, developer results)."""
    results, sent, dev_results = [], [], []
    developer = None
    if setup.get("developer"):
        if setup["developer"] != "haiku":
            raise RuntimeError("unknown developer: " + setup["developer"])
        if intent is None:
            raise RuntimeError("the simulated developer needs the intent card of the feature")
        dev_dir = os.path.join(os.path.dirname(work), "developer")
        os.makedirs(dev_dir, exist_ok=True)

        def developer(text, may_finish):
            reply, res = simulated_developer(intent, text, may_finish, dev_dir)
            dev_results.append(res)
            log.write("=== DEVELOPER ===\n%s\n\n" % reply)
            log.flush()
            return reply

    message, session_id, last_command = first_message, None, None
    while message is not None and len(sent) < setup["max_messages"]:
        sent.append(message)
        if message.startswith("/flow:"):
            last_command = message
            if setup.get("fresh_session"):
                # A new session for each skill. Replies stay in the session.
                session_id = None
        before = len(watcher.pages)
        res = call_claude(message, plugin if setup["plugin"] else None, session_id, work, browser)
        watcher.settle()
        for page in watcher.pages[before:]:
            log.write("=== REVIEW PAGE ===\n%s\n\n" % json.dumps(page))
        results.append(res)
        text = res.get("result") or ""
        log.write("=== SENT %d ===\n%s\n=== RESULT %d ===\n%s\n\n" % (len(sent), message, len(sent), text))
        log.flush()
        if res.get("is_error"):
            if LIMIT_RE.search(text):
                raise LimitReached(text)
            raise RuntimeError("Claude Code returned an error: " + text[:300])
        session_id = res.get("session_id") or session_id
        message, _kind = next_message(text, setup, last_command, len(watcher.pages) > before,
                                      developer)
    return results, sent, dev_results


# ------------------------------------------------------------- the figures

def empty_usage():
    return {"input": 0, "cache_write": 0, "cache_read": 0, "output": 0}


def add_usage(total, model, inp, cw, cr, out):
    u = total.setdefault(model, empty_usage())
    u["input"] += inp or 0
    u["cache_write"] += cw or 0
    u["cache_read"] += cr or 0
    u["output"] += out or 0


def cost_figures(results):
    # With --resume, modelUsage holds the totals of the whole session so far,
    # not of one call. So keep the last modelUsage per session, and add up the
    # sessions. num_turns and duration_ms are per call.
    tokens, turns, duration, last = {}, 0, 0, {}
    for res in results:
        turns += res.get("num_turns") or 0
        duration += res.get("duration_ms") or 0
        if res.get("modelUsage"):
            last[res.get("session_id")] = res["modelUsage"]
    for usage in last.values():
        for model, u in usage.items():
            add_usage(tokens, model, u.get("inputTokens"), u.get("cacheCreationInputTokens"),
                      u.get("cacheReadInputTokens"), u.get("outputTokens"))
    return tokens, turns, duration


def weighted_tokens(tokens):
    """The tokens of all models, each kind times its weight in TOKEN_WEIGHTS."""
    return round(sum(u.get(kind, 0) * w for u in tokens.values()
                     for kind, w in TOKEN_WEIGHTS.items()))


def developer_cost(dev_results):
    """The tokens of the simulated developer. Each call is its own session."""
    tokens = {}
    for res in dev_results:
        for model, u in (res.get("modelUsage") or {}).items():
            add_usage(tokens, model, u.get("inputTokens"), u.get("cacheCreationInputTokens"),
                      u.get("cacheReadInputTokens"), u.get("outputTokens"))
    return {"tokens_by_model": tokens, "calls": len(dev_results),
            "weighted_tokens": weighted_tokens(tokens),
            "duration_ms": sum(r.get("duration_ms") or 0 for r in dev_results)}


def call_figures(results):
    """The raw figures of each call, so that a reader can check the totals."""
    return [{"session_id": r.get("session_id"), "num_turns": r.get("num_turns"),
             "duration_ms": r.get("duration_ms"), "modelUsage": r.get("modelUsage")}
            for r in results]


def read_jsonl(path):
    out = []
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            for line in f:
                try:
                    out.append(json.loads(line))
                except ValueError:
                    pass
    except OSError:
        pass
    return out


def log_usage(entries):
    """Sum the usage of a session log per model. One count per message ID."""
    last = {}
    for e in entries:
        m = e.get("message")
        if e.get("type") == "assistant" and isinstance(m, dict) and m.get("usage"):
            last[m.get("id") or e.get("uuid")] = m
    total = {}
    for m in last.values():
        u = m["usage"]
        add_usage(total, m.get("model", "unknown"), u.get("input_tokens"),
                  u.get("cache_creation_input_tokens"), u.get("cache_read_input_tokens"),
                  u.get("output_tokens"))
    return total


def session_figures(session_ids, tokens):
    """Count step builders in the session logs. Add their tokens when needed."""
    builders, seen = 0, set()
    sub_by_type, found = {}, False
    root = os.path.join(os.path.expanduser("~"), ".claude", "projects")
    for sid in session_ids:
        # [Verify] ~/.claude/projects/<encoded work path>/<session_id>.jsonl.
        # The glob avoids the encoding of the work path.
        for log in glob.glob(os.path.join(root, "*", sid + ".jsonl")):
            found = True
            for e in read_jsonl(log):
                m = e.get("message")
                if e.get("type") != "assistant" or not isinstance(m, dict):
                    continue
                for block in m.get("content") or []:
                    if (isinstance(block, dict) and block.get("type") == "tool_use"
                            and block.get("name") in ("Agent", "Task")
                            and (block.get("input") or {}).get("subagent_type") == "flow:step-builder"
                            and block.get("id") not in seen):
                        seen.add(block.get("id"))
                        builders += 1
            # [Verify] Subagent logs: <session_id>/subagents/agent-*.jsonl.
            sub_dir = os.path.join(os.path.dirname(log), sid, "subagents")
            for sub in glob.glob(os.path.join(sub_dir, "agent-*.jsonl")):
                try:
                    kind = read_json(sub[:-len(".jsonl")] + ".meta.json").get("agentType", "unknown")
                except (OSError, ValueError):
                    kind = "unknown"
                for model, u in log_usage(read_jsonl(sub)).items():
                    add_usage(sub_by_type.setdefault(kind, {}), model, u["input"],
                              u["cache_write"], u["cache_read"], u["output"])
    has_sonnet = any("sonnet" in m.lower() for m in tokens)
    source = "modelUsage"
    if builders and not has_sonnet:
        for per_model in sub_by_type.values():
            for model, u in per_model.items():
                add_usage(tokens, model, u["input"], u["cache_write"], u["cache_read"], u["output"])
        source = "modelUsage+subagent-logs"
    return {
        "session_log_found": found,
        "step_builders": builders,
        "subagent_tokens_by_type": sub_by_type,
        "token_source": source,
    }


def changed_files(work, first):
    names = set()
    names.update(git(work, "diff", "--name-only", first).stdout.split("\n"))
    names.update(git(work, "ls-files", "--others", "--exclude-standard").stdout.split("\n"))
    for b in git(work, "for-each-ref", "--format=%(refname)", "refs/heads").stdout.split():
        names.update(git(work, "diff", "--name-only", first, b).stdout.split("\n"))
    return sorted(n for n in names if n)


def brief_figures(work):
    """Read the brief of the run: where it is, its parts and its Outcome section."""
    pattern = r"docs/tasks/(_archive/)?\d+[^/]*/BRIEF\.md$"
    candidates = sorted(glob.glob(os.path.join(work, "docs", "tasks", "[0-9]*", "BRIEF.md")) +
                        glob.glob(os.path.join(work, "docs", "tasks", "_archive", "[0-9]*", "BRIEF.md")))
    text, where = None, None
    if candidates:
        where = os.path.relpath(candidates[-1], work).replace("\\", "/")
        with open(candidates[-1], encoding="utf-8") as f:
            text = f.read()
    else:
        for b in git(work, "for-each-ref", "--format=%(refname:short)", "refs/heads").stdout.split():
            files = git(work, "ls-tree", "-r", "--name-only", b, "docs/tasks").stdout.split()
            hits = sorted(p for p in files if re.search(pattern, p))
            if hits:
                where = b + ":" + hits[-1]
                text = git(work, "show", b + ":" + hits[-1]).stdout
                break
    if text is None:
        return {"brief_file": None, "archived": False, "parts": None, "outcome": False}
    m = re.search(r"(?ms)^## Parts\s*$(.*?)(?=^## |\Z)", text)
    parts = len(re.findall(r"(?m)^\d+\.\s", m.group(1))) if m else None
    return {
        "brief_file": where,
        "archived": "/_archive/" in "/" + where.split(":")[-1],
        "parts": parts,
        "outcome": bool(re.search(r"(?m)^## Outcome\s*$", text)),
    }


def exported_names(text):
    names = set(EXPORT_RE.findall(text))
    for group in EXPORT_LIST_RE.findall(text):
        for item in group.split(","):
            item = item.strip()
            if item:
                names.add(re.split(r"\s+as\s+", item)[-1].strip())
    return names


def src_exports(work, rev=None):
    """The exported symbols of the .ts files in src/, at a commit or in the work tree."""
    names = set()
    if rev:
        files = git(work, "ls-tree", "-r", "--name-only", rev, "src").stdout.split()
        for p in files:
            if p.endswith(".ts"):
                names |= exported_names(git(work, "show", rev + ":" + p).stdout)
    else:
        for p in glob.glob(os.path.join(work, "src", "**", "*.ts"), recursive=True):
            with open(p, encoding="utf-8", errors="replace") as f:
                names |= exported_names(f.read())
    return names


def test_rule_violations(work, first):
    """Lines that a new or changed test file adds, and that read the real date."""
    bad = []
    diff = git(work, "diff", first, "--", "test").stdout
    current = None
    for line in diff.splitlines():
        if line.startswith("+++ "):
            current = line[6:] if line.startswith("+++ b/") else None
        elif line.startswith("+") and current and TEST_RULE_RE.search(line):
            bad.append("%s: %s" % (current, line[1:].strip()))
    untracked = git(work, "ls-files", "--others", "--exclude-standard", "--", "test").stdout.split("\n")
    for rel in (u for u in untracked if u.endswith(".ts")):
        with open(os.path.join(work, rel), encoding="utf-8", errors="replace") as f:
            for line in f:
                if TEST_RULE_RE.search(line):
                    bad.append("%s: %s" % (rel, line.strip()))
    return bad


def trap_figures(feature, hidden):
    """For each trap: caught when all its hidden tests pass."""
    results = {}
    for h in hidden:
        results.update(h.get("tests") or {})
    traps = []
    for trap in feature.get("traps", []):
        tests = {name: results.get(name, False) for name in trap["tests"]}
        traps.append({"id": trap["id"], "kind": trap["kind"],
                      "caught": all(tests.values()), "tests": tests})
    return traps


def quality_and_workflow(setup, work, first, feature_dir, feature, verify_cmd,
                         texts, apply_reference):
    if apply_reference:
        git(work, "apply", os.path.join(feature_dir, feature["reference"]))
    figures = {"final_branch": git(work, "rev-parse", "--abbrev-ref", "HEAD", check=False).stdout.strip()}

    verify = run_node_tests(verify_cmd, work)
    quality = {"verify_passed": verify["exit_code"] == 0, "verify_figures": verify}

    changed = changed_files(work, first)
    allowed = [glob_to_regex(p) for p in feature["allowed"]]
    quality["files_changed"] = changed
    quality["files_outside_allowed"] = [f for f in changed if not any(a.match(f) for a in allowed)]

    # Before the copy of the hidden tests, which are not the work of the agent.
    violations = test_rule_violations(work, first)
    quality["test_rule_followed"] = not violations
    quality["test_rule_violations"] = violations
    if "exports" in feature:
        extra = src_exports(work) - src_exports(work, first) - set(feature["exports"])
        quality["extra_exports"] = sorted(extra)

    hidden = []
    for src, dest in feature["hidden_tests"].items():
        target = os.path.join(work, dest)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        shutil.copyfile(os.path.join(feature_dir, src), target)
        r = run_node_tests("node --test " + dest, work)
        hidden.append({"file": dest, "passed": r["passed"], "total": r["total"],
                       "exit_code": r["exit_code"], "tests": r["tests"]})
    quality["hidden_tests"] = hidden
    quality["hidden_passed"] = sum(h["passed"] or 0 for h in hidden)
    quality["hidden_total"] = sum(h["total"] or 0 for h in hidden)
    if feature.get("traps"):
        traps = trap_figures(feature, hidden)
        quality["traps"] = traps
        quality["traps_caught"] = sum(t["caught"] for t in traps)
        quality["traps_total"] = len(traps)

    subjects = [s for s in git(work, "log", "--all", "--not", first, "--format=%s").stdout.split("\n") if s]
    workflow = {"commits": len(subjects), "commit_subjects": subjects}
    if setup["plugin"]:
        workflow.update(brief_figures(work))
        bad = [i + 1 for i, t in enumerate(texts)
               if not any(mark in last_line(t) for mark in ("\U0001F449", "▶", "\U0001F440"))]
        workflow["last_line_violations"] = len(bad)
        workflow["last_line_violation_messages"] = bad
    else:
        # A setup without the plugin has no last-line rule.
        workflow["last_line_violations"] = None
    workflow["questions"] = sum(len(QUESTION_RE.findall(t)) for t in texts)
    return figures, quality, workflow


# -------------------------------------------------------------- one run

def run_one(args, setup, feature_dir, feature, run_id, verify_cmd, plugin):
    started = time.time()
    status, reason = "done", None
    tmp = tempfile.mkdtemp(prefix="flow-bench-")
    log_path = os.path.join(RESULTS, run_id + (".dry-run.log" if args.dry_run else ".log"))
    result_path = os.path.join(RESULTS, run_id + (".dry-run.json" if args.dry_run else ".json"))
    results, sent, dev_results = [], [], []
    exit_code = 0
    watcher = ReviewWatcher(tmp)
    try:
        work, first, guard = prepare(setup, feature_dir, feature, tmp)
        first_message = start_message(setup, feature_dir, feature)
        intent = read_text(os.path.join(feature_dir, feature["intent"])) if "intent" in feature else None
        with open(log_path, "w", encoding="utf-8", newline="\n") as log:
            if args.dry_run:
                log.write("dry run: Claude Code skipped\nfirst message:\n%s\n" % first_message)
            else:
                browser = make_fake_browser(tmp)
                watcher.start()
                try:
                    results, sent, dev_results = conversation(
                        setup, plugin, work, log, watcher, browser, first_message, intent)
                except LimitReached as e:
                    status, reason, exit_code = "stopped", "usage limit: " + str(e)[:300], 2
                except subprocess.TimeoutExpired:
                    status, reason, exit_code = "failed", "a call took more than %d seconds" % CALL_TIMEOUT, 1
                except RuntimeError as e:
                    status, reason, exit_code = "failed", str(e), 1
                finally:
                    watcher.stop_event.set()
        record = {
            "run_id": run_id, "status": "dry-run" if args.dry_run and status == "done" else status,
            "setup": args.setup, "feature": args.feature, "mode": feature_mode(feature),
            "developer": setup.get("developer"),
            "date": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
            "plugin_folder": plugin if setup["plugin"] else None,
            "flags": BASE_FLAGS + ISOLATION_FLAGS + (["--plugin-dir", "<plugin folder>"] if setup["plugin"] else []),
            "env": {"BROWSER": "<tmp>/fake-browser"},
            "hooks_refuse_main": guard,
        }
        if setup["plugin"]:
            pc = subprocess.run(["git", "-C", plugin, "rev-parse", "HEAD"], capture_output=True, text=True)
            dirty = subprocess.run(["git", "-C", plugin, "status", "--porcelain", "--", "."],
                                   capture_output=True, text=True)
            record["plugin_commit"] = pc.stdout.strip() or None
            record["plugin_dirty"] = bool(dirty.stdout.strip())
        if reason:
            record["reason"] = reason
        if status == "done":
            texts = [r.get("result") or "" for r in results]
            tokens, turns, duration = cost_figures(results)
            session = {"step_builders": 0, "token_source": "modelUsage"}
            ids = []
            for r in results:
                if r.get("session_id") and r["session_id"] not in ids:
                    ids.append(r["session_id"])
            if results:
                session = session_figures(ids, tokens)
            session["sessions"] = len(ids)
            figures, quality, workflow = quality_and_workflow(
                setup, work, first, feature_dir, feature, verify_cmd, texts,
                args.apply_reference)
            record["messages_sent"] = len(sent)
            workflow["review_pages"] = watcher.pages
            # tokens_by_model holds the agent only. The simulated developer counts apart.
            record["cost"] = {
                "tokens_by_model": tokens, "weighted_tokens": weighted_tokens(tokens),
                "token_weights": TOKEN_WEIGHTS,
                "turns": turns, "duration_ms": duration,
                "wall_seconds": round(time.time() - started, 1), **session,
                "calls": call_figures(results),
            }
            if setup.get("developer"):
                record["cost"]["developer"] = developer_cost(dev_results)
            record["quality"] = quality
            record["workflow"] = workflow
            record.update(figures)
        write_json(result_path, record)
    finally:
        if args.keep:
            print("kept " + tmp)
        else:
            rmtree(tmp)
    print("%s: %s%s" % (run_id, record["status"], " (%s)" % reason if reason else ""))
    return exit_code


def main():
    ap = argparse.ArgumentParser(description="Run one setup of the benchmark.")
    ap.add_argument("--setup", required=True)
    ap.add_argument("--plugin", required=True, help="the plugin folder")
    ap.add_argument("--feature", default="holds")
    ap.add_argument("--runs", type=int, default=3)
    ap.add_argument("--keep", action="store_true", help="keep the temporary folder")
    ap.add_argument("--dry-run", action="store_true", help="skip Claude Code")
    ap.add_argument("--apply-reference", action="store_true",
                    help="with --dry-run: apply the reference patch before the quality checks")
    args = ap.parse_args()

    setups = read_json(os.path.join(BENCH, "setups", "setups.json"))
    if args.setup not in setups:
        sys.exit("unknown setup: %s (known: %s)" % (args.setup, ", ".join(setups)))
    setup = setups[args.setup]
    feature_dir = os.path.join(BENCH, "features", args.feature)
    feature = read_json(os.path.join(feature_dir, "feature.json"))
    plugin = os.path.abspath(args.plugin)
    if setup["plugin"] and not os.path.isdir(plugin):
        sys.exit("plugin folder not found: " + plugin)
    if args.apply_reference and not args.dry_run:
        sys.exit("--apply-reference needs --dry-run")
    verify_cmd = verify_command(os.path.join(BENCH, "sample", "docs", "workflow", "CONFIG.md"))
    os.makedirs(RESULTS, exist_ok=True)

    worst = 0
    for n in range(1, args.runs + 1):
        run_id = "%s-%s-%d" % (args.setup, args.feature, n)
        existing = os.path.join(RESULTS, run_id + ".json")
        if not args.dry_run and os.path.exists(existing):
            try:
                if read_json(existing).get("status") == "done":
                    print("%s: skipped, already done" % run_id)
                    continue
            except ValueError:
                pass
        code = run_one(args, setup, feature_dir, feature, run_id, verify_cmd, plugin)
        if code == 2:
            sys.exit(2)
        worst = max(worst, code)
        if args.dry_run:
            break
    sys.exit(worst)


if __name__ == "__main__":
    main()

# Test plan

Date: <D Month YYYY>

The automated tests of this project. `/flow:discuss` plans the tests of each brief by this plan. `/flow:test-plan` changes it through a pull request. Write "none" in a section that does not apply. Add free text to any section.

## Which code gets tests
Preset: <none | critical | logic>

| Preset | Which code gets a test |
|--------|------------------------|
| `none` | No code. The project has no automated tests. |
| `critical` | Only high-impact logic. Logic is high-impact when it can break without a visible sign, when many parts depend on it, or when a bug ruins the whole result. |
| `logic` | Every function with a branch, a calculation or a rule. Not plain data, wiring or layout. |

Rules per area, folder or kind of code. They change or narrow the preset.

- <area or folder>: <the rule>

## Test types
Each type has a name, a one-line meaning and an optional command. Or none.

- <name>: <one-line meaning>. <`<command>` or none>

## How tests are written
- Location and names: <where the test files are, and how they are named>
- Mocks and fixtures: <what to mock, what to use as a fixture, or none>
- Test data: <where the test data comes from, or none>

## Tested by hand
What a person checks instead of an automated test. `/flow:discuss` turns each item into an item of the human checklist. Or none.

- <what a person checks>

## Old code
A task changes a function that has no test, and the function falls under a rule of this plan.

Policy: <ask the developer | always add a test | never>

## Notes
<free text, or none>

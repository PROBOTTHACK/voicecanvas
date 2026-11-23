# Product Spec

## Overview
VoiceCanvas lets users create and modify visual designs with natural-language voice commands while keeping full manual editing. Philosophy: **design should be expressed, not operated.**

It combines: a flexible editor, conversational interaction, contextual AI, and a deterministic graphics engine.

## Problems solved
- Complex tool/menu/panel interfaces
- Repetitive multi-step manual operations (e.g. 8 steps to make a styled rectangle)
- No contextual references ("make it blue", "that one")
- Design-knowledge barrier (typography, spacing, balance, color)

## Target users
Non-designers (founders, students, creators, small businesses, marketers), content creators (Instagram, thumbnails, banners, posters), and designers wanting faster repetitive ops.

## MVP features
1. Professional workspace 2. Central canvas 3. Shape creation 4. Text creation 5. Selection 6. Move 7. Resize 8. Rotate 9. Fill color 10. Canvas background 11. Layers panel 12. Properties panel 13. Push-to-talk 14. Transcription 15. AI interpretation 16. Structured command execution 17. Context-aware references 18. Undo/redo
(Introduced incrementally per roadmap.)

## Out of scope initially
AI image/background generation, full auto-generated designs, photo/video editing, animation, advanced vector paths, collaboration, teams, template marketplace, asset libraries, brand kits, AI critique, export presets, mobile apps.

## Core interaction flow
Open doc -> press mic -> speak -> release -> speech-to-text -> AI interprets -> structured ops -> validate -> execute on document -> canvas updates -> feedback shown.

## Push-to-talk states
Idle · Listening (waveform) · Transcribing · Processing (subtle loader) · Executing (status) · Completed (success) · Failed (clear error). Must feel native to a design editor, not like a chat app.

## Voice + manual
One underlying document. Voice-created and manual objects are identical. Example: create via voice -> drag manually -> say "make it blue" -> resize manually; all stay in sync.

## Example commands
**Shapes:** "Create a rectangle with width 350 and height 400." "Add a circle with a diameter of 200 pixels."
**Modify:** "Make it blue." "Rotate it by 45 degrees." "Give it rounded corners of 20 pixels." "Change opacity to 50 percent."
**Position:** "Move it to the extreme left." "Move it 50 pixels to the right." "Center it horizontally." "Put it 30 pixels below the heading." "Move it to the top-right corner."
**Text:** "Add a heading." "Write 'The Future of AI'." "Make the text 48 pixels." "Change the font to Inter." "Increase letter spacing."
**Layers:** "Bring the rectangle to the front." "Group these elements." "Duplicate this." "Delete the selected object."
**Contextual:** "Make it blue." "Move that to the right." "Change the heading to white." "Put it behind the other element."
**Future design intelligence (not Sprint 1):** "Make this look more professional." "Improve the spacing." "Give it a luxury aesthetic." The AI must never claim changes it didn't execute.

## Context resolution
- One selected object -> target it
- No selection but a clear recent creation -> may infer it
- Several plausible targets -> ask ("Which object: heading, rectangle, or circle?")
- Explicit target ("the heading") -> resolve by content/label/metadata
- Distinguish selecting a group (acts as unit) vs entering a group (edit children)

## Future design intelligence
Typography (font/weight/spacing/size/line height for "luxurious"), layout (balance, spacing, hierarchy, overlap/off-canvas detection, consistent margins), color suggestions. Only after the core engine is reliable.

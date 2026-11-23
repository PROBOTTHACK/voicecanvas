# Command Registry (allowlist)

Logical names; payload schemas must stay consistent app-wide. **Not all in Sprint 1.**

| Group | Operations |
|---|---|
| Shape | `shape.create` `shape.update` `shape.delete` `shape.duplicate` (rectangle, circle) |
| Text | `text.create` `text.update` `text.change_font` `text.change_weight` `text.change_spacing` |
| Transform | `object.move` `object.resize` `object.rotate` `object.scale` `object.change_opacity` |
| Style | `object.change_fill` `object.change_stroke` `object.change_stroke_width` `object.change_corner_radius` |
| Selection | `selection.select` `selection.deselect` `selection.select_all` |
| Layout | `layout.align` `layout.center` `layout.distribute` `layout.position` |
| Group | `group.create` `group.ungroup` `group.add_object` `group.remove_object` |
| Layer | `layer.bring_to_front` `layer.send_to_back` `layer.move_forward` `layer.move_backward` |
| Document | `document.set_background` `document.resize_canvas` `document.rename` |
| History | `history.undo` `history.redo` |

## Example
```json
{
  "operation": "shape.create",
  "parameters": { "shape": "rectangle", "width": 350, "height": 400, "fill": "#FF0000", "cornerRadius": 16 }
}
```

## Validation
Reject: unknown operation, missing params, negative/zero dimensions, out-of-limit sizes, invalid colors, unsupported types, unknown/deleted object IDs, invalid group relationships. Enforce sane canvas/object limits.

## Errors
Human-readable:
- "The rectangle's width must be greater than zero."
- "I couldn't find an object to move. Select an object or tell me which one you mean."
Never expose stack traces/internals.

## Execution result
Should carry: operation ID, target IDs, status, user-facing message.

## Reliability
Avoid duplicate creation on repeated execution; never corrupt document on failure (execute atomically, roll back on error).

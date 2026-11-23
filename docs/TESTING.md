# Testing Strategy

## Unit
Rectangle/circle/text creation, position calculation, color & dimension validation, selection, deletion, grouping, undo/redo.

## Integration
Zustand <-> document model; document model <-> Fabric adapter; command engine <-> document state; voice <-> AI service; AI output <-> command validation.

## E2E
1. Open editor 2. Create rectangle 3. Select 4. Change color 5. Move 6. Resize 7. Undo resize 8. Confirm canvas state.
Future voice E2E: press mic -> speak -> transcription -> structured op -> execute -> verify visual result.

## Edge cases
Empty canvas · no selection · multiple selection · deleted object references · invalid dimensions/colors · unsupported voice instructions · ambiguous references · repeated commands · rapid manual+voice interaction · canvas resizing · grouped object manipulation.

## Rule
Never claim code is tested unless tests were actually run.

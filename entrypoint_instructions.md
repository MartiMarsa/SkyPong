# entrypoint_instructions.md

> There is the comment // FRONT in the code for the relevant parts

## Flow

- The React Router paths and patterns are established in `index.tsx`
- The needed data for the game to run are established in `GameSessionConfig.ts`
    - We will need to add `playerId` (received from the frontend, once user/session logic is in place)
    - Also, make sure to add `scoreToWin`, so the number of points needed for victory can be configured by the user (not hardcoded)
- **StartPage.tsx is just a placeholder**  
    - It only exists so you can input names and colors quickly for testing during development
    - You are free to discard or ignore it for production: what matters for the real frontend is how the game config is assembled and transmitted
    - The production frontend should build its own screen/dialog/UI to collect and assemble the needed config fields

- To actually start a game:
    1. Build the `GameSessionConfig` object (see `types/GameSessionConfig.ts`)
    2. Use the encoder from `utils/configDecoder.ts` to base64 encode the object  
       - This is required. Do not pass raw JSON.
       - The encoder helps prevent transmission errors and provides a way to share or bookmark prefilled games when needed.
    3. Navigate to `/launch?config=YOUR_ENCODED_CONFIG`
       - Never route directly to `CanvasPage.tsx`; always use the `/launch` route.
       - `GameLauncher.tsx` handles decoding the config and cleanly separates the frontend entry logic from the game logic
    4. The game runs in `CanvasPage.tsx`, which then receives the configuration

- Loading overlays and any session-waiting visuals are already managed in `CanvasPage.tsx` via the `LoadingOverlay.tsx` component.

### GameSessionConfig fields to plan for

- `playerId`:  
  Should be taken from the frontend (from your user/session). For now, use a placeholder or hardcoded value, but production logic should wire up the real user/player.
- `scoreToWin`:  
  Should be settable by the user (not hardcoded). Right now, you can fix a value for testing, but any final frontend needs to present this as a setting or selection to the user.

### Minimal Example Code

```tsx
import { encodeConfig } from "../utils/configDecoder";
import { useNavigate } from "react-router-dom";

function onStartGame() {
  const navigate = useNavigate();
  const config = {
    // TODO: Replace with real playerId when session/user logic is done
    playerId: "<player-id>",
    // TODO: Make this user selectable in your real UI, do not hardcode
    scoreToWin: 5,
    // ...other config fields as needed...
  };
  const encoded = encodeConfig(config);
  navigate(`/launch?config=${encoded}`);
}
```

- Again: `StartPage.tsx` can be discarded—focus on defining the config and the route pattern for launching.

---

## About navigation to `/canvas`

In early development and for quick manual testing, navigation to `/canvas` was sometimes done directly from `StartPage.tsx` using `navigate('/canvas', {state: config})` or similar shortcuts. **This direct routing should never be used in production.**

The correct production flow is:
1. Collect all your config and user settings in the frontend.
2. Encode the config.
3. Route to `/launch?config=...` (never directly to `/canvas`).
4. `GameLauncher.tsx` decodes and validates, then navigates to `/canvas` with the verified config.

`CanvasPage.tsx` should never handle launching new game sessions itself—
- If navigation happens in `CanvasPage.tsx` at all, it is only as a safety fallback (for example, if the config is missing/invalid when the game loads, or when you want to redirect the user back to the menu after the game).

**Always use the `/launch?config=...` entrypoint for starting a new session, and never navigate to `/canvas` directly from your entry UI.**

---

If you need to add new fields, just update `types/GameSessionConfig.ts` and make sure every bit of config-assembly in your entry page is still correct.

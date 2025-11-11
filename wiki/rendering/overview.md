# Rendering Overview
From version 1.16.200 onwards, Minecraft: Bedrock Edition uses a cross-platform, proprietary rendering system named RenderDragon, created in collaboration with Nvidia. Under the hood, it is an abstraction over Mojang's closed-source fork of [`bgfx`](https://github.com/bkaradzic/bgfx). When compiling for different platforms, Mojang enables the correct `bgfx` backends for each. This overview will focus on Windows and the DirectX backends.

## Backends
On the Windows build of the game, Mojang includes 3 different rendering backends. Each backend supports different rendering modes within the game, and the highest backend supported by the system's GPU is enabled.

| Rendering modes  | Simple | Fancy | Vibrant Visuals | Ray Tracing |
|------------------|--------|-------|-----------------|-------------|
| DirectX 11       | ✔️      | ✔️     | ✖️               | ✖️           |
| DirectX 12       | ✔️      | ✔️     | ✔️               | ✖️           |
| DirectX 12 (RTX) | ✔️      | ✔️     | ✔️               | ✔️           |
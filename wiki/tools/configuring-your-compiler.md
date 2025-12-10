# Configuring your compiler

## Picking a Compiler

Depending on what platform(s) you want to target for your Minecraft: Bedrock Edition mod, you'll have to use the correct
compiler and standard template library ([STL](https://en.wikipedia.org/wiki/Standard_Template_Library)) for complete ABI
compatibility for both language features and library features.

The following table serves as a rough guide for which compiler you'll want to use for a given Bedrock platform. It's not
exact, nor complete (for now):

| Platform | Compiler | STL           |
|:---------|:---------|:--------------|
| Windows  | MSVC     | Microsoft STL |
| Android  | GCC      | libstdc++     |
| OSX/iOS  | Clang    | libc++        |

Generally, it should be fine to use the latest releases of both the compiler and STL provided by the table. If any
notable incompatibilities are found in the future, the table will be updated accordingly.

> [!IMPORTANT]
> If you are targeting Windows, the correct runtime library must be configured,
> [continue reading](#setting-the-runtime-library).

## Setting the Runtime Library

When targeting Windows, STL container ABI and C Runtime function compatibility are affected by the runtime library
being used (either **Release** or **Debug**). Since official Minecraft: Bedrock Edition releases are compiled with the
**Release** mode libraries, your mod must use the **Release** mode libraries, even when compiling a debug build.

### CMake

CMake 3.15 introduced the `MSVC_RUNTIME_LIBRARY` property. There are 2 relevant values:

1. `MultiThreaded` - Statically linked, release mode runtime library
2. `MultiThreadedDLL` - Dynamically linked, release mode runtime library

Opting for the dynamically linked runtime library will require users of your mod to have the associated Visual C++
Redistributable downloaded, in exchange for a smaller binary size. The inverse is true of the statically linked runtime
library.

It is often faster to compile against the dynamically linked runtime library, so it's worth considering dynamic linkage
for debug builds and static linkage for release builds. A CMake generator expression can facilitate this behavior:

```CMake
set_property(TARGET MyTarget PROPERTY
    # Statically link in release mode and dynamically link in debug mode
    MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:DLL>")
```

Or if you only want to use one runtime library for all build types:

::: code-group

```CMake [Static]
set_property(TARGET MyTarget PROPERTY
    MSVC_RUNTIME_LIBRARY "MultiThreaded")
```

```CMake [Dynamic]
set_property(TARGET MyTarget PROPERTY
    MSVC_RUNTIME_LIBRARY "MultiThreadedDLL")
```

:::

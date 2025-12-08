# Getting Started with DirectX
In this guide, you will create hooks for various DirectX functions and create a suitable environment for rendering.

## Background
Unlike most games, Minecraft attempts to use the latest version of DirectX supported by your system, instead of sticking
to one version. This **must** be taken into account when hooking DirectX functions to provide the widest level of
support for your mod. Specifics on each backend and their in-game render capabilities are covered
[here](/rendering/overview#backends).

## Requirements
To facilitate hooking DirectX functions, we will be using an updated fork of [kiero](https://github.com/BasedInc/kiero).
kiero handles the boilerplate that is required to get the runtime implementations of DirectX's interfaces, and provides
a type-safe API for looking up functions and creating hooks.

If you have a CMake project using CPM ([setup](/beginners-guide/your-first-hook#cpm)), adding kiero is as follows:

```cmake
CPMAddPackage(
    URI "gh:BasedInc/kiero#269860311ac04b0ee89e68f68bca55abd02a3390" # Dec 2, 2025
    OPTIONS
        "KIERO_INCLUDE_D3D11 ON"
        "KIERO_INCLUDE_D3D12 ON"
)
```

::: info
While the [BasedInc](https://github.com/BasedInc) fork of kiero supports many new quality-of-life features that this
article leverages, it is still under active-development. The commit hash in the previous snippet reflects the version
this article is based on, and usage in future versions may be subject to change.
:::

In addition to kiero, you will need a hooking library. kiero offers an opt-in hooking API that can be integrated with
either `MinHook` or `SafetyHook`, but it must be configured with additional options for your specific setup.
Currently, 3 targets are provided:

| Hook Library | CMake Target              | `kiero::getMethod` | `kiero::bind` |
|--------------|---------------------------|--------------------|---------------|
| N/A          | `kiero::kiero`            | ✔️                 | ✖️            |
| MinHook      | `kiero::kiero-minhook`    | ✔️                 | ✔️            |
| SafetyHook   | `kiero::kiero-safetyhook` | ✔️                 | ✔️            |

For example, using kiero if `MinHook` is already included in an existing project:

```cmake
CPMAddPackage(
    URI # <...>
    OPTIONS
        # <...>
        "KIERO_BUILD_MINHOOK ON" // [!code ++]
        "KIERO_MINHOOK_EXTERNAL ON" # If you already have MinHook included // [!code ++]
)
```

```cmake
# Using Kiero with kiero::bind supported by MinHook
target_link_libraries(<project_name_here> PRIVATE
    kiero::kiero-minhook)
```


## `IDXGISwapChain::Present`
As of Direct3D 10, [`IDXGISwapChain::Present`](https://learn.microsoft.com/en-us/windows/win32/api/dxgi/nf-dxgi-idxgiswapchain-present) is called by a program to display the resulting frame to the user,
after all draw calls are submitted. Since Minecraft on Windows only supports Direct3D 11 and Direct3D 12 as
rendering backends, this is the only function needed to submit draw calls before a frame is displayed.

### Creating the hook
This is the full function prototype for `IDXGISwapChain::Present`:

```cpp
HRESULT IDXGISwapChain::Present(UINT SyncInterval, UINT Flags);
```

We **must** match the ABI of this member-function prototype when creating a callback for this function hook. This
requirement is enforced at compile time by `kiero::bind`:

```cpp
#include <dxgi.h>

using presentFunc = HRESULT(*)(IDXGISwapChain*, UINT, UINT);
static presentFunc oPresent{};
```

Next, create your function callback, making sure to match the function prototype above:

```cpp
static HRESULT hk_Present(IDXGISwapChain* _this, UINT SyncInterval, UINT Flags) {
    // You can interface with DirectX here.

    // When you're done, call the original function to return
    // control to the game and display the resulting frame.
    return oPresent(_this, SyncInterval, Flags);
}
```

Finally, we can initialize kiero and create the hook:

```cpp
#include <kiero.hpp>

void createHooks() {
    if (kiero::init(kiero::RenderType::Auto) != kiero::Status::Success) {
        // Kiero failed to initialize, handle failure case.
        return;
    }

    // Kiero provides IDXGISwapChain for both D3D11 and D3D12.
    // We can use it to hook Present, regardless of the renderer:
    auto status = kiero::bind<&IDXGISwapChain::Present>(&oPresent, &hk_Present);
    assert(status == kiero::Status::Success);
    
    // If you are using kiero without kiero::bind support, the function's
    // addressed can be fetched and passed to your own hook function.
    auto pPresent = kiero::getMethod<&IDXGISwapChain::Present>();
    my_hook_function(pPresent, &oPresent, &hk_Present);
}
```

::: info
Specifics on how to draw content using DirectX is out of scope for this wiki. You can refer to other sources and
tutorials on how to use DirectX. For a renderer-independent approach, it's worth considering a third-party library to do
the heavy lifting. A commonly used one is [Dear ImGui](https://github.com/ocornut/imgui), which provides an interface
for drawing text and geometry across many rendering backends.
:::

Although `kiero::init` has resolved a renderer, it may not actually match the active renderer in use by Minecraft. This
can happen if a fallback to Direct3D 11 occurs, even when the system supports Direct3D 12. We can query for which type
of D3D device is in use via `IDXGISwapChain::GetDevice` in our `Present` hook:

```cpp
#include <d3d11.h>
#include <d3d12.h>
#include <dxgi.h>
#include <Windows.h>

// Required for winrt::com_ptr, which is effectively a smart-pointer type
// for COM (and subsequently DirectX) objects. winrt::com_ptr uses RAII
// to manage the reference count of the underlying object, so we can avoid
// manual calls to AddRef() and Release().
#include <winrt/base.h>

static winrt::com_ptr<ID3D11Device> d3d11Device;
static winrt::com_ptr<ID3D12Device> d3d12Device;

static HRESULT hk_Present(IDXGISwapChain* _this, UINT SyncInterval, UINT Flags) {
    if (SUCCEEDED(_this->GetDevice(IID_PPV_ARGS(d3d12device.put())))) {
        // If this call succeeds, DirectX 12 is being used.
        // Do your DirectX 12-specific initialization work here.
    } else if (SUCCEEDED(_this->GetDevice(IID_PPV_ARGS(d3d11device.put())))) {
        // If this call succeeds, DirectX 11 is being used.
        // Do your DirectX 11-specific initialization work here.
    } else {
        // No device could be retrieved.
    }

    return oPresent(_this, SyncInterval, Flags);
}
```

::: info
You can read more about `winrt::com_ptr` on [Microsoft Learn](https://learn.microsoft.com/en-us/uwp/cpp-ref-for-winrt/com-ptr).
:::

## `IDXGISwapChain::ResizeBuffers`
If you've held any references to the game's back buffer(s) in your `Present` callback, your game will crash when attempting
to resize the window. This is because the game is calling [`IDXGISwapChain::ResizeBuffers`](https://learn.microsoft.com/en-us/windows/win32/api/dxgi/nf-dxgi-idxgiswapchain-resizebuffers), which requires
all references to the swap chain's back buffers to be released before it is called (see [Remarks](https://learn.microsoft.com/en-us/windows/win32/api/dxgi/nf-dxgi-idxgiswapchain-resizebuffers#remarks)).

```cpp
HRESULT IDXGISwapChain::ResizeBuffers(
    UINT        BufferCount,
    UINT        Width,
    UINT        Height,
    DXGI_FORMAT NewFormat,
    UINT        SwapChainFlags
);
```

This issue can be resolved with another function hook:
```cpp
using resizeBuffersFunc = HRESULT(*)(IDXGISwapChain*,
    UINT, UINT, UINT, DXGI_FORMAT, UINT);
static resizeBuffersFunc oResizeBuffers{};

// Possible outstanding reference
static winrt::com_ptr<ID3D11RenderTargetView> backBufferRTV;

static HRESULT hk_ResizeBuffers(
    IDXGISwapChain* _this, UINT BufferCount, UINT Width,
    UINT Height, DXGI_FORMAT NewFormat, UINT SwapChainFlags
) {
    // Release reference(s)
    backBufferRTV = nullptr;

    // Finish resizing
    return oResizeBuffers(_this, BufferCount, Width,
        Height, NewFormat, SwapChainFlags);
}

void createHooks() {
    // ...
    kiero::bind<&IDXGISwapChain::ResizeBuffers>(
        &oResizeBuffers, &hk_ResizeBuffers);
}
```

::: info
As of Minecraft 1.21.120 (the initial GDK release), the [`IDXGISwapChain3::ResizeBuffers1`](https://learn.microsoft.com/en-us/windows/win32/api/dxgi1_4/nf-dxgi1_4-idxgiswapchain3-resizebuffers1)
extension is called instead of `ResizeBuffers`. The prototype and bind target must be updated accordingly.
:::

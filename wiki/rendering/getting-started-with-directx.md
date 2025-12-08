# Getting Started with DirectX
In this guide, you will create hooks for various DirectX functions and create a suitable environment for rendering.

## Background
Unlike most games, Minecraft attempts to use the latest version of DirectX supported by your system, instead of sticking to one version. This **must** be taken into account when hooking DirectX functions to provide the widest level of support for your mod.

You can read more on the matter [here](/rendering/overview#backends).

## Requirements
You will need a hooking library for this, like `MinHook` or `SafetyHook`. `MinHook` will be used in this guide for consistency with previous guides.

To retrieve the addresses of our desired DirectX functions, we will use `kiero`; more specifically, [the modernized fork maintained by BasedInc](https://github.com/BasedInc/kiero).

When including `kiero` in your CMake project, set the options `KIERO_INCLUDE_D3D11` and `KIERO_INCLUDE_D3D12` to enable support for DirectX 11 and 12 respectfully.

## `IDXGISwapChain::Present`
In DirectX, the function [`IDXGISwapChain::Present`](https://learn.microsoft.com/en-us/windows/win32/api/dxgi/nf-dxgi-idxgiswapchain-present) is called by a program after all draw calls are submitted to display the resulting frame to the user. In our case, we can hook this function and submit our own additional draw calls before returning control to the game.

This is the full function prototype for `IDXGISwapChain::Present`:

```cpp
HRESULT IDXGISwapChain::Present(UINT SyncInterval, UINT Flags);
```

We **must** match this function prototype when creating a callback for this function hook.

::: info
Minecraft for Windows uses the extension interface [`IDXGISwapChain3`](https://learn.microsoft.com/en-us/windows/win32/api/dxgi1_4/nn-dxgi1_4-idxgiswapchain3), which was introduced in DXGI 1.4. We will be using this interface in this guide to maintain full ABI compatibility with the game.
:::

### Creating the hook
First, define a function pointer to store the original `Present` function:

```cpp
#include <dxgi1_4.h>

using presentFunc = HRESULT(*)(IDXGISwapChain3*, UINT, UINT);
presentFunc original;
```

Next, create your function callback, making sure to match the function prototype above:

```cpp
#include <dxgi1_4.h>

static HRESULT hk_Present(IDXGISwapChain3* _this, UINT SyncInterval, UINT Flags) {
    // You can interface with DirectX here.

    // When you're done, call the original function to return
    // control to the game and display the resulting frame.
    return original(_this, SyncInterval, Flags);
}
```

Finally, this is the most important part. You **must** create your DirectX hooks in the right order using the right indexes.

Minecraft for Windows attempts to initialize its different DirectX backends in this order:

- DirectX 12 (RTX)
- DirectX 12 (non-RTX)
- DirectX 11

Therefore, it makes sense to initialize `kiero` in the same order when creating our hooks:

```cpp
#include <kiero.hpp>
#include <MinHook.h>

void createHooks() {
    if (kiero::init(kiero::RenderType::D3D12) == kiero::Status::Success) {
        // Present lives at index 140 for DirectX 12.
        auto pPresent = reinterpret_cast<void*>(kiero::getMethodsTable()[140]);

        // Create a hook using your preferred hooking library:
        MH_CreateHook(pPresent, &hk_Present, &original);
        MH_EnableHook(pPresent);

        // Alternatively, you can use kiero::bind to do the above
        // in one line, given you're using MinHook and both
        // KIERO_USE_MINHOOK and KIERO_MINHOOK_EXTERNAL are set:
        kiero::bind(140, reinterpret_cast<void**>(&original), hk_present);

        return;
    }

    if (kiero::init(kiero::RenderType::D3D11) == kiero::Status::Success) {
        // Present lives at index 8 for DirectX 11.
        auto pPresent = reinterpret_cast<void*>(kiero::getMethodsTable()[8]);

        // Hooking the function looks exactly like the above:
        MH_CreateHook(pPresent, &hk_Present, &original);
        MH_EnableHook(pPresent);

        // Using kiero::bind:
        kiero::bind(8, reinterpret_cast<void**>(&original), hk_present);

        return;
    }

    // If your code reaches this point, kiero failed to initialize
    // both rendering backends. This should not happen in most cases.
    // Handle a failure case for both backends here.
}
```

You can now issue your own draw calls to the game.

::: info
We will **not** cover how to draw content in DirectX, as this is out of scope for this wiki.
You can refer to other sources and tutorials on how to use DirectX.
:::

### Determining what DirectX version is being used
Since we are pointing our two hooks to the same callback function, we need a way to determine what DirectX version is being used.

The easiest way to do this is to try and **obtain a reference to the correct device** used in each version, in the same order as above. Edit your callback function to implement this functionality, like so:

```cpp
#include <d3d11.h>
#include <d3d12.h>
#include <dxgi1_4.h>
#include <Windows.h>

// It is recommended you use winrt::com_ptr to hold references to DirectX objects.
#include <winrt/base.h>

winrt::com_ptr<ID3D11Device> d3d11Device;
winrt::com_ptr<ID3D12Device> d3d12Device;

static HRESULT hk_Present(IDXGISwapChain3* _this, UINT SyncInterval, UINT Flags) {
    if (SUCCEEDED(_this->GetDevice(IID_PPV_ARGS(d3d12device.put())))) {
        // If this call succeeds, DirectX 12 is being used.
        // Do your DirectX 12-specific initialization work here.
    } else if (SUCCEEDED(_this->GetDevice(IID_PPV_ARGS(d3d11device.put())))) {
        // If this call succeeds, DirectX 11 is being used.
        // Do your DirectX 11-specific initialization work here.
    } else {
        // No device could be retrieved.
    }

    return original(_this, SyncInterval, Flags);
}
```

::: info
You can read more about `winrt::com_ptr` on [Microsoft Learn](https://learn.microsoft.com/en-us/uwp/cpp-ref-for-winrt/com-ptr).
:::

## `IDXGISwapChain::ResizeBuffers`
If you've obtained a reference to the game's back buffer in your `Present` callback, your game will crash when attempting to resize the window. This is because the game is calling [`IDXGISwapChain::ResizeBuffers`](https://learn.microsoft.com/en-us/windows/win32/api/dxgi/nf-dxgi-idxgiswapchain-resizebuffers).

In DirectX, all references to the swap chain **must** be released before calling `IDXGISwapChain::ResizeBuffers` (see [Remarks](https://learn.microsoft.com/en-us/windows/win32/api/dxgi/nf-dxgi-idxgiswapchain-resizebuffers#remarks)). You must release your own references to to the back buffer before the game calls this function.

This can be done by hooking `IDXGISwapChain::ResizeBuffers`.

```cpp
HRESULT IDXGISwapChain::ResizeBuffers(UINT BufferCount, UINT Width, UINT Height, DXGI_FORMAT NewFormat, UINT SwapChainFlags);
```

### Creating the hook
As always, define your original function pointer:

```cpp
#include <dxgi1_4.h>

using resizeBuffersFunc = HRESULT(*)(IDXGISwapChain3*, UINT, UINT, UINT, DXGI_FORMAT, UINT);
resizeBuffersFunc original;
```

Create your callback function:

```cpp
#include <dxgi1_4.h>

static HRESULT hk_ResizeBuffers(IDXGISwapChain3* _this, UINT BufferCount, UINT Width, UINT Height, DXGI_FORMAT NewFormat, UINT SwapChainFlags) {
    // Release your references to the back buffer here.

    // Finish resizing:
    return original(_this, BufferCount, Width, Height, NewFormat, SwapChainFlags);
}
```

And finally, place the hook:

```cpp
#include <kiero.hpp>
#include <MinHook.h>

void createHooks() {
    if (kiero::init(kiero::RenderType::D3D12) == kiero::Status::Success) {
        // ResizeBuffers lives at index 145 for DirectX 12.
        auto pResizeBuffers = reinterpret_cast<void*>(kiero::getMethodsTable()[145]);

        // Using MinHook:
        MH_CreateHook(pResizeBuffers, &hk_ResizeBuffers, &original);
        MH_EnableHook(pResizeBuffers);

        // Using kiero::bind:
        kiero::bind(145, reinterpret_cast<void**>(&original), hk_ResizeBuffers);

        return;
    }

    if (kiero::init(kiero::RenderType::D3D11) == kiero::Status::Success) {
        // ResizeBuffers lives at index 13 for DirectX 11.
        auto pResizeBuffers = reinterpret_cast<void*>(kiero::getMethodsTable()[13]);

        // Using MinHook:
        MH_CreateHook(pResizeBuffers, &hk_ResizeBuffers, &original);
        MH_EnableHook(pResizeBuffers);

        // Using kiero::bind:
        kiero::bind(13, reinterpret_cast<void**>(&original), hk_ResizeBuffers);

        return;
    }

    // Handle a failure case for both backends here.
}
```

If you've managed your DirectX resources well, the game should no longer crash when resizing.
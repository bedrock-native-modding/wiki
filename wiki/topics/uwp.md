# UWP
Before 1.21.120, Minecraft was built with [UWP](https://learn.microsoft.com/en-us/windows/uwp/), which was Microsoft's attempt at unifying projects built for desktop Windows, Xbox, and Windows Phone under one platform. UWP is considered to be a deprecated platform (since October 2021), and was not ideal for developing games. These are possible reasons as to why Mojang decided to move the game to [GDK](/topics/gdk).

## Key differences
Compared to a regular Win32 app, UWP apps:
- run in a sandbox, and cannot access files outside of their application data directories by default
- use WinRT exclusively instead of the regular Win32 APIs

When injecting your mod into UWP builds of the game, it's important that the DLL file has the `ALL_APPLICATION_PACKAGES` permission so the game can access its contents. This is why we recommend [Fate Injector](https://github.com/fligger/FateInjector/releases), as it is specifically designed for the UWP builds and applies this permission before injecting.

In addition, the WinRT APIs should be preferred over their Win32 counterparts, as most do not work inside of a UWP app. For example, setting the window title is much different within UWP:

```cpp
// Win32
#include <Windows.h>

HWND handle = FindWindow(nullptr, "Minecraft");
SetWindowText(handle, "My window title");

// WinRT
#include <winrt/windows.ui.viewmanagement.h>
using namespace Windows::UI::ViewManagement;

ApplicationView::GetForCurrentView().Title(title);
```

::: tip
Most WinRT functions must be ran on the main thread:
```cpp
#include <winrt/windows.applicationmodel.core.h>
#include <winrt/windows.ui.core.h>
using namespace Windows::ApplicationModel::Core;
using namespace Windows::UI::Core;

CoreApplication::MainView().CoreWindow().Dispatcher().RunAsync(
    CoreDispatcherPriority::Normal, []{ ... }
);
```
:::
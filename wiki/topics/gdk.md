# GDK
In 1.21.120, Mojang started building Minecraft with GDK, a [game development kit from Microsoft](https://learn.microsoft.com/en-us/gaming/gdk/) that replaces [UWP](/topics/uwp).

Because Minecraft is no longer a UWP app, that means a few things:

- The game is no longer sandboxed, meaning all Windows APIs can now work in your DLLs as expected.
- WinRT APIs bound to the ApplicationView will no longer work.

## Extracting the Executable File
For unknown reasons, GDK apps have their main executable files encrypted at-rest. You also can't copy the file.
This makes it more difficult to extract the executable for static analysis, but fortunately the protection is pretty easy to get around.

To extract the decrypted executable, use this PowerShell command (replace `User` with your username):

```ps
Invoke-CommandInDesktopPackage -PackageFamilyName "MICROSOFT.MINECRAFTUWP_8wekyb3d8bbwe" -AppId "Game" -Command "cmd.exe" -Args "/C copy `"C:\XboxGames\Minecraft for Windows\Content\Minecraft.Windows.exe`" `"C:\Users\User\Desktop\Minecraft.Windows.exe`""
```
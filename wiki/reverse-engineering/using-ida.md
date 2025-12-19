# Using IDA

> [!TIP]
> For a more in depth write-up of the basic usage of IDA, we recommend you read the official Hex-Rays article on this
> topic, this can be found [here](https://docs.hex-rays.com/getting-started/basic-usage).

[Hex-Rays IDA](https://hex-rays.com/ida-pro) is a powerful disassembler and reverse engineering environment, used by many in the Bedrock Native 
Modding community for static analysis. This article will cover how to set up your IDA environment for 
MCBE.

> [!NOTE]
> This wiki assumes you are on [IDA Pro 9.2](https://docs.hex-rays.com/release-notes/9_2), the latest as of writing. 
> It is not guaranteed that certain features or plugins used in this wiki support other versions of IDA.
> [IDA Free](https://hex-rays.com/ida-free) is a viable alternative that supports disassembly and decompilation of
> x86/x64 binaries.

## Running IDA
When you run IDA, an **IDA Quickstart** window will open.

In this dialog, there are four areas of interest:
- **New** - This will ask you to select a file for loading.
- **Go** - This will bring you to the main IDA view, in a dormant state.
- **Previous** - This will load the previously loaded file.
- **Recent files box** - This will display your recently opened files for quick access.

Here, you can just press **Go**.

## Loading Minecraft into IDA

[FloppyDolphin57](https://github.com/FloppyDolphin57) kindly provides pre-analyzed Minecraft binaries for most Minecraft Bedrock versions in the form of 
packed IDA databases (i64 or idb files). These databases can be downloaded 
[here](https://www.mediafire.com/folder/ammda8wfvbw9x/The_Flopper_Databases).

Most versions include a Windows Client, Windows Server, and Linux Server database. Server versions prior to 1.21.2
shipped with debug symbols, and are useful for cross-referencing code against even the latest client versions.

Once you have downloaded and extracted the client version of your choice, you can simply **drag and drop the i64 file
into your IDA window** to load it.

If you are using a newer version of IDA than the database was created with, IDA will prompt you to upgrade to the latest
supported format. This is a mandatory step and may take a while, but it only has to be done once. Once the upgrade is
complete, it's recommended to immediately save the database to avoid having to do so again, should the database be
improperly saved.

Alternatively, you can manually analyze Minecraft by dragging and dropping the `Minecraft.Windows.exe` file from your
Minecraft install into IDA. If you are analyzing a GDK version, the executable must be
[extracted](/platforms/gdk#extracting-the-executable-file) first. This process **will** take multiple hours.

> [!NOTE]
> IDA may seem to freeze when loading a database or during general use. Don't worry, as IDA is likely working in the background.

At this point, Minecraft should be loaded into IDA. You can now start reversing.

> [!TIP]
> The database file will be available within the quickstart menu after opening it, along with other recently opened files.
> You can now double-click its entry to load the database.


## Plugins
IDA supports [plugins](https://docs.hex-rays.com/user-guide/plugins) to extend its capability. In the context of reverse engineering, this can be used to
automate many tasks which are otherwise tedious and/or monotonous.

A plugin can either come as an IDAPython script or a native binary, and may be installed by copying their respective
file (`.py` or `.dll`) into the `plugins` subdirectory in IDA's installation directory.

> [!WARNING]
> IDA plugins can contain malware. Only install plugins from sources you trust.

For efficiently creating [signatures](/beginners-guide/introduction#what-s-a-signature), it's recommended to use a
plugin such as [A200K's SigMaker plugin](https://github.com/A200K/IDA-Pro-SigMaker) (Usage provided in the repository's
README).

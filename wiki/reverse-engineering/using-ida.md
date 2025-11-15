# Using IDA

[Hex-ray's IDA](https://hex-rays.com/ida-pro) is a powerful disassembler and reverse engineering environment, used by many in the Bedrock Native 
Modding community for static analysis. This article will cover how to set up your IDA environment for 
MCBE and the basics of IDA.

> [!NOTE]
> This wiki assumes you are on [IDA Pro 9.2](https://docs.hex-rays.com/release-notes/9_2), the latest as of writing. 
> It is not guaranteed that certain features or plugins used in this wiki support other versions of IDA.

## Plugins
IDA implements support for [Plugins](https://docs.hex-rays.com/user-guide/plugins) that extend IDA's capability.
To easily create [`Signatures`](/beginners-guide/introduction#what-s-a-signature) we suggest you install a plugin to do
this for you, such as [A200K's SigMaker plugin](https://github.com/A200K/IDA-Pro-SigMaker) 
(Usage provided in the repository's README).

Plugins can be installed by dragging and dropping a plugin into `/your-ida-install-dir/plugins/`.

> [!WARNING]
> IDA plugins can contain malware, be careful when installing IDA plugins to not risk a virus.

## Running IDA
When you load IDA an `IDA Quickstart` window will be shown.

In this dialog, you can choose to either:
- Select New - This will ask you to select a file to load into IDA.
- Select Go - This will bring you to the main IDA view in a dormant state.
- Select Previous - This will load the previously opened file in IDA.
- Select a recently opened file.

Here you can just press `Go`.

## Loading Minecraft into IDA

`FloppyDolphin57` kindly provides pre analyzed Minecraft binaries for most Minecraft bedrock versions in the form of 
packed IDA databases (i64 or idb files), these can be downloaded 
[here](https://www.mediafire.com/folder/ammda8wfvbw9x/The_Flopper_Databases).

For most versions, Client and Windows/Linux server databases are offered. The server databases (beyond 1.21.2)
will most likely not be useful to you, so you can ignore these for now and download the client database only.

Once you have downloaded and extracted the client version of your choice, you can 
simply drag and drop the i64 file into your IDA window to load it. IDA may ask you if you want to upgrade the format of 
the database to what your IDA version supports. This may take a while for some users, but you will only have to do this 
once.

Alternatively, you can manually analyze Minecraft by dragging and dropping the `Minecraft.Windows.exe` file from your
Minecraft install into IDA.

> [!NOTE]
> IDA may seem to freeze when loading a database or during general use. Don't worry as IDA is most likely silently
> working in the background.

Great you have loaded Minecraft in IDA! You can now get to know the IDA environment.

> [!TIP]
> The database file will now be available within the quickstart menu, along with other recently opened files, you can 
> now double-click its entry to load the database.






















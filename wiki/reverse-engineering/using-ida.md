# Using IDA

[Hex-ray's IDA](https://hex-rays.com/ida-pro) is a powerful disassembler and reverse engineering environment, used for 
static analysis in the Bedrock Native Modding community. This article will cover how to setup your IDA environment for 
MCBE and the basics of IDA.

> [!NOTE]
> This wiki assumes you are on [IDA Pro 9.2](https://docs.hex-rays.com/release-notes/9_2), the latest as of writing. 
> It is not guaranteed that certain features or plugins used in this wiki support other versions of IDA.

## Plugins
IDA implements support for [Plugins](https://docs.hex-rays.com/user-guide/plugins) that extend IDA's capability.
To easily create [`Signatures`](/beginners-guide/introduction#what-s-a-signature) we suggest you install a plugin to do
this for you, such as [A200K's SigMaker plugin](https://github.com/A200K/IDA-Pro-SigMaker) 
(Usage provided in the repository's README).

Plugins can be installed by simply dragging and dropping a plugin into `/your-ida-install-dir/plugins/`.

> [!WARNING]
> IDA plugins can and may contain malware, thus be weary when using IDA plugins to not compromise yourself.

## Using IDA for the first time
When you load IDA an `IDA Quickstart` window will be shown.

![img.png](/reverse-engineering/using-ida/ida-quickstart.png)

Click go and you will be taken to the main IDA view, this is where you will be reversing Minecraft Bedrock.

## Loading Minecraft into IDA

`FloppyDolphin57` kindly provides pre analyzed Minecraft binaries for most Minecraft bedrock versions in the form of 
packed IDA databases (i64 or idb files) these can be downloaded 
[here](https://www.mediafire.com/folder/ammda8wfvbw9x/The_Flopper_Databases).

For most versions, Client and Windows/Linux server databases are offered. The server databases (beyond 1.21.2)
will most likely not be useful to you, so you can ignore these for now and download the Client database only.

![img.png](/reverse-engineering/using-ida/floppers-databases.png)

> [!NOTE]
> Alternatively, you can manually analyze Minecraft by dragging and dropping the `Minecraft.Windows.exe` file from your
> minecraft install directory into IDA. However, it isn't recommended you do this unless requires.

Once you have downloaded and extracted the client version of your choice, you can 
simply drag and drop the i64 file into your IDA window to load it.

IDA may ask you if you want to upgrade the format of the database to what your IDA version supports.
This may take a while for some users, but you will only have to do this once.
![img.png](/reverse-engineering/using-ida/upgrade.png)

IDA may seem to freeze when loading a database or during general use. Don't worry as IDA is most likely silently
working in the background.

Great you have loaded Minecraft in IDA! You can now get to know the IDA environment.

![img.png](/reverse-engineering/using-ida/loaded.png)

> [!TIP]
> The database file you loaded will now be available within the quickstart menu's list of recently loaded files, you can
> now double click it's entry to load the database easier.






















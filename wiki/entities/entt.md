---
outline: [2, 3]
---

# EnTT

## Introduction

[EnTT](https://github.com/skypjack/entt) is the [data-oriented](https://en.wikipedia.org/wiki/Data-oriented_design)
entity component system (ECS) used by Minecraft: Bedrock Edition. It is used to store common data for entities, such
as position and collision boxes, in discrete structs referred to as components.

With each version release, more pieces of `Actor` data are moved from class members to dedicated components;
fortunately, EnTT makes it possible to respond quickly to these changes and maintain up-to-date Minecraft version
compatibility.

For more information on EnTT, check out the highly informative and comprehensive
[wiki](https://github.com/skypjack/entt/wiki) written by its [maintainer](https://github.com/skypjack).

## Picking the Version

The specific version of EnTT that is required for your Minecraft version will vary:

| MC:BE Release     | EnTT Tag  | EnTT Commit Hash                           |
|:------------------|:----------|:-------------------------------------------|
| `1.21.90+`        | N/A       | `fe8d7d78c4823e8a66a050bf86f5c6318cf76ce7` |     
| `1.21.60-1.21.8x` | N/A       | `8e6bbc4a6c7182a0d8c1c9b46ebe5858585e12d9` |     
| `1.21.0-1.21.5x`  | N/A       | `f931687ff04d435871ac9664bb299f71f2a8fafc` |
| `1.20.70-1.20.8x` | `v3.13.1` | `2909e7ab1f1e73a36f778319070695611e3fa47b` |
| `1.20.50-1.20.6x` | N/A       | `62a13526c989f14eff348c28c061542ac7a16d45` |
| `1.20.4x`         | N/A       | `717897052477515260bde3fd21fe987662666621` |

## Including EnTT

*This guide only addresses including EnTT for CMake based projects.*

The CMake [FetchContent](https://cmake.org/cmake/help/latest/module/FetchContent.html) module can be used to download
and include EnTT's CMake project from a git commit hash or tag:
```CMake
include(FetchContent)

FetchContent_Declare(
  EnTT
  GIT_REPOSITORY https://github.com/skypjack/entt.git
  GIT_TAG        2909e7ab1f1e73a36f778319070695611e3fa47b # v3.13.1
)

FetchContent_MakeAvailable(EnTT)
target_link_libraries(MyTarget PRIVATE EnTT::EnTT)
```

Alternatively, if a package repository is configured in your environment, `find_package` can be used as a less verbose
option. However, only official releases that are published to the repository will be available, not necessarily specific
commits.
```CMake
find_package(EnTT 3.13.1 CONFIG REQUIRED)
target_link_libraries(MyTarget PRIVATE EnTT::EnTT)
```

## Configuration

Mojang has configured EnTT in multiple ways to suit the needs of Minecraft: Bedrock Edition. In order for your mod to
have binary compatibility with Minecraft and avoid runtime errors, the configuration of EnTT must match exactly.

The first step is to define a custom entity identifier type:

```C++
struct EntityId {
    std::uint32_t rawId;

    [[nodiscard]] constexpr bool operator==(const EntityId& other) const = default;

    [[nodiscard]] constexpr operator std::uint32_t() const {
        return this->rawId;
    }
};
```

In order to use the custom identifier type with EnTT, an `entt::entt_traits` specialization must be defined (All the
numeric values below are specific to Mojang's specialization of EnTT and were extracted through reverse engineering):

```C++
struct EntityIdTraits {
    using value_type = EntityId;

    using entity_type = std::uint32_t;
    using version_type = std::uint16_t;

    static constexpr entity_type entity_mask = 0x3FFFF; // lower 18 bits of raw id
    static constexpr entity_type version_mask = 0x3FFF; // upper 14 bits of raw id
};
```
```C++
template<>
struct entt::entt_traits<EntityId> : entt::basic_entt_traits<EntityIdTraits> {
    static constexpr std::size_t page_size = 2048;
};
```

Next, component storage must be configured. The method demonstrated below is done by creating a base class that all
components will be derived from, and then specializing `entt::component_traits` for derivatives of that base class.

::: code-group

```C++ [1.21.90+]
struct IEntityComponent {};

template<std::derived_from<IEntityComponent> Type>
struct entt::component_traits<Type, EntityId> {
    using element_type = Type;
    using entity_type = EntityId;
    static constexpr bool in_place_delete = true;
    static constexpr std::size_t page_size = 128 * !std::is_empty_v<Type>;
};
```

```C++ [1.20-1.21.8x]
struct IEntityComponent {};

template<std::derived_from<IEntityComponent> Type>
struct entt::component_traits<Type> {
    using type = Type;
    static constexpr bool in_place_delete = true;
    static constexpr std::size_t page_size = 128 * !std::is_empty_v<Type>;
};
```

:::

Lastly, [signal handlers](https://github.com/skypjack/entt/wiki/Entity-Component-System#observe-changes)
must be disabled for `EntityId` derived storage types, this is done by specializing `entt::storage_type`, and not
wrapping `entt::basic_storage` in `entt::sigh_mixin` (like the default specialization does).

```C++
template<typename Type>
struct entt::storage_type<Type, EntityId> {
    using type = basic_storage<Type, EntityId>;
};
```

Now you have a properly configured environment for EnTT which is
[ABI](https://en.wikipedia.org/wiki/Application_binary_interface) compatible with Minecraft: Bedrock Edition.

> [!IMPORTANT]
> All usages of EnTT within your code need to have visibility to the specializations that are provided above. An easy
> way of guaranteeing this is to put the specializations in the same header that is defining `EntityId`, as everything
> else will be dependent upon it.

## Defining Components

When defining components, there are a few key things that must be matched to the game:

1. The type name
2. The type's class/struct designation
3. The type size
4. The type's hash

### Matching the Declaration

Component names and their and class/struct designation are simple enough to find. EnTT leaves strings in all Minecraft:
Bedrock Edition binaries as part of type name stored in the static `entt::type_info<T>` instance for all components;
however, only Windows binaries compiled with MSVC will include the class/struct designation:

![type names in binary strings](/entities/entt/stripped_type_name.png)

> [!TIP]
> The majority of entity components are `struct` types. A few notable `class` exceptions are `ActorOwnerComponent` and
> `HitboxComponent`.

We'll be taking a look at `ActorEquipmentComponent` for this guide. Looking back at the screenshot with all the type
names, we can begin a definition:

```C++
struct ActorEquipmentComponent : IEntityComponent {};
```

### Finding the Size

Components are owned by a custom storage type, `entt::basic_storage<T, EntityId>`, which conveniently stores a reference
to the previously mentioned `entt::type_info<T>` instance. We can therefore use IDA's string search as a starting point:

![string search for ActorEquipmentComponent](/entities/entt/component_string_search.png)

Open the result in the IDA view and search for xrefs. There may be multiple:

![xrefs to ActorEquipmentComponent name string](/entities/entt/component_string_xrefs.png)

The containing function we're interested in should look something like the following:

![xrefs to ActorEquipmentComponent name string](/entities/entt/basic_registry-assure.png)

This is the implementation of `entt::basic_registry<EntityId>::assure<T>`. Fortunately, this is as far as we need to
look to find the vtable, as it's right there on line 37 (`off_1475E6B80`).

![entt::basic_storage<T, EntityId>::`vftable'](/entities/entt/basic_storage-vtable.png)

By disassembling the first function in the vtable, its implementation of `get_at`, we can get the size of the component.
The size can be identified by looking at the scale applied to the `(a2 & 0x7F)` term. For `ActorEquipmentComponent`,
that's `16` bytes:

![entt::basic_storage<T, EntityId>::get_at](/entities/entt/basic_storage-get_at.png)

Referencing [storage.hpp](https://github.com/skypjack/entt/blob/b4e58bdd364ad72246c123a0c28538eab3252672/src/entt/entity/storage.hpp#L237-L239)
in EnTT shows why this works:

```cpp:line-numbers=314
[[nodiscard]] const void *get_at(const std::size_t pos) const final {
    return std::addressof(element_at(pos));
}
```

```cpp:line-numbers=237
[[nodiscard]] auto &element_at(const std::size_t pos) const {
    return payload[pos / traits_type::page_size][fast_mod(pos, traits_type::page_size)];
}
```

The type of `payload` boils down to a `std::vector<T*>`, where `T` is the component type, and the elements are pointers
to allocated component pages.

### Reversing Members

Now that we have the size of the component, we can pad the definition like this:
```C++
struct ActorEquipmentComponent : IEntityComponent {
    std::byte pad[0x10];
};
static_assert(sizeof(ActorEquipmentComponent) == 0x10);
```

> [!TIP]
> Using a `static_assert` to validate the known size of a component can turn potential runtime errors into compile time
> errors.

The next logical step is to find out what those 16 bytes are actually comprised of. Depending on the component, this can
be extremely tedious, but a solid starting point is to examine the `try_get<T>` usages.

![try_get usages](/entities/entt/try_get-xrefs.png)

The first usage provides some insight, line 14 in the decompiled pseudocode contains a virtual function call being
performed on an object whose address is stored at offset 8 in the component.

![getAllArmor](/entities/entt/xref-getAllArmor.png)

Let's update the struct according to our finding:

```C++
struct ActorEquipmentComponent : IEntityComponent {
    std::byte pad[0x8];
    void* ptrToUnknownVirtualType;
};
```

The next usage provides a bit more insight, it tells us that the unknown virtual type is actually `SimpleContainer`:

![getArmorContainer](/entities/entt/xref-getArmorContainer.png)

```C++
struct ActorEquipmentComponent : IEntityComponent {
    std::byte pad[0x8];
    SimpleContainer* armorContainer;
};
```

And the next usage confirms the same about the data stored at offset 0 in the component: it's another pointer to a
`SimpleContainer`:

![getHandContainer](/entities/entt/xref-getHandContainer.png)

```C++
struct ActorEquipmentComponent : IEntityComponent {
    SimpleContainer* handContainer;
    SimpleContainer* armorContainer;
};
```

So is that it? Well, not necessarily. Entity components are intended to be owning types (they are responsible for the
lifetimes of their members) and a raw pointer does not indicate anything in regard to ownership. Additionally,
legitimate raw pointers are uncommon in Minecraft: Bedrock Edition.

> [!TIP]
> Looking at how an object is destroyed provides direct insight into the ownership model of its data members.

Referencing back to the `entt::basic_storage<T, EntityId>` vtable from earlier, we can take a look at the `pop_all`
virtual member  function to see how the component is destroyed:

![entt::basic_storage<T, EntityId>::pop_all](/entities/entt/basic_storage-pop_all.png)

If you're unfamiliar with reverse engineering Windows C++ applications compiled against the Microsoft STL, this might
not seem significant. However, it's actually indicative of a `std::unique_ptr` to a virtual type (For more on this,
[continue reading](/reverse-engineering/microsoft-stl#std-unique-ptr)).

With this information, the definition for `ActorEquipmentComponent` can be completed:

```C++
struct ActorEquipmentComponent : IEntityComponent {
    std::unique_ptr<SimpleContainer> handContainer;
    std::unique_ptr<SimpleContainer> armorContainer;
};
```

### Type Hashes

> [!NOTE]
> If you are using the compiler associated with your mod's targeted Minecraft: Bedrock Edition platform, the information
> provided in this section is not critical.
>
> For more on what compiler you should be using, [continue reading](/tools/configuring-your-compiler#picking-a-compiler).

The `entt::registry` creates a storage object for each component type. In order to retrieve the storage instance at
runtime, a hash of the component's type is used as a key into a `map<type_hash, component_storage>`. While the hash of
a type is based on the prettified name of that type, it is not portable. Consider the following example:

```C++
template<typename T>
class FlagComponent : IEntityComponent {};

struct OnGroundFlag {};
```

| Compiler  | `entt::type_name<T>::value()`                | `entt::type_hash<T>::value()` |
|:----------|:---------------------------------------------|:------------------------------|
| MSVC      | `"class FlagComponent<struct OnGroundFlag>"` | `0x211F2DE1`                  |
| GCC/Clang | `"FlagComponent<OnGroundFlag>"`              | `0x062EEC98`                  |

This discrepancy is not an issue if you're using the recommended compiler for a given Bedrock platform. However, if you
are using [Clang on Windows](/tools/clang), it does become an issue.
Clang  will produce the same type hash regardless of whether you are using it in Microsoft compatibility mode. To
work around this problem, we can specialize `entt::type_hash`.

There are many approaches to specializing `entt::type_hash` to maintain compatibility between compilers. This guide will
specifically address a solution for using Clang on Windows when developing mods for Bedrock Edition on Windows.

Building upon the previous example, let's add a few static members to our classes. For this, we'll be using
`fixed_string` provided by [libhat](https://github.com/BasedInc/libhat):

```C++
template<typename T>
class FlagComponent : IEntityComponent {
public:
    static constexpr hat::fixed_string type_name
        = "class FlagComponent<" + T::type_name + ">";
};

struct OnGroundFlag {
    static constexpr hat::fixed_string type_name
        = "struct OnGroundFlag";
};
```

> [!NOTE]
> As of 1.21.20, `FlagComponent<T>` has been flattened into dedicated classes for each flag. The example above is meant
> to show how to apply the static type name method in more complex situations.

Then create a `entt::type_hash` specialization for types derived from `IEntityComponent`:

```C++
template<std::derived_from<IEntityComponent> Type>
struct entt::type_hash<Type> {
    [[nodiscard]] static consteval id_type value() noexcept {
        constexpr auto name = Type::type_name;
        return hashed_string::value(name.data(), name.size());
    }

    [[nodiscard]] consteval operator id_type() const noexcept {
        return value();
    }
};
```

## Using Components

### EntityContext

Minecraft's `EntityContext` class encapsulates the required state for accessing an entity's components.

::: code-group

```C++ [1.20.50+]
struct EntityRegistry : std::enable_shared_from_this<EntityRegistry> {
    std::string name;
    entt::basic_registry<EntityId> registry;
    uint32_t id;
};

struct EntityContext {
    EntityRegistry& registry;
    entt::basic_registry<EntityId>& enttRegistry;
    EntityId entity;
};
```

```C++ [1.20-1.20.4x]
struct EntityRegistryBase {
    entt::basic_registry<EntityId>& registry;
    uint32_t id;
};

struct EntityRegistry : EntityRegistryBase, std::enable_shared_from_this<EntityRegistry> {
    std::string name;
    entt::basic_registry<EntityId> ownedRegistry;
};

struct EntityContextBase {
    EntityRegistryBase& registry;
    EntityId entity;
};

struct EntityContext : EntityContextBase {
    entt::basic_registry<EntityId>& getEnttRegistry() const {
        return static_cast<EntityRegistry&>(this->registry).ownedRegistry;
    }
};
```

:::

> [!NOTE]
> For simplicity, these game classes are expressed as structs to imply public visibility. The actual type designation
> and member visibility may vary from Minecraft's actual source code.

Samples from this point on will be based on the most recent revision of the relevant Minecraft ABI (Currently 1.20.50+).
If you are developing for a different Minecraft release, slight modifications may be required.

We can define a few helper functions for accessing and modifying components:
```C++
struct EntityContext {
    // ... fields omitted ...

    template<std::derived_from<IEntityComponent> T>
    [[nodiscard]] T* tryGetComponent() {
        return this->enttRegistry.try_get<T>(this->entity);
    }

    template<std::derived_from<IEntityComponent> T>
    [[nodiscard]] const T* tryGetComponent() const {
        return this->enttRegistry.try_get<T>(this->entity);
    }

    template<std::derived_from<IEntityComponent> T>
    [[nodiscard]] bool hasComponent() const {
        return this->enttRegistry.all_of<T>(this->entity);
    }

    template<std::derived_from<IEntityComponent> T>
    T& getOrAddComponent() {
        return this->enttRegistry.get_or_emplace<T>(this->entity);
    }

    template<std::derived_from<IEntityComponent> T>
    void removeComponent() {
        this->enttRegistry.remove<T>(this->entity);
    }
};
```

> [!WARNING]
> Both `getOrAddComponent` and `removeComponent` call the non-const version of `entt::basic_registry<...>::assure<T>`.
> If either of these functions are called before storage for the component `T` has been created by Minecraft, the
> storage will be created by your mod. The undesired consequence of this is that the storage object's virtual function
> table will be located in the read-only data section of your mod's binary. Unloading the mod after this point will
> cause a game crash. While there are methods to prevent this error, this guide does not currently address them.

### Actors

Now that we have a definition of `EntityContext`, we need to be able to access an instance of it for Actors.
Fortunately, this is an easy task:

```C++
class Actor {
public:
    /* this + 0x0 */ Actor_vtbl* __vftable; // Compiler generated
    /* this + 0x8 */ EntityContext entity;
    // ... fields omitted ...
};
```

If defining the actual struct for `Actor` isn't preferred, [libhat](https://github.com/BasedInc/libhat) provides
`hat::member_at`, a utility function for accessing members from class data offsets.

```C++
class Actor {
public:
    // Utilize C++23's explicit this object parameter
    // to avoid writing const and non-const overloads 
    [[nodiscard]] auto& getEntity(this auto& self) {
        return hat::member_at<EntityContext>(&self, 0x8);
    }
};
```

Now if we obtain an instance of an `Actor`, such as the client's local player, accessing components is simple:

::: code-group

```C++ [1.21.20+]
void onLevelTick() {
    EntityContext& entity = clientInstance->getLocalPlayer().getEntity();
    
    if (player.hasComponent<OnGroundFlagComponent>()) {
        logToChat("Player is on the ground");
    }

    if (auto* svc = player.tryGetComponent<StateVectorComponent>(); svc) {
        logToChat("Player is at {}", svc->pos);
    }
}
```

```C++ [1.20-1.21.2]
void onLevelTick() {
    EntityContext& entity = clientInstance->getLocalPlayer().getEntity();
    
    if (player.hasComponent<FlagComponent<OnGroundFlag>>()) {
        logToChat("Player is on the ground");
    }

    if (auto* svc = player.tryGetComponent<StateVectorComponent>(); svc) {
        logToChat("Player is at {}", svc->pos);
    }
}
```

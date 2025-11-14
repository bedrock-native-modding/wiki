import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "wiki",
  title: "Bedrock Native Modding Wiki",
  description: "A knowledge hub for making native mods for Minecraft: Bedrock Edition",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' }
    ],
    sidebar: [
      {
        text: 'Beginner\'s Guide',
        collapsed: true,
        items: [
          { text: 'Introduction', link: '/beginners-guide/introduction' },
          { text: 'Development Setup', link: '/beginners-guide/development-setup' },
          { text: 'Getting Started', link: '/beginners-guide/getting-started' },
          { text: 'Your First Hook', link: '/beginners-guide/your-first-hook' }
        ]
      },
      {
        text: 'Tools',
        collapsed: true,
        items: [
          { text: 'Clang', link: '/tools/clang' },
          { text: 'Using ld to embed resources', link: '/tools/ld-for-embedding-resources' },
          { text: 'RenderDoc', link: '/tools/renderdoc' },
        ]
      },
      {
        text: 'Topics',
        collapsed: true,
        items: [
          { text: 'GDK', link: '/topics/gdk' },
          { text: 'UWP', link: '/topics/uwp' }
        ]
      },
      {
        text: 'Rendering',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/rendering/overview' }
        ]
      },
      {
        text: 'Reverse Engineering',
        collapsed: true,
        items: [
          {text: 'Introduction', link:'/reverse-engineering/introduction'},
          {text: 'Using IDA', link: '/reverse-engineering/using-ida'}
        ]

      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bedrock-native-modding/wiki' }
    ],
    search: {
      provider: 'local'
    },
    externalLinkIcon: true,
    lastUpdated: true,
  },
  base: '/wiki/'
})

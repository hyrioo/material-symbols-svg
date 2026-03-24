import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'Material Symbols SVG',
    description: 'Docs for @hyrioo/vite-plugin-material-symbols-svg and @hyrioo/vue-material-symbol',
    base: '/material-symbols-svg/',
    lastUpdated: true,
    vite: {
        server: {
            allowedHosts: ['material-symbols.test'],
        },
    },
    themeConfig: {
        nav: [
            {
                text: 'Guide',
                items: [
                    {text: 'Home', link: '/'},
                    {text: 'Overall Value', link: '/introduction/value'},
                    {text: 'Installation', link: '/introduction/installation'},
                ],
            },
            {
                text: 'Packages',
                items: [
                    {
                        text: '@hyrioo/vite-plugin-material-symbols-svg',
                        items: [
                            {text: 'Overview', link: '/packages/vite-plugin-material-symbols-svg/'},
                            {
                                text: 'Vite Configuration',
                                link: '/packages/vite-plugin-material-symbols-svg/vite-configuration',
                            },
                        ],
                    },
                    {
                        text: '@hyrioo/vue-material-symbol',
                        items: [
                            {text: 'Overview', link: '/packages/vue-material-symbol/'},
                            {text: 'Define Icons', link: '/packages/vue-material-symbol/define-icons'},
                            {text: 'Defaults', link: '/packages/vue-material-symbol/defaults'},
                            {text: 'Props', link: '/packages/vue-material-symbol/props'},
                            {text: 'Examples', link: '/packages/vue-material-symbol/examples'},
                        ],
                    },
                ],
            },
        ],
        search: {
            provider: 'local',
        },
        sidebar: [
            {
                text: 'Introduction',
                items: [
                    {text: 'Overall Value', link: '/introduction/value'},
                    {text: 'Installation', link: '/introduction/installation'},
                ],
            },
            {
                text: 'Vue component',
                items: [
                    {text: 'Overview', link: '/packages/vue-material-symbol/'},
                    {text: 'Define Icons', link: '/packages/vue-material-symbol/define-icons'},
                    {text: 'Defaults', link: '/packages/vue-material-symbol/defaults'},
                    {text: 'Props', link: '/packages/vue-material-symbol/props'},
                    {text: 'Examples', link: '/packages/vue-material-symbol/examples'},
                ],
            },
            {
                text: 'Vite plugin',
                items: [
                    {text: 'Overview', link: '/packages/vite-plugin-material-symbols-svg/'},
                    {
                        text: 'Vite Configuration',
                        link: '/packages/vite-plugin-material-symbols-svg/vite-configuration',
                    },
                ],
            },
        ],
        socialLinks: [{icon: 'github', link: 'https://github.com/hyrioo/material-symbols-svg'}],
    },
});

import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'T_Lib Docs',
  tagline: 'Hasta la vista, Baby',
  favicon: 'img/favicon.ico',

  url: 'https://Brody9185.github.io',
  baseUrl: '/T_Lib/',

  organizationName: 'Brody9185', 
  projectName: 'T_Lib', 
  deploymentBranch: 'gh-pages', // Added this for clarity
  trailingSlash: false,         // Recommended for GitHub Pages

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Points to your actual repo so "Edit this page" works
          editUrl: 'https://github.com/Brody9185/T_Lib/tree/main/website/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/Brody9185/T_Lib/tree/main/website/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'T_Lib',
      logo: {
        alt: 'T_Lib Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/Brody9185/T_Lib',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/Brody9185/T_Lib/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Brody9185/T_Lib',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Brody9185. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      // Added C++ highlighting since this is a robotics lib
      additionalLanguages: ['cpp'], 
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
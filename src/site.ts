// One place to edit everything site-wide. Change these to your details.
export const SITE = {
  name: 'devnetauto',
  // Shown in the header prompt: <user>@devnetauto:~$
  promptUser: 'boyd',
  title: 'DevNetAuto',
  tagline: 'Production network automation, written down.',
  // Used for meta tags, RSS, and the footer.
  description:
    'War stories and field notes on production network automation — Nautobot, Golden Config, SSoT, SD-WAN, and the pipelines that hold it all together.',
  author: 'Boyd Tweed',
  // Your real domain. Must match astro.config.mjs `site`.
  url: 'https://devnetauto.com',
  nav: [
    { label: 'writing', href: '/' },
    { label: 'about', href: '/about' },
    { label: 'rss', href: '/rss.xml' },
  ],
  social: {
    linkedin: 'https://www.linkedin.com/in/boyd-tweed-b4672519/',
    github: 'https://github.com/ttweed98',
  },
};

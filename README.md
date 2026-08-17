# iankingh.github.io redirect

This repository contains the root page for `iankingh.github.io`. Its
`index.html` redirects browsers with an HTML refresh and JavaScript to:

`https://iankingh.github.io/blog/`

The destination site and its GitHub Pages workflow are maintained separately
in [`iankingh/blog`](https://github.com/iankingh/blog). The
[`iankingh/hugo-theme-next-starter`](https://github.com/iankingh/hugo-theme-next-starter)
repository is only a reusable Hugo NexT example, and `iankingh/iankingh` is the
GitHub profile README.

## Maintenance

There is no build step, dependency manifest, submodule, custom domain file, or
deployment workflow in this repository. `index.html` is the complete site; any
GitHub Pages publishing configuration is repository-side configuration and is
not represented here.

To change the destination, update the canonical link, HTML refresh, JavaScript
redirect, and fallback link in `index.html`. Visitors who cannot be redirected
automatically can follow the fallback link.

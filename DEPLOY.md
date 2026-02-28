## How to Make a Release

### Build
- **Checkout dev branch.** This will contain work queued up for the next release.
- **Update version number.** Manually update version number in `src/js/lightbox.js` and `package.json`. Don't use `npm version`.
- **Build and merge to `master`.** Run `npm install` then `npm run build`. Push to `master`.

### Release
- **Create tagged release.** Go to [Github Releases page](https://github.com/lokesh/lightbox2/releases). Draft a new release. Naming convention is `v2.8.1`. Add notes that link to PRs.
- **`npm publish`**.

### Maintenance and Docs
- **GH clean-up.** Close out issues with `[status] pending release`.
- **Lightbox Site.** If there are any changes to the options, don't forget to update the [Lightbox Site](http://localhost:8000/dist/#options). The code lives in a separate repo, [lightbox2-site](https://github.com/lokesh/lightbox2-site/).

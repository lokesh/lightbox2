## How to make a release and deploy

- **Checkout dev branch.** This will contain work queued up for the next release.
- **Update version number.** Manually update version number in `src/lightbox.js` and `package.json`. Don't use `npm version`.
- **Run `grunt build`.** Make sure you have run `bower install` ahead of this as it will pull down jQuery which is utilized in the build step.
- **Merge to `master`.** Commit changes and push to new branch. Create PR from this branch to `master`. Merge.
- **Create tagged release.** Go to [Github Releases page](https://github.com/lokesh/lightbox2/releases). Draft a new release. Naming convention is `v2.8.1`.
- Run `npm publish`

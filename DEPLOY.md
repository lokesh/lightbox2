## How to make a release and deploy

- **Checkout dev branch.** This will contain work queued up for the next release.
- **Update version number.** Manually update version number in `src/lightbox.js` and `package.json`. Don't use `npm version`.
- **`grunt build`.** Make sure you have run `bower install` ahead of this as it will pull down jQuery which is utilized in the build step.
- **Merge to `master`.** Commit changes and push to new branch. Create PR from this branch to `master`. Merge.
- **Create tagged release.** Go to [Github Releases page](https://github.com/lokesh/lightbox2/releases). Draft a new release. Naming convention is `v2.8.1`. Add notes that link to PRs.
- **`npm publish`**. No need to do anything for Bower as it is entirely based on the Github repo.
- **GH clean-up.** Close out issues with `[status] pending release`.

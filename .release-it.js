module.exports = {
  git: {
    commitMessage: 'chore: release v${version}',
    changelog:
      'npx auto-changelog --stdout --commit-limit false -u --template https://raw.githubusercontent.com/release-it/release-it/master/templates/changelog-compact.hbs',
    tag: true,
    tagName: 'v${version}',
    tagMatch: null,
    tagAnnotation: 'Release v${version}',
    push: true,
  },
  npm: {
    publish: true,
  },
};

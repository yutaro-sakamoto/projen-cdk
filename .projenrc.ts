import { cdk, github } from 'projen';
const repoUrl = 'https://github.com/yutaro-sakamoto/projen-cdk.git';
const project = new cdk.JsiiProject({
  author: 'Yutaro Sakamoto',
  authorAddress: 'yutaro-sakamoto@yutaro-sakamoto.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  projenrcTs: true,

  name: '@yutaro-sakamoto/projen-cdk', // Scope the package to your GitHub username
  repositoryUrl: repoUrl, // Required for GitHub Packages
  repository: repoUrl, // Required for GitHub Packages
  npmRegistryUrl: 'https://npm.pkg.github.com', // Required for GitHub Packages
  releaseToNpm: true, // Required for GitHub Packages
  depsUpgradeOptions: {
    workflowOptions: {
      projenCredentials:
        github.GithubCredentials.fromPersonalAccessToken({ secret: 'GITHUB_TOKEN' }),
    },
  },
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
  devDeps: ['projen'],
  peerDeps: ['projen'],
});
project.synth();
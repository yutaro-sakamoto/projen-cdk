import { cdk, github } from 'projen';
const repoUrl = 'https://github.com/yutaro-sakamoto/projen-cdk';
const project = new cdk.JsiiProject({
  author: 'Yutaro Sakamoto',
  authorAddress: 'yutaro-sakamoto@yutaro-sakamoto.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  name: '@yutaro-sakamoto/projen-cdk',
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
  projenrcTs: true,

  deps: ['projen'], /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
  devDeps: ['projen'],
  peerDeps: ['projen'],
});

//const publisher = new release.Publisher(project, {
//  buildJobId: 'my-build-job',
//  artifactName: 'dist',
//});
//
//publisher.publishToNpm({
//  registry: 'npm.pkg.github.com',
//  // also sets npmTokenSecret
//});

project.synth();